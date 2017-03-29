define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'modules/models-customer',
    'modules/models-address',
    'modules/models-paymentmethods',
    'hyprlivecontext'
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods, HyprLiveContext) {

        var CheckoutStep = Backbone.MozuModel.extend({
            helpers: ['stepStatus', 'requiresFulfillmentInfo', 'requiresDigitalFulfillmentContact'],  //
            // instead of overriding constructor, we are creating
            // a method that only the CheckoutStepView knows to
            // run, so it can run late enough for the parent
            // reference in .getOrder to exist;
            initStep: function () {
                var me = this;
                this.next = (function(next) {
                    return _.debounce(function() {
                        if (!me.isLoading()) next.call(me);
                    }, 750, true);
                })(this.next);
                var order = me.getOrder();
                me.calculateStepStatus();
                me.listenTo(order, 'error', function () {
                    if (me.isLoading()) {
                        me.isLoading(false);
                    }
                });
                me.set('orderId', order.id);
                if (me.apiModel) me.apiModel.on('action', function (name, data) {
                    if (data) {
                        data.orderId = order.id;
                    } else {
                        me.apiModel.prop('orderId', order.id);
                    }
                });
            },
            calculateStepStatus: function () {
                // override this!
                var newStepStatus = this.isValid(!this.stepStatus()) ? 'complete' : 'invalid';
                return this.stepStatus(newStepStatus);
            },
            getOrder: function () {
                return this.parent;
            },
            stepStatus: function (newStatus) {
                if (arguments.length > 0) {
                    this._stepStatus = newStatus;
                    this.trigger('stepstatuschange', newStatus);
                }
                return this._stepStatus;
            },
            requiresFulfillmentInfo: function () {
                return this.getOrder().get('requiresFulfillmentInfo');
            },
            requiresDigitalFulfillmentContact: function () {
                return this.getOrder().get('requiresDigitalFulfillmentContact');
            },
            edit: function () {
                this.stepStatus('incomplete');
            },
            next: function () {
                if (this.submit()) this.isLoading(true);
            }
        }),

        FulfillmentContact = CheckoutStep.extend({
            relations: CustomerModels.Contact.prototype.relations,
            validation: CustomerModels.Contact.prototype.validation,
            digitalOnlyValidation: {
                'email': {
                    pattern: 'email',
                    msg: Hypr.getLabel('emailMissing')
                } 
            },
            dataTypes: {
                contactId: function(val) {
                    return (val === 'new') ? val : Backbone.MozuModel.DataTypes.Int(val);
                }
            },
            helpers: ['contacts'],
            contacts: function () {
                var contacts = this.getOrder().get('customer').get('contacts').toJSON();
                return contacts && contacts.length > 0 && contacts;
            },
            initialize: function () {
                var self = this;
                this.on('change:contactId', function (model, newContactId) {
                    if (!newContactId || newContactId === 'new') {
                        model.get('address').clear();
                        model.get('phoneNumbers').clear();
                        model.unset('id');
                        model.unset('firstName');
                        model.unset('lastNameOrSurname');
                    } else {
                        model.set(model.getOrder().get('customer').get('contacts').get(newContactId).toJSON(), {silent: true});
                    }
                });
            },
            calculateStepStatus: function () {
                if (!this.requiresFulfillmentInfo() && this.requiresDigitalFulfillmentContact()) {
                    this.validation = this.digitalOnlyValidation;
                }

                if (!this.requiresFulfillmentInfo() && !this.requiresDigitalFulfillmentContact()) return this.stepStatus('complete');
                return CheckoutStep.prototype.calculateStepStatus.apply(this);
            },
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            choose: function (e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            },
            toJSON: function () {
                if (this.requiresFulfillmentInfo() || this.requiresDigitalFulfillmentContact()) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
            },
            isDigitalValid: function() {
                var email = this.get('email');
                return (!email) ? false : true;
            },
            nextDigitalOnly: function () {
                var order = this.getOrder(),
                    me = this;
                if (this.validate()) return false;
                this.getOrder().apiModel.update({ fulfillmentInfo: me.toJSON() }).ensure(function () {
                    me.isLoading(false);
                    order.messages.reset();
                    order.syncApiModel();

                    me.calculateStepStatus();
                    return order.get('billingInfo').calculateStepStatus();
                });
            },
            next: function () {
                if (!this.requiresFulfillmentInfo() && this.requiresDigitalFulfillmentContact()) {
                    return this.nextDigitalOnly();
                }

                var validationObj = this.validate();

                if (validationObj) { 
                    Object.keys(validationObj).forEach(function(key){
                        this.trigger('error', {message: validationObj[key]});
                    }, this);

                    return false;
                }

               var parent = this.parent,
                    order = this.getOrder(),
                    me = this,
                    isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;
                this.isLoading(true);
                var addr = this.get('address');
                var completeStep = function () {
                    order.messages.reset();
                    order.syncApiModel();
                    me.isLoading(true);
                    order.apiModel.getShippingMethodsFromContact().then(function (methods) {
                        return parent.refreshShippingMethods(methods);
                    }).ensure(function () {
                        addr.set('candidateValidatedAddresses', null);
                        me.isLoading(false);
                        parent.isLoading(false);
                        me.calculateStepStatus();
                        parent.calculateStepStatus();
                    });                  
                };

                var promptValidatedAddress = function () {
                    order.syncApiModel();
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.stepStatus('invalid');
                };

                if (!isAddressValidationEnabled) {
                    completeStep();
                } else {
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                        addr.syncApiModel();
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    addr.set('isValidated', true);
                                        completeStep();
                                        return;
                                    }
                                addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                promptValidatedAddress();
                            } else {
                                completeStep();
                            }
                        }, function (e) {
                            if (allowInvalidAddresses) {
                                // TODO: sink the exception.in a better way.
                                order.messages.reset();
                                completeStep();
                            } else {
                                order.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                            }
                        });
                    } else {
                        completeStep();
                    }
                }
            }
        }),

        FulfillmentInfo = CheckoutStep.extend({
            initialize: function () {
                var me = this;
                this.on('change:availableShippingMethods', function (me, value) {
                    me.updateShippingMethod(me.get('shippingMethodCode'), true);
                });
                _.defer(function () {
                    // This adds the price and other metadata off the chosen
                    // method to the info object itself.
                    // This can only be called after the order is loaded
                    // because the order data will impact the shipping costs.
                    me.updateShippingMethod(me.get('shippingMethodCode'), true);
                });
            },
            relations: {
                fulfillmentContact: FulfillmentContact
            },
            validation: {
                shippingMethodCode: {
                    required: true,
                    msg: Hypr.getLabel('chooseShippingMethod')
                }
            },
            refreshShippingMethods: function (methods) {
                this.set({
                    availableShippingMethods: methods
                });

                // always make them choose again
                _.each(['shippingMethodCode', 'shippingMethodName'], this.unset, this);

                // after unset we need to select the cheapest option
                this.updateShippingMethod();
            },
            calculateStepStatus: function () {
                // If no shipping required, we're done.
                if (!this.requiresFulfillmentInfo()) return this.stepStatus('complete');

                // If there's no shipping address yet, go blank.
                if (this.get('fulfillmentContact').stepStatus() !== 'complete') {
                    return this.stepStatus('new');
                }

                // Incomplete status for shipping is basically only used to show the Shipping Method's Next button,
                // which does nothing but show the Payment Info step.
                var billingInfo = this.parent.get('billingInfo');
                if (!billingInfo || billingInfo.stepStatus() === 'new') return this.stepStatus('incomplete');

                // Payment Info step has been initialized. Complete status hides the Shipping Method's Next button.
                return this.stepStatus('complete');
            },
            updateShippingMethod: function (code, resetMessage) {
                var available = this.get('availableShippingMethods'),
                    newMethod = _.findWhere(available, { shippingMethodCode: code }),
                    lowestValue = _.min(available, function(ob) { return ob.price; }); // Returns Infinity if no items in collection.

                if (!newMethod && available && available.length && lowestValue) {
                    newMethod = lowestValue;
                }
                if (newMethod) {
                    this.set(newMethod);
                    this.applyShipping(resetMessage);
                }
            },
            applyShipping: function(resetMessage) {
                if (this.validate()) return false;
                var me = this;
                this.isLoading(true);
                var order = this.getOrder();
                if (order) {
                    order.apiModel.update({ fulfillmentInfo: me.toJSON() })
                        .then(function (o) {
                            var billingInfo = me.parent.get('billingInfo');
                            if (billingInfo) {
                                billingInfo.loadCustomerDigitalCredits();
                                // This should happen only when order doesn't have payments..
                                billingInfo.updatePurchaseOrderAmount();
                            }
                        })
                        .ensure(function() {
                            me.isLoading(false);
                            me.calculateStepStatus();
                            me.parent.get('billingInfo').calculateStepStatus();
                            if(resetMessage) {
                                me.parent.messages.reset(me.parent.get('messages'));
                            }
                        });
                }
            },
            next: function () {
                this.stepStatus('complete');
                this.parent.get('billingInfo').calculateStepStatus();
            }
        }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                paymentType: {

                    fn: "validatePaymentType"
                },
                savedPaymentMethodId: {
                    fn: "validateSavedPaymentMethodId"
                },

                'billingContact.email': {
                    pattern: 'email',
                    msg: Hypr.getLabel('emailMissing')
                }
            },
            dataTypes: {
                'isSameBillingShippingAddress': Backbone.MozuModel.DataTypes.Boolean,
                'creditAmountToApply': Backbone.MozuModel.DataTypes.Float
            },
            relations: {
                billingContact: CustomerModels.Contact,
                card: PaymentMethods.CreditCardWithCVV,
                check: PaymentMethods.Check,
                purchaseOrder: PaymentMethods.PurchaseOrder
            },
            validatePaymentType: function(value, attr) {
                var order = this.getOrder();
                var payment = order.apiModel.getCurrentPayment();
                var errorMessage = Hypr.getLabel('paymentTypeMissing');
                if (!value) return errorMessage;
                if ((value === "StoreCredit" || value === "GiftCard") && this.nonStoreCreditTotal() > 0 && !payment) return errorMessage;

            },
            validateSavedPaymentMethodId: function (value, attr, computedState) {
                if (this.get('usingSavedCard')) {
                    var isValid = this.get('savedPaymentMethodId');
                    if (!isValid) return Hypr.getLabel('selectASavedCard');
                }

            },
            helpers: ['acceptsMarketing', 'savedPaymentMethods', 'availableStoreCredits', 'applyingCredit', 'maxCreditAmountToApply',
              'activeStoreCredits', 'nonStoreCreditTotal', 'activePayments', 'hasSavedCardPayment', 'availableDigitalCredits', 'digitalCreditPaymentTotal', 'isAnonymousShopper', 'visaCheckoutFlowComplete'],
            acceptsMarketing: function () {
                return this.getOrder().get('acceptsMarketing');
            },
            visaCheckoutFlowComplete: function() {
                return this.get('paymentWorkflow') === 'VisaCheckout';
            },
            cancelVisaCheckout: function() {
                var self = this;
                var order = this.getOrder();
                var currentPayment = order.apiModel.getCurrentPayment();
                return order.apiVoidPayment(currentPayment.id).then(function() {
                    self.clear();
                    self.stepStatus('incomplete');
                    // need to re-enable purchase order information if purchase order is available.
                    self.setPurchaseOrderInfo();
                    // Set the defualt payment method for the customer.
                    self.setDefaultPaymentType(self);
                });
            },
            activePayments: function () {
                return this.getOrder().apiModel.getActivePayments();
            },
            hasSavedCardPayment: function() {
                var currentPayment = this.getOrder().apiModel.getCurrentPayment();
                return !!(currentPayment && currentPayment.billingInfo.card && currentPayment.billingInfo.card.paymentServiceCardId);
            },
            nonStoreCreditTotal: function () {
                var me = this,
                    order = this.getOrder(),
                    total = order.get('total'),
                    result,
                    activeCredits = this.activeStoreCredits();
                if (!activeCredits) return total;
                result = total - _.reduce(activeCredits, function (sum, credit) {
                    return sum + credit.amountRequested;
                }, 0);
                return me.roundToPlaces(result, 2);
            },
            resetAddressDefaults: function () {
                var billingAddress = this.get('billingContact').get('address');
                var addressDefaults = billingAddress.defaults;
                billingAddress.set('countryCode', addressDefaults.countryCode);
                billingAddress.set('addressType', addressDefaults.addressType);
                billingAddress.set('candidateValidatedAddresses', addressDefaults.candidateValidatedAddresses);
            },
            savedPaymentMethods: function () {
                var cards = this.getOrder().get('customer').get('cards').toJSON();
                return cards && cards.length > 0 && cards;
            },
            activeStoreCredits: function () {
                var active = this.getOrder().apiModel.getActiveStoreCredits();
                return active && active.length > 0 && active;
            },
            availableStoreCredits: function () {
                var order = this.getOrder(),
                    customer = order.get('customer'),
                    credits = customer && customer.get('credits'),
                    usedCredits = this.activeStoreCredits(),
                    availableCredits = credits && _.compact(_.map(credits.models, function (credit) {
                        if (!(credit.creditType === 'StoreCredit' || credit.creditType === 'GiftCard'))
                            return false;
                        credit = _.clone(credit);
                        if (usedCredits) _.each(usedCredits, function (uc) {
                            if (uc.billingInfo.storeCreditCode === credit.code) {
                                credit.currentBalance -= uc.amountRequested;
                            }
                        });
                        return credit.currentBalance > 0 ? credit : false;
                    }));
                return availableCredits && availableCredits.length > 0 && availableCredits;
            },

            applyingCredit: function () {
                return this._applyingCredit;
            },
            maxCreditAmountToApply: function () {
                var order = this.getOrder(),
                    total = order.get('amountRemainingForPayment'),
                    applyingCredit = this.applyingCredit();
                if (applyingCredit) return Math.min(applyingCredit.currentBalance, total).toFixed(2);
            },
            beginApplyCredit: function () {
                var selectedCredit = this.get('selectedCredit');
                this._oldPaymentType = this.get('paymentType');
                if (selectedCredit) {
                    var applyingCredit = _.findWhere(this.availableStoreCredits(), { code: selectedCredit });
                    if (applyingCredit) {
                        this._applyingCredit = applyingCredit;
                        this.set('creditAmountToApply', this.maxCreditAmountToApply());
                    }
                }
            },            
            closeApplyCredit: function () {
                delete this._applyingCredit;
                this.unset('selectedCredit');
                this.set('paymentType', this._oldPaymentType);
            },
            finishApplyCredit: function () {
                var self = this,
                    order = self.getOrder();
                return order.apiAddStoreCredit({
                    storeCreditCode: this.get('selectedCredit'),
                    amount: this.get('creditAmountToApply')
                }).then(function (o) {
                    order.set(o.data);
                    self.closeApplyCredit();
                    return order.update();
                });
            },
            // digital

            onCreditAmountChanged: function(digCredit, amt) {
                this.applyDigitalCredit(digCredit.get('code'), amt);
            },

            loadCustomerDigitalCredits: function () {
                var self = this,
                    order = this.getOrder(),
                    customer = order.get('customer'),
                    activeCredits = this.activeStoreCredits();

                var customerCredits = customer.get('credits');
                if (customerCredits && customerCredits.length > 0) {
                    var currentDate = new Date(),
                        unexpiredDate = new Date(2076, 6, 4);

                    // todo: refactor so conversion & get can re-use - Greg Murray on 2014-07-01 
                    var invalidCredits = customerCredits.filter(function(cred) {
                        var credBalance = cred.get('currentBalance'),
                            credExpDate = cred.get('expirationDate');
                        var expDate = (credExpDate) ? new Date(credExpDate) : unexpiredDate;
                        return (!credBalance || credBalance <= 0 || expDate < currentDate);
                    });
                    _.each(invalidCredits, function(inv) {
                        customerCredits.remove(inv);
                    });
                }
                self._cachedDigitalCredits = customerCredits;

                if (activeCredits) {
                    var userEnteredCredits = _.filter(activeCredits, function(activeCred) {
                        var existingCustomerCredit = self._cachedDigitalCredits.find(function(cred) {
                            return cred.get('code').toLowerCase() === activeCred.billingInfo.storeCreditCode.toLowerCase();
                        });
                        if (!existingCustomerCredit) {
                            return true;
                        }
                        //apply pricing update.
                        existingCustomerCredit.set('isEnabled', true);
                        existingCustomerCredit.set('creditAmountApplied', activeCred.amountRequested);
                        existingCustomerCredit.set('remainingBalance', existingCustomerCredit.calculateRemainingBalance());
                        return false;
                    });
                    if (userEnteredCredits) {
                        this.convertPaymentsToDigitalCredits(userEnteredCredits, customer);
                    }
                }

            },

            convertPaymentsToDigitalCredits: function(activeCredits, customer) {
                var me = this;
                _.each(activeCredits, function (activeCred) {
                    var currentCred = activeCred;
                    return me.retrieveDigitalCredit(customer, currentCred.billingInfo.storeCreditCode, me, currentCred.amountRequested).then(function(digCredit) {
                        me.trigger('orderPayment', me.getOrder().data, me);
                        return digCredit;
                    });
                });
            },

            availableDigitalCredits: function () {
                if (! this._cachedDigitalCredits) { 
                    this.loadCustomerDigitalCredits();
                }
                return this._cachedDigitalCredits && this._cachedDigitalCredits.length > 0 && this._cachedDigitalCredits;
            },

            refreshBillingInfoAfterAddingStoreCredit: function (order, updatedOrder) {
                var self = this;
                //clearing existing order billing info because information may have been removed (payment info) #68583

                // #73389 only refresh if the payment requirement has changed after adding a store credit.
                var activePayments = this.activePayments();
                var hasNonStoreCreditPayment = (_.filter(activePayments, function (item) { return item.paymentType !== 'StoreCredit'; })).length > 0;
                if ((order.get('amountRemainingForPayment') >= 0 && !hasNonStoreCreditPayment) ||
                    (order.get('amountRemainingForPayment') < 0 && hasNonStoreCreditPayment)
                    ) {
                    order.get('billingInfo').clear();
                    order.set(updatedOrder, { silent: true });
                }
                self.setPurchaseOrderInfo();
                self.setDefaultPaymentType(self);
                self.trigger('orderPayment', updatedOrder, self);

            },

            applyDigitalCredit: function (creditCode, creditAmountToApply, isEnabled) {
                var self = this,
                    order = self.getOrder(),
                    maxCreditAvailable = null;

                this._oldPaymentType = this.get('paymentType');
                var digitalCredit = this._cachedDigitalCredits.filter(function(cred) {
                     return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });

                if (! digitalCredit || digitalCredit.length === 0) {
                    return self.deferredError(Hypr.getLabel('digitalCodeAlreadyUsed', creditCode), self);
                }
                digitalCredit = digitalCredit[0];
                var previousAmount = digitalCredit.get('creditAmountApplied');
                var previousEnabledState = digitalCredit.get('isEnabled');

                if (!creditAmountToApply && creditAmountToApply !== 0) {
                    creditAmountToApply = self.getMaxCreditToApply(digitalCredit, self);
                }
                
                digitalCredit.set('creditAmountApplied', creditAmountToApply);
                digitalCredit.set('remainingBalance',  digitalCredit.calculateRemainingBalance());
                digitalCredit.set('isEnabled', isEnabled);

                //need to round to prevent being over total by .01
                if (creditAmountToApply > 0) {
                    creditAmountToApply = self.roundToPlaces(creditAmountToApply, 2);
                }

                var activeCreditPayments = this.activeStoreCredits();
                if (activeCreditPayments) {
                    //check if payment applied with this code, remove
                    var sameCreditPayment = _.find(activeCreditPayments, function (cred) {
                        return cred.status !== 'Voided' && cred.billingInfo && cred.billingInfo.storeCreditCode.toLowerCase() === creditCode.toLowerCase();
                    });

                    if (sameCreditPayment) {
                        if (this.areNumbersEqual(sameCreditPayment.amountRequested, creditAmountToApply)) {
                            var deferredSameCredit = api.defer();
                            deferredSameCredit.reject();
                            return deferredSameCredit.promise;
                        }
                        if (creditAmountToApply === 0) {
                            return order.apiVoidPayment(sameCreditPayment.id).then(function(o) {
                                order.set(o.data);
                                self.setPurchaseOrderInfo();
                                self.setDefaultPaymentType(self);
                                self.trigger('orderPayment', o.data, self);
                                return o;
                            });
                        } else {
                            maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self, sameCreditPayment.amountRequested);
                            if (creditAmountToApply > maxCreditAvailable) {
                                digitalCredit.set('creditAmountApplied', previousAmount);
                                digitalCredit.set('isEnabled', previousEnabledState);
                                digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                                return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                            }
                            return order.apiVoidPayment(sameCreditPayment.id).then(function (o) {
                                order.set(o.data);
                                
                                return order.apiAddStoreCredit({
                                    storeCreditCode: creditCode,
                                    amount: creditAmountToApply
                                }).then(function (o) {
                                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                                    return o;
                                });
                            });
                        }
                    }
                }
                if (creditAmountToApply === 0) {
                    return this.getOrder();
                }

                maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self);
                if (creditAmountToApply > maxCreditAvailable) {
                    digitalCredit.set('creditAmountApplied', previousAmount);
                    digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                    digitalCredit.set('isEnabled', previousEnabledState);
                    return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                }

                return order.apiAddStoreCredit({
                    storeCreditCode: creditCode,
                    amount: creditAmountToApply,
                    email: self.get('billingContact').get('email')
                }).then(function (o) {
                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                    return o;
                });
            },

            deferredError: function deferredError(msg, scope) {
                scope.trigger('error', {
                    message: msg
                });
                var deferred = api.defer();
                deferred.reject();

                return deferred.promise;
            },

            areNumbersEqual: function(f1, f2) {
                var epsilon = 0.01; 
                return (Math.abs(f1 - f2)) < epsilon; 
            },

            retrieveDigitalCredit: function (customer, creditCode, me, amountRequested) {
                var self = this;
                return customer.apiGetDigitalCredit(creditCode).then(function (credit) {
                    var creditModel = new PaymentMethods.DigitalCredit(credit.data);
                    creditModel.set('isTiedToCustomer', false);

                    var validateCredit = function() {
                        var now = new Date(),
                            activationDate = creditModel.get('activationDate') ? new Date(creditModel.get('activationDate')) : null,
                            expDate = creditModel.get('expirationDate') ? new Date(creditModel.get('expirationDate')) : null;
                        if (expDate && expDate < now) {
                            return self.deferredError(Hypr.getLabel('expiredCredit', expDate.toLocaleDateString()), self);
                        }
                        if (activationDate && activationDate > now) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNotYetActive', activationDate.toLocaleDateString()), self);
                        }
                        if (!creditModel.get('currentBalance') || creditModel.get('currentBalance') <= 0) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNoRemainingFunds'), self);
                        }
                        return null;
                    };

                    var validate = validateCredit();
                    if (validate !== null) {
                        return null;
                    }
                    
                    var maxAmt = me.getMaxCreditToApply(creditModel, me, amountRequested);
                    if (!!amountRequested && amountRequested < maxAmt) {
                        maxAmt = amountRequested;
                    }
                    creditModel.set('creditAmountApplied', maxAmt);
                    creditModel.set('remainingBalance', creditModel.calculateRemainingBalance());
                    creditModel.set('isEnabled', true);

                    me._cachedDigitalCredits.push(creditModel);
                    me.applyDigitalCredit(creditCode, maxAmt, true);
                    me.trigger('sync', creditModel);
                    return creditModel;
                });
            },

            getDigitalCredit: function () {
                var me = this,
                    order = me.getOrder(),
                    customer = order.get('customer');
                var creditCode = this.get('digitalCreditCode');

                var existingDigitalCredit = this._cachedDigitalCredits.filter(function (cred) {
                    return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });
                if (existingDigitalCredit && existingDigitalCredit.length > 0){
                    me.trigger('error', {
                        message: Hypr.getLabel('digitalCodeAlreadyUsed', creditCode)
                    });
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    return deferred.promise;
                }
                me.isLoading(true);
                return me.retrieveDigitalCredit(customer, creditCode, me).then(function() {
                    me.isLoading(false);
                    return me;
                });
            },

            getMaxCreditToApply: function(creditModel, scope, toBeVoidedPayment) {
                var remainingTotal = scope.nonStoreCreditTotal();
                if (!!toBeVoidedPayment) {
                    remainingTotal += toBeVoidedPayment;
                }
                var maxAmt = remainingTotal < creditModel.get('currentBalance') ? remainingTotal : creditModel.get('currentBalance');
                return scope.roundToPlaces(maxAmt, 2);
            },

            roundToPlaces: function(amt, numberOfDecimalPlaces) {
                var transmogrifier = Math.pow(10, numberOfDecimalPlaces);
                return Math.round(amt * transmogrifier) / transmogrifier;
            },

            digitalCreditPaymentTotal: function () {
                var activeCreditPayments = this.activeStoreCredits();
                if (!activeCreditPayments)
                    return null;
                return _.reduce(activeCreditPayments, function (sum, credit) {
                    return sum + credit.amountRequested;
                }, 0);
            },

            addRemainingCreditToCustomerAccount: function(creditCode, isEnabled) {
                var self = this;

                var digitalCredit = self._cachedDigitalCredits.find(function(credit) {
                    return credit.code.toLowerCase() === creditCode.toLowerCase();
                });

                if (!digitalCredit) {
                    return self.deferredError(Hypr.getLabel('genericNotFound'), self);
                }
                digitalCredit.set('addRemainderToCustomer', isEnabled);
                return digitalCredit;
            },

            getDigitalCreditsToAddToCustomerAccount: function() {
                return this._cachedDigitalCredits.where({ isEnabled: true, addRemainderToCustomer: true, isTiedToCustomer: false });
            },

            isAnonymousShopper: function() {
                var order = this.getOrder(),
                    customer = order.get('customer');
                return (!customer || !customer.id || customer.id <= 1);
            },

            removeCredit: function(id) {
                var order = this.getOrder();
                return order.apiVoidPayment(id).then(order.update);
            },
            syncPaymentMethod: function (me, newId) {
                if (!newId || newId === 'new') {
                    me.get('billingContact').clear();
                    me.get('card').clear();
                    me.get('check').clear();
                    me.unset('paymentType');
                    me.set('usingSavedCard', false);
                } else {
                    me.setSavedPaymentMethod(newId);
                    me.set('usingSavedCard', true);
                }
            },
            setSavedPaymentMethod: function (newId, manualCard) {
                var me = this,
                    customer = me.getOrder().get('customer'),
                    card = manualCard || customer.get('cards').get(newId),
                    cardBillingContact = card && customer.get('contacts').get(card.get('contactId'));
                if (card) {
                    me.get('billingContact').set(cardBillingContact.toJSON(), { silent: true });
                    me.get('card').set(card.toJSON());
                    me.set('paymentType', 'CreditCard');
                    me.set('usingSavedCard', true);
                    if (Hypr.getThemeSetting('isCvvSuppressed')) {
                        me.get('card').set('isCvvOptional', true);
                        if (me.parent.get('amountRemainingForPayment') > 0) {
                            return me.applyPayment();
                        }
                    }
                }
            },
            getPaymentTypeFromCurrentPayment: function () {
                var billingInfoPaymentType = this.get('paymentType'),
                    billingInfoPaymentWorkflow = this.get('paymentWorkflow'),
                    currentPayment = this.getOrder().apiModel.getCurrentPayment(),
                    currentPaymentType = currentPayment && currentPayment.billingInfo.paymentType,
                    currentPaymentWorkflow = currentPayment && currentPayment.billingInfo.paymentWorkflow,
                    currentBillingContact = currentPayment && currentPayment.billingInfo.billingContact,
                    currentCard = currentPayment && currentPayment.billingInfo.card,
                    currentPurchaseOrder = currentPayment && currentPayment.billingInfo.purchaseorder,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerSettings = this.getOrder().get('customer').get('purchaseOrder') ? 
                        this.getOrder().get('customer').get('purchaseOrder').isEnabled : false;

                if(purchaseOrderSiteSettings && purchaseOrderCustomerSettings && !currentPayment) {
                    currentPaymentType = 'PurchaseOrder';
                }

                if (currentPaymentType && (currentPaymentType !== billingInfoPaymentType || currentPaymentWorkflow !== billingInfoPaymentWorkflow)) {
                    this.set('paymentType', currentPaymentType, { silent: true });
                    this.set('paymentWorkflow', currentPaymentWorkflow, { silent: true });
                    this.set('card', currentCard, { silent: true });
                    this.set('billingContact', currentBillingContact, { silent: true });
                    this.set('purchaseOrder', currentPurchaseOrder, { silent: true });
                }
            },
            edit: function () {
                this.getPaymentTypeFromCurrentPayment();
                CheckoutStep.prototype.edit.apply(this, arguments);
            },
            updatePurchaseOrderAmount: function() {

                var me = this,
                    order = me.getOrder(),
                    currentPurchaseOrder = this.get('purchaseOrder'),
                    pOAvailableBalance = currentPurchaseOrder.get('totalAvailableBalance'),
                    orderAmountRemaining = order.get('amountRemainingForPayment'),
                    amount = pOAvailableBalance > orderAmountRemaining ?
                        orderAmountRemaining : pOAvailableBalance;

                if((!this.get('purchaseOrder').get('isEnabled') && this.get('purchaseOrder').selected) || order.get('payments').length > 0) {
                    return;
                }


                currentPurchaseOrder.set('amount', amount);
                if(amount < orderAmountRemaining) {
                    currentPurchaseOrder.set('splitPayment', true);
                }

                //refresh ui when split payment is working?
                me.trigger('stepstatuschange'); // trigger a rerender
            },
            isPurchaseOrderEnabled: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ?  order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerEnabled = purchaseOrderInfo ? purchaseOrderInfo.isEnabled : false,
                    customerAvailableBalance = purchaseOrderCustomerEnabled ? purchaseOrderInfo.totalAvailableBalance > 0 : false,
                    purchaseOrderEnabled = purchaseOrderSiteSettings && purchaseOrderCustomerEnabled && customerAvailableBalance;

                return purchaseOrderEnabled;
            },
            resetPOInfo: function() {
                var me = this,
                    currentPurchaseOrder = me.get('purchaseOrder');

                currentPurchaseOrder.get('paymentTermOptions').reset();
                currentPurchaseOrder.get('customFields').reset();
                currentPurchaseOrder.get('paymentTerm').clear();

                this.setPurchaseOrderInfo();
            },
            setPurchaseOrderInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ? order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    siteId = require.mozuData('checkout').siteId,
                    currentPurchaseOrderAmount = currentPurchaseOrder.get('amount');

                currentPurchaseOrder.set('isEnabled', purchaseOrderEnabled);
                if(!purchaseOrderEnabled) {
                    // if purchase order isn't enabled, don't populate stuff!
                    return;
                }

                // Breaks the custom field array into individual items, and makes the value
                //  field a first class item against the purchase order model. Also populates the field if the
                //  custom field has a value.
                currentPurchaseOrder.deflateCustomFields();
                // Update models-checkout validation with flat purchaseOrderCustom fields for validation.
                for(var validateField in currentPurchaseOrder.validation) {
                    if(!this.validation['purchaseOrder.'+validateField]) {
                        this.validation['purchaseOrder.'+validateField] = currentPurchaseOrder.validation[validateField];
                    }
                    // Is this level needed?
                    if(!this.parent.validation['billingInfo.purchaseOrder.'+validateField]) {
                        this.parent.validation['billingInfo.purchaseOrder.'+validateField] =
                            currentPurchaseOrder.validation[validateField];
                    }
                }

                // Set information, only if the current purchase order does not have it:
                var amount = purchaseOrderInfo.totalAvailableBalance > order.get('amountRemainingForPayment') ?
                        order.get('amountRemainingForPayment') : purchaseOrderInfo.totalAvailableBalance;

                currentPurchaseOrder.set('amount', amount);

                currentPurchaseOrder.set('totalAvailableBalance', purchaseOrderInfo.totalAvailableBalance);
                currentPurchaseOrder.set('availableBalance', purchaseOrderInfo.availableBalance);
                currentPurchaseOrder.set('creditLimit', purchaseOrderInfo.creditLimit);

                if(purchaseOrderInfo.totalAvailableBalance < order.get('amountRemainingForPayment')) {
                    currentPurchaseOrder.set('splitPayment', true);
                }
                
                var paymentTerms = [];
                purchaseOrderInfo.paymentTerms.forEach(function(term) {
                    if(term.siteId === siteId) {
                        var newTerm = {};
                        newTerm.code = term.code;
                        newTerm.description = term.description;
                        paymentTerms.push(term);
                    }
                });
                currentPurchaseOrder.set('paymentTermOptions', paymentTerms, {silent: true});

                var paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                if(paymentTermOptions.length === 1) {
                    var paymentTerm = {};
                    paymentTerm.code = paymentTermOptions.models[0].get('code');
                    paymentTerm.description = paymentTermOptions.models[0].get('description');
                    currentPurchaseOrder.set('paymentTerm', paymentTerm);
                }

                this.setPurchaseOrderBillingInfo();
            },
            setPurchaseOrderBillingInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    contacts = order ? order.get('customer').get('contacts') : null;
                if(purchaseOrderEnabled) {
                    if(currentPurchaseOrder.selected && contacts.length > 0) {
                        var foundBillingContact = contacts.models.find(function(item){
                            return item.get('isPrimaryBillingContact');
                                
                        });

                        if(foundBillingContact) {
                            this.set('billingContact', foundBillingContact, {silent: true});
                            currentPurchaseOrder.set('usingBillingContact', true);
                        }
                    }
                }
            },
            setPurchaseOrderPaymentTerm: function(termCode) {
                var currentPurchaseOrder = this.get('purchaseOrder'),
                    paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                    var foundTerm = paymentTermOptions.find(function(term) {
                        return term.get('code') === termCode;
                    });
                    currentPurchaseOrder.set('paymentTerm', foundTerm, {silent: true});
            },
            initialize: function () {
                var me = this;

                _.defer(function () {
                    //set purchaseOrder defaults here.
                    me.setPurchaseOrderInfo();
                    me.getPaymentTypeFromCurrentPayment();

                    var savedCardId = me.get('card.paymentServiceCardId');
                    me.set('savedPaymentMethodId', savedCardId, { silent: true });
                    me.setSavedPaymentMethod(savedCardId);

                    if (!savedCardId) {
                        me.setDefaultPaymentType(me);
                    }

                    me.on('change:usingSavedCard', function (me, yes) {
                        if (!yes) {
                            me.get('card').clear();
                            me.set('usingSavedCard', false);
                        }
                        else {
                            me.set('isSameBillingShippingAddress', false);
                            me.setSavedPaymentMethod(me.get('savedPaymentMethodId'));
                        }
                    });
                });
                var billingContact = this.get('billingContact');
                this.on('change:paymentType', this.selectPaymentType);
                this.selectPaymentType(this, this.get('paymentType'));
                this.on('change:isSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                        billingContact.set(this.parent.get('fulfillmentInfo').get('fulfillmentContact').toJSON(), { silent: true });
                    } else if (billingContact) {
                        // if they initially checked the checkbox, then later they decided to uncheck it... remove the id so that updates don't update
                        // the original address, instead create a new contact address.
                        // We also unset contactId to prevent id from getting reset later.
                        billingContact.unset('id', { silent: true });
                        billingContact.unset('contactId', { silent: true });
                    }
                });
                this.on('change:savedPaymentMethodId', this.syncPaymentMethod);
                this._cachedDigitalCredits = null;

                _.bindAll(this, 'applyPayment', 'markComplete');
            },
            selectPaymentType: function(me, newPaymentType) {
                if (!me.changed || !me.changed.paymentWorkflow) {
                    me.set('paymentWorkflow', 'Mozu');
                }
                me.get('check').selected = newPaymentType === 'Check';
                me.get('card').selected = newPaymentType === 'CreditCard';
                me.get('purchaseOrder').selected = newPaymentType === 'PurchaseOrder';
                if(newPaymentType === 'PurchaseOrder') {
                    me.setPurchaseOrderBillingInfo();
                }
            },
            setDefaultPaymentType: function(me) {
                if(me.isPurchaseOrderEnabled()) {
                    me.set('paymentType', 'PurchaseOrder');
                    me.selectPaymentType(me, 'PurchaseOrder');
                } else {
                    me.set('paymentType', 'CreditCard');
                    me.selectPaymentType(me, 'CreditCard');
                    if (me.savedPaymentMethods() && me.savedPaymentMethods().length > 0) {
                        me.set('usingSavedCard', true);
                    }
                }
            },
            calculateStepStatus: function () {
                var fulfillmentComplete = this.parent.get('fulfillmentInfo').stepStatus() === 'complete',
                    activePayments = this.activePayments(),
                    thereAreActivePayments = activePayments.length > 0,
                    paymentTypeIsCard = activePayments && !!_.findWhere(activePayments, { paymentType: 'CreditCard' }),
                    balanceNotPositive = this.parent.get('amountRemainingForPayment') <= 0;

                if (paymentTypeIsCard && !Hypr.getThemeSetting('isCvvSuppressed')) return this.stepStatus('incomplete'); // initial state for CVV entry

                if (!fulfillmentComplete) return this.stepStatus('new');

                if (thereAreActivePayments && (balanceNotPositive || (this.get('paymentType') === 'PaypalExpress' && window.location.href.indexOf('PaypalExpress=complete') !== -1))) return this.stepStatus('complete');
                return this.stepStatus('incomplete');

            },
            hasPaymentChanged: function(payment) {

                // fix this for purchase orders, currently it constantly voids, then re-applys the payment even if nothing changes.
                function normalizeBillingInfos(obj) {
                    return {
                        paymentType: obj.paymentType,
                        billingContact: _.extend(_.pick(obj.billingContact,
                            'email',
                            'firstName',
                            'lastNameOrSurname',
                            'phoneNumbers'),
                        {
                            address: obj.billingContact.address ? _.pick(obj.billingContact.address, 
                                'address1',
                                'address2',
                                'addressType',
                                'cityOrTown',
                                'countryCode',
                                'postalOrZipCode',
                                'stateOrProvince') : {}
                        }),
                        card: obj.card ? _.extend(_.pick(obj.card,
                            'expireMonth',
                            'expireYear',
                            'nameOnCard',
                            'isSavedCardInfo'),
                        {
                            cardType: obj.card.paymentOrCardType || obj.card.cardType,
                            cardNumber: obj.card.cardNumberPartOrMask || obj.card.cardNumberPart || obj.card.cardNumber,
                            id: obj.card.paymentServiceCardId || obj.card.id,
                            isCardInfoSaved: obj.card.isCardInfoSaved || false
                        }) : {},
                        purchaseOrder: obj.purchaseOrder || {},
                        check: obj.check || {}
                    };
                }

                var normalizedSavedPaymentInfo = normalizeBillingInfos(payment.billingInfo);
                var normalizedLiveBillingInfo = normalizeBillingInfos(this.toJSON());

                if (payment.paymentWorkflow === 'VisaCheckout') {
                    normalizedLiveBillingInfo.billingContact.address.addressType = normalizedSavedPaymentInfo.billingContact.address.addressType;
                }
                
                return !_.isEqual(normalizedSavedPaymentInfo, normalizedLiveBillingInfo);
            },
            submit: function () {
                
                var order = this.getOrder();
                // just can't sync these emails right
                order.syncBillingAndCustomerEmail();

                // This needs to be ahead of validation so we can check if visa checkout is being used.
                var currentPayment = order.apiModel.getCurrentPayment();

                // the card needs to know if this is a saved card or not.
                this.get('card').set('isSavedCard', order.get('billingInfo.usingSavedCard'));
                // the card needs to know if this is Visa checkout (or Amazon? TBD)
                if (currentPayment) {
                    this.get('card').set('isVisaCheckout', currentPayment.paymentWorkflow.toLowerCase() === 'visacheckout');
                }

                var val = this.validate();

                if (this.nonStoreCreditTotal() > 0 && val) {
                    // display errors:
                    var error = {"items":[]};
                    for (var key in val) {
                        if (val.hasOwnProperty(key)) {
                            var errorItem = {};
                            errorItem.name = key;
                            errorItem.message = key.substring(0, ".") + val[key];
                            error.items.push(errorItem);
                        }
                    }
                    if (error.items.length > 0) {
                        order.onCheckoutError(error);
                    }
                    return false;
                }

                var card = this.get('card');
                if(this.get('paymentType').toLowerCase() === "purchaseorder") {
                    this.get('purchaseOrder').inflateCustomFields();
                }

                if (!currentPayment) {
                    return this.applyPayment();
                } else if (this.hasPaymentChanged(currentPayment)) {
                    return order.apiVoidPayment(currentPayment.id).then(this.applyPayment);
                } else if (card.get('cvv') && card.get('paymentServiceCardId')) {
                    return card.apiSave().then(this.markComplete, order.onCheckoutError);
                } else {
                    this.markComplete();
                }
            },
            applyPayment: function () {
                var self = this, order = this.getOrder();
                this.syncApiModel();
                if (this.nonStoreCreditTotal() > 0) {
                    return order.apiAddPayment().then(function() {
                        var payment = order.apiModel.getCurrentPayment();
                        var modelCard, modelCvv;
                        var activePayments = order.apiModel.getActivePayments();
                        var creditCardPayment = activePayments && _.findWhere(activePayments, { paymentType: 'CreditCard' });
                        //Clear card if no credit card payments exists
                        if (!creditCardPayment && self.get('card')) {
                            self.get('card').clear();
                        }
                        if (payment) {
                            switch (payment.paymentType) {
                                case 'CreditCard':
                                    modelCard = self.get('card');
                                    modelCvv = modelCard.get('cvv');
                                    if (
                                        modelCvv && modelCvv.indexOf('*') === -1 // CVV exists and is not masked
                                    ) {
                                        modelCard.set('cvv', '***');
                                        // to hide CVV once it has been sent to the paymentservice
                                    }

                                    self.markComplete();
                                    break;
                                default:
                                    self.markComplete();
                            }
                        }
                    });
                } else {
                    this.markComplete();
                }
            },

            markComplete: function () {
                this.stepStatus('complete');
                this.isLoading(false);
                var order = this.getOrder();
                _.defer(function() { 
                    order.isReady(true);   
                });
            },
            toJSON: function(options) {
                var j = CheckoutStep.prototype.toJSON.apply(this, arguments), loggedInEmail;
                if (this.nonStoreCreditTotal() === 0 && j.billingContact) {
                    delete j.billingContact.address;
                }
                if (j.billingContact && !j.billingContact.email) {
                    j.billingContact.email = this.getOrder().get('customer.emailAddress');
                }
                return j;
            }
        });

        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'emailAddress': {
                fn: function (value) {
                    if (this.attributes.createAccount && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing');
                }
            },
            'password': {
                fn: function (value) {
                    if (this.attributes.createAccount && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            'confirmPassword': {
                fn: function (value) {
                    if (this.attributes.createAccount && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            };
        }

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0){

            var requiredAttributes = _.filter(storefrontOrderAttributes, 
                function(attr) { return attr.isRequired && attr.isVisible && attr.valueType !== 'AdminEntered' ;  });
            requiredAttributes.forEach(function(attr) {
                if(attr.isRequired) {

                    checkoutPageValidation['orderAttribute-' + attr.attributeFQN] = 
                    {
                        required: true,
                        msg: attr.content.value + " " + Hypr.getLabel('missing')
                    };
                }
            }, this);
        }

        var CheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'order',
            handlesMessages: true,
            relations: {
                fulfillmentInfo: FulfillmentInfo,
                billingInfo: BillingInfo,
                shopperNotes: ShopperNotes,
                customer: CustomerModels.Customer
            },
            validation: checkoutPageValidation,
            dataTypes: {
                createAccount: Backbone.MozuModel.DataTypes.Boolean,
                acceptsMarketing: Backbone.MozuModel.DataTypes.Boolean,
                amountRemainingForPayment: Backbone.MozuModel.DataTypes.Float
            },
            initialize: function (data) {

                var self = this,
                    user = require.mozuData('user');

                _.defer(function() {

                    var latestPayment = self.apiModel.getCurrentPayment(),
                        activePayments = self.apiModel.getActivePayments(),
                        fulfillmentInfo = self.get('fulfillmentInfo'),
                        fulfillmentContact = fulfillmentInfo.get('fulfillmentContact'),
                        billingInfo = self.get('billingInfo'),
                        steps = [fulfillmentInfo, fulfillmentContact, billingInfo],
                        paymentWorkflow = latestPayment && latestPayment.paymentWorkflow,
                        visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' }),
                        allStepsComplete = function () {
                            return _.reduce(steps, function(m, i) { return m + i.stepStatus(); }, '') === 'completecompletecomplete';
                        },
                        isReady = allStepsComplete();

                    //Visa checkout payments can be added to order without UIs knowledge. This evaluates and voids the required payments.
                    if (visaCheckoutPayment) {
                        _.each(_.filter(self.apiModel.getActivePayments(), function (payment) {
                            return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard' && payment.paymentWorkflow != 'VisaCheckout';
                        }), function (payment) {
                            self.apiVoidPayment(payment.id);
                        });
                        paymentWorkflow = visaCheckoutPayment.paymentWorkflow;
                        billingInfo.unset('billingContact');
                        billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                        billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                     }

                    if (paymentWorkflow) {
                        billingInfo.set('paymentWorkflow', paymentWorkflow);
                        billingInfo.get('card').set({
                            isCvvOptional: Hypr.getThemeSetting('isCvvSuppressed'),
                            paymentWorkflow: paymentWorkflow
                        });
                        billingInfo.trigger('stepstatuschange'); // trigger a rerender
                    }

                    self.isReady(isReady);

                    _.each(steps, function(step) {
                        self.listenTo(step, 'stepstatuschange', function() {
                            _.defer(function() {
                                self.isReady(allStepsComplete());
                            });
                        });
                    });

                    if (!self.get('requiresFulfillmentInfo')) {
                        self.validation = _.pick(self.constructor.prototype.validation, _.filter(_.keys(self.constructor.prototype.validation), function(k) { return k.indexOf('fulfillment') === -1; }));
                    }

                    self.get('billingInfo.billingContact').on('change:email', function(model, newVal) {
                        self.set('email', newVal);
                    });

                    var billingEmail = billingInfo.get('billingContact.email');
                    if (!billingEmail && user.email) billingInfo.set('billingContact.email', user.email);

                    self.applyAttributes();

                });
                if (user.isAuthenticated) {
                    this.set('customer', { id: user.accountId });
                }
                // preloaded JSON has this as null if it's unset, which defeats the defaults collection in backbone
                if (data.acceptsMarketing === null) {
                    self.set('acceptsMarketing', true);
                }

                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'saveCustomerCard', 'apiCheckout', 
                    'addDigitalCreditToCustomerAccount', 'addCustomerContact', 'addBillingContact', 'addShippingContact', 'addShippingAndBillingContact');

            },

            applyAttributes: function() {
                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    this.set('orderAttributes', storefrontOrderAttributes);
                }
            },

            processDigitalWallet: function(digitalWalletType, payment) {
                var me = this;
                me.runForAllSteps(function() {
                    this.isLoading(true);
                });
                me.trigger('beforerefresh');
                // void active payments; if there are none then the promise will resolve immediately
                return api.all.apply(api, _.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard';
                }), function(payment) {
                    return me.apiVoidPayment(payment.id);
                })).then(function() {
                    return me.apiProcessDigitalWallet({
                        digitalWalletData: JSON.stringify(payment)
                    }).then(function () {
                        me.updateVisaCheckoutBillingInfo();
                        me.runForAllSteps(function() {
                            this.trigger('sync');
                            this.isLoading(false);
                        });
                        me.updateShippingInfo();
                    });
                });
            },
            updateShippingInfo: function() {
                var me = this;
                this.apiModel.getShippingMethods().then(function (methods) { 
                    me.get('fulfillmentInfo').refreshShippingMethods(methods);
                });
            },
            updateVisaCheckoutBillingInfo: function() {
                //Update the billing info with visa checkout payment
                var billingInfo = this.get('billingInfo');
                var activePayments = this.apiModel.getActivePayments();
                var visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' });
                if (visaCheckoutPayment) {
                    billingInfo.set('usingSavedCard', false);
                    billingInfo.unset('savedPaymentMethodId');
                    billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                    billingInfo.unset('billingContact');
                    billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                    billingInfo.set('paymentWorkflow', visaCheckoutPayment.paymentWorkflow);
                    billingInfo.set('paymentType', visaCheckoutPayment.paymentType);
                    this.refresh();
                }
            },
            addCoupon: function () {
                var me = this;
                var code = this.get('couponCode');
                var orderDiscounts = me.get('orderDiscounts');
                if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    deferred.promise.otherwise(function () {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                        });
                    });
                    return deferred.promise;
                }
                this.isLoading(true);
                return this.apiAddCoupon(this.get('couponCode')).then(function () {

                    me.get('billingInfo').trigger('sync');
                    me.set('couponCode', '');

                    var productDiscounts = _.flatten(_.pluck(me.get('items'), 'productDiscounts'));
                    var shippingDiscounts = _.flatten(_.pluck(_.flatten(_.pluck(me.get('items'), 'shippingDiscounts')), 'discount'));
                    var orderShippingDiscounts = _.flatten(_.pluck(me.get('shippingDiscounts'), 'discount'));

                    var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts).concat(orderShippingDiscounts);
                    var lowerCode = code.toLowerCase();

                    var matchesCode = function (d) {
                        // there are discounts that have no coupon code that we should not blow up on.
                        return (d.couponCode || "").toLowerCase() === lowerCode;
                    };

                    if (!allDiscounts || !_.find(allDiscounts, matchesCode))
                    {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeError', code)
                        });
                    }

                    else if (me.get('total') === 0) {
                        me.trigger('complete');
                    }
                    // only do this when there isn't a payment on the order...
                    me.get('billingInfo').updatePurchaseOrderAmount();
                    me.isLoading(false);
                });
            },
            onCheckoutSuccess: function () {
                this.isLoading(true);
                this.trigger('complete');
            },
            onCheckoutError: function (error) {
                var order = this,
                    errorHandled = false;
                order.isLoading(false);
                if (!error || !error.items || error.items.length === 0) {
                    error = {
                        items: [
                            {
                                message: error.message || Hypr.getLabel('unknownError')
                            }
                        ]
                    };
                }
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.name === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: password')) {
                        errorHandled = true;
                        order.trigger('passwordinvalid', errorItem.message.substring(errorItem.message.indexOf('Password')));
                    }
                    if (errorItem.errorCode === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: emailaddress')) {
                        errorHandled = true;
                        order.trigger('userexists', order.get('emailAddress'));
                    }
                });

                this.trigger('error', error);

                if (!errorHandled) order.messages.reset(error.items);
                order.isSubmitting = false;
                throw error;
            },
            addNewCustomer: function () {
                var self = this,
                billingInfo = this.get('billingInfo'),
                billingContact = billingInfo.get('billingContact'),
                email = this.get('emailAddress'),
                captureCustomer = function (customer) {
                    if (!customer || (customer.type !== 'customer' && customer.type !== 'login')) return;
                    var newCustomer;
                    if (customer.type === 'customer') newCustomer = customer.data;
                    if (customer.type === 'login') newCustomer = customer.data.customerAccount;
                    if (newCustomer && newCustomer.id) {
                        self.set('customer', newCustomer);
                        api.off('sync', captureCustomer);
                        api.off('spawn', captureCustomer);
                    }
                };
                api.on('sync', captureCustomer);
                api.on('spawn', captureCustomer);
                return this.apiAddNewCustomer({
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: billingContact.get('firstName') || this.get('fulfillmentInfo.fulfillmentContact.firstName'),
                        lastName: billingContact.get('lastNameOrSurname') || this.get('fulfillmentInfo.fulfillmentContact.lastNameOrSurname'),
                        acceptsMarketing: self.get('acceptsMarketing')
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    self.customerCreated = true;
                    return customer;
                }, function (error) {
                    self.customerCreated = false;
                    self.isSubmitting = false;
                    throw error;
                });
            },
            addBillingContact: function () {
                return this.addCustomerContact('billingInfo', 'billingContact', [{ name: 'Billing' }]);
            },
            addShippingContact: function () {
                return this.addCustomerContact('fulfillmentInfo', 'fulfillmentContact', [{ name: 'Shipping' }]);
            },
            addShippingAndBillingContact: function () {
                return this.addCustomerContact('fulfillmentInfo', 'fulfillmentContact', [{ name: 'Shipping' }, { name: 'Billing' }]);
            },
            addCustomerContact: function (infoName, contactName, contactTypes) {
                var customer = this.get('customer'),
                    contactInfo = this.get(infoName),
                    process = [function () {
                      
                        // Update contact if a valid contact ID exists
                        if (orderContact.id && orderContact.id > 0) {
                            return customer.apiModel.updateContact(orderContact);
                        }

                        if (orderContact.id === -1 || orderContact.id === 1 || orderContact.id === 'new') {
                            delete orderContact.id;
                        }
                        return customer.apiModel.addContact(orderContact).then(function(contactResult) {
                                orderContact.id = contactResult.data.id;
                                return contactResult;
                            });
                    }];
                var contactInfoContactName = contactInfo.get(contactName);
                var customerContacts = customer.get('contacts');
                    
                if (!contactInfoContactName.get('accountId')) {
                    contactInfoContactName.set('accountId', customer.id);
                }
                var orderContact = contactInfoContactName.toJSON();
                // if customer doesn't have a primary of any of the contact types we're setting, then set primary for those types
                if (!this.isSavingNewCustomer()) {
                    process.unshift(function() {
                        return customer.apiModel.getContacts().then(function(contacts) {
                            _.each(contactTypes, function(newType) {
                                var primaryExistsAlready = _.find(contacts.data.items, function(existingContact) {
                                    return _.find(existingContact.types || [], function(existingContactType) {
                                        return existingContactType.name === newType.name && existingContactType.isPrimary;
                                    });
                                });
                                newType.isPrimary = !primaryExistsAlready;
                            });
                        });
                    });
                } else {
                    _.each(contactTypes, function(type) {
                        type.isPrimary = true;
                    });
                }

                // handle email
                if (!orderContact.email) orderContact.email = this.get('emailAddress') || customer.get('emailAddress') || require.mozuData('user').email;

                var contactId = orderContact.contactId;
                if (contactId) orderContact.id = contactId;
                if (!orderContact.id || orderContact.id === -1 || orderContact.id === 1 || orderContact.id === 'new') {
                    orderContact.types = contactTypes;
                    return api.steps(process);
                } else {
                    var customerContact = customerContacts.get(orderContact.id).toJSON();
                    if (this.isContactModified(orderContact, customerContact)) {
                        //keep the current types on edit
                        orderContact.types = orderContact.types ? orderContact.types : customerContact.types;
                        return api.steps(process);
                    } else {
                        var deferred = api.defer();
                        deferred.resolve();
                        return deferred.promise;
                    }
                }
            },
            isContactModified: function(orderContact, customerContact) {
                var validContact = orderContact && customerContact && orderContact.id === customerContact.id;
                var addressChanged = validContact && !_.isEqual(orderContact.address, customerContact.address);
                //Note: Only home phone is used on the checkout page     
                var phoneChanged = validContact && orderContact.phoneNumbers.home &&
                                    (!customerContact.phoneNumbers.home || orderContact.phoneNumbers.home !== customerContact.phoneNumbers.home);

                //Check whether any of the fields available in the contact UI on checkout page is modified
                return validContact &&
                    (addressChanged || phoneChanged || 
                    orderContact.email !== customerContact.email || orderContact.firstName !== customerContact.firstName ||
                    orderContact.lastNameOrSurname !== customerContact.lastNameOrSurname);
            },
            saveCustomerCard: function () {
                var order = this,
                    customer = this.get('customer'), //new CustomerModels.EditableCustomer(this.get('customer').toJSON()),
                    billingInfo = this.get('billingInfo'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isPrimaryAddress = this.isSavingNewCustomer(),
                    billingContact = billingInfo.get('billingContact').toJSON(),
                    card = billingInfo.get('card'),
                    doSaveCard = function() {
                        order.cardsSaved = order.cardsSaved || customer.get('cards').reduce(function(saved, card) {
                            saved[card.id] = true;
                            return saved;
                        }, {});
                        var method = order.cardsSaved[card.get('id') || card.get('paymentServiceCardId')] ? 'updateCard' : 'addCard';
                        card.set('contactId', billingContact.id);
                        return customer.apiModel[method](card.toJSON()).then(function(card) {
                            order.cardsSaved[card.data.id] = true;
                            return card;
                        });
                    };

                var contactId = billingContact.contactId;
                if (contactId) billingContact.id = contactId;

                if (!billingContact.id || billingContact.id === -1 || billingContact.id === 1 || billingContact.id === 'new') {
                    billingContact.types = !isSameBillingShippingAddress ? [{ name: 'Billing', isPrimary: isPrimaryAddress }] : [{ name: 'Shipping', isPrimary: isPrimaryAddress }, { name: 'Billing', isPrimary: isPrimaryAddress }];
                    return this.addCustomerContact('billingInfo', 'billingContact', billingContact.types).then(function (contact) {
                        billingContact.id = contact.data.id;
                        return contact;
                    }).then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            },
            setFulfillmentContactEmail: function () {
                var fulfillmentEmail = this.get('fulfillmentInfo.fulfillmentContact.email'),
                    orderEmail = this.get('email');

                if (!fulfillmentEmail) {
                    this.set('fulfillmentInfo.fulfillmentContact.email', orderEmail);
                }
            },
            syncBillingAndCustomerEmail: function () {
                var billingEmail = this.get('billingInfo.billingContact.email'),
                    customerEmail = this.get('emailAddress') || require.mozuData('user').email;
                if (!customerEmail) {
                    this.set('emailAddress', billingEmail);
                }
                if (!billingEmail) {
                    this.set('billingInfo.billingContact.email', customerEmail);
                }
            },
            addDigitalCreditToCustomerAccount: function () {
                var billingInfo = this.get('billingInfo'),
                    customer = this.get('customer');

                var digitalCredits = billingInfo.getDigitalCreditsToAddToCustomerAccount();
                if (!digitalCredits)
                    return;
                return _.each(digitalCredits, function (cred) {
                    return customer.apiAddStoreCredit(cred.get('code'));
                });
            },
            isSavingNewCustomer: function() {
                return this.get('createAccount') && !this.customerCreated;
            },

            validateReviewCheckoutFields: function(){
                var validationResults = [];
                for (var field in checkoutPageValidation) {
                    if(checkoutPageValidation.hasOwnProperty(field)) {
                        var result = this.validate(field);
                        if(result) {
                            validationResults.push(result);
                        }
                    }
                }

                return validationResults.length > 0;
            },

            submit: function () {
                var order = this,
                    billingInfo = this.get('billingInfo'),
                    billingContact = billingInfo.get('billingContact'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isSavingCreditCard = false,
                    isSavingNewCustomer = this.isSavingNewCustomer(),
                    isAuthenticated = require.mozuData('user').isAuthenticated,
                    nonStoreCreditTotal = billingInfo.nonStoreCreditTotal(),
                    requiresFulfillmentInfo = this.get('requiresFulfillmentInfo'),
                    requiresBillingInfo = nonStoreCreditTotal > 0,
                    process = [function() {
                        return order.update({
                            ipAddress: order.get('ipAddress'),
                            shopperNotes: order.get('shopperNotes').toJSON()
                        });
                    }];

                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    var updateAttrs = [];
                    storefrontOrderAttributes.forEach(function(attr){
                        var attrVal = order.get('orderAttribute-' + attr.attributeFQN);
                        if(attrVal) {
                            updateAttrs.push({
                                'fullyQualifiedName': attr.attributeFQN,
                                'values': [ attrVal ]
                            });
                        }
                    });

                    if(updateAttrs.length > 0){
                        process.push(function(){
                            return order.apiUpdateAttributes(updateAttrs);
                        }, function() {
                            return order.apiGet();
                        });
                    }
                }

                if (this.isSubmitting) return;

                this.isSubmitting = true;

                if (requiresBillingInfo && !billingContact.isValid()) {
                    // reconcile the empty address after we got back from paypal and possibly other situations.
                    // also happens with visacheckout ..
                    var billingInfoFromPayment = (this.apiModel.getCurrentPayment() || {}).billingInfo;
                    billingInfo.set(billingInfoFromPayment, { silent: true });
                }

                this.syncBillingAndCustomerEmail();
                this.setFulfillmentContactEmail();

                // skip payment validation, if there are no payments, but run the attributes and accept terms validation.
                if ((nonStoreCreditTotal > 0 && this.validate()) || this.validateReviewCheckoutFields()) {
                    this.isSubmitting = false;
                    return false;
                } 

                this.isLoading(true);

                if (isSavingNewCustomer) {
                    process.unshift(this.addNewCustomer); 
                }

                var activePayments = this.apiModel.getActivePayments();
                var saveCreditCard = false;
                if (activePayments !== null && activePayments.length > 0) {
                     var creditCard = _.findWhere(activePayments, { paymentType: 'CreditCard' });
                     if (creditCard && creditCard.billingInfo && creditCard.billingInfo.card) {
                         saveCreditCard = creditCard.billingInfo.card.isCardInfoSaved;
                         billingInfo.set('card', creditCard.billingInfo.card);
                     }
                 }
                 if (saveCreditCard && (this.get('createAccount') || isAuthenticated)) {
                    isSavingCreditCard = true;
                    process.push(this.saveCustomerCard);
                    }

                if ((this.get('createAccount') || isAuthenticated) && billingInfo.getDigitalCreditsToAddToCustomerAccount().length > 0) {
                    process.push(this.addDigitalCreditToCustomerAccount);
                }

                //save contacts
                if (isAuthenticated || isSavingNewCustomer) {
                    if (!isSameBillingShippingAddress && !isSavingCreditCard) {
                        if (requiresFulfillmentInfo) process.push(this.addShippingContact);
                        if (requiresBillingInfo) process.push(this.addBillingContact);
                    } else if (isSameBillingShippingAddress && !isSavingCreditCard) {
                        process.push(this.addShippingAndBillingContact);
                    } else if (!isSameBillingShippingAddress && isSavingCreditCard && requiresFulfillmentInfo) {
                        process.push(this.addShippingContact);
                    }
                }
               
                process.push(/*this.finalPaymentReconcile, */this.apiCheckout);
                
                api.steps(process).then(this.onCheckoutSuccess, this.onCheckoutError);

            },
            update: function() {
                var j = this.toJSON();
                return this.apiModel.update(j);
            },
            refresh: function() {
              var me = this;
              this.trigger('beforerefresh');
              return this.apiGet().then(function() {
                me.trigger('refresh');
                // me.runForAllSteps(function() {
                //   this.trigger("sync");
                // });
              });
            },
            runForAllSteps: function(cb) {
                var me = this;
                _.each([
                       'fulfillmentInfo.fulfillmentContact',
                       'fulfillmentInfo',
                       'billingInfo'
                ], function(name) {
                    cb.call(me.get(name));
                });
            },
            isReady: function (val) {
                this.set('isReady', val);
            },
            toJSON: function (options) {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (!options || !options.helpers) {
                    delete j.password;
                    delete j.confirmPassword;
                }
                return j;
            }
        });

        return {
            CheckoutPage: CheckoutPage
        };
    }
);
