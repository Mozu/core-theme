define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "modules/models-customer",
    "modules/models-address",
    "modules/models-paymentmethods",
    "hyprlivecontext"
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods, HyprLiveContext) {

        var CheckoutStep = Backbone.MozuModel.extend({
            helpers: ['stepStatus', 'requiresFulfillmentInfo'],
            // instead of overriding constructor, we are creating
            // a method that only the CheckoutStepView knows to
            // run, so it can run late enough for the parent
            // reference in .getOrder to exist;
            initStep: function () {
                var me = this;
                var order = me.getOrder();
                me.calculateStepStatus();
                me.listenTo(order, "error", function () {
                    if (me.isLoading()) {
                        me.isLoading(false);
                    }
                });
                me.set("orderId", order.id);
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
            edit: function () {
                this.stepStatus("incomplete");
            },
            next: function () {
                if (this.submit()) this.isLoading(true);
            }
        }),

        FulfillmentContact = CheckoutStep.extend({
            relations: CustomerModels.Contact.prototype.relations,
            validation: CustomerModels.Contact.prototype.validation,
            dataTypes: {
                contactId: Backbone.MozuModel.DataTypes.Int
            },
            helpers: ['contacts'],
            contacts: function () {
                var contacts = this.getOrder().get('customer').get('contacts').toJSON();
                return contacts && contacts.length > 0 && contacts;
            },
            initialize: function () {
                var self = this;
                this.on('change:contactId', function (model, newContactId) {
                    if (!newContactId || newContactId === "new") {
                        model.get('address').clear();
                        model.get('phoneNumbers').clear();
                        model.unset('firstName');
                        model.unset('lastNameOrSurname');
                    } else {
                        model.set(model.getOrder().get('customer').get('contacts').get(newContactId).toJSON());
                    }
                });
            },
            calculateStepStatus: function () {
                if (!this.requiresFulfillmentInfo()) return this.stepStatus("complete");
                return CheckoutStep.prototype.calculateStepStatus.apply(this);
            },
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            choose: function (e) {
                var idx = parseInt($(e.currentTarget).val());
                if (idx != -1) {
                    var addr = this.get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
                this.next();
            },
            toJSON: function () {
                if (this.requiresFulfillmentInfo()) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
            },
            next: function () {
                if (this.validate()) return false;
                var parent = this.parent,
                    me = this,
                    isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;
                this.isLoading(true);
                var addr = this.get('address');
                var completeStep = function () {
                    me.parent.getOrder().messages.reset();
                    parent.syncApiModel();
                    me.isLoading(true);
                    parent.apiModel.getShippingMethodsFromContact().then(function (methods) {
                        return parent.set({
                            availableShippingMethods: methods
                        });
                    }).ensure(function () {
                        addr.set('candidateValidatedAddresses', null);
                        me.isLoading(false);
                        parent.isLoading(false);
                        me.calculateStepStatus();
                        parent.calculateStepStatus();
                    });
                };

                var promptValidatedAddress = function () {
                    parent.syncApiModel();
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.stepStatus('invalid');
                };

                if (!isAddressValidationEnabled) {
                    completeStep();
                } else {
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? "validateAddressLenient" : "validateAddress";
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    addr.set('isValidated', true);
                                    completeStep();
                                    return;
                                }
                                addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                promptValidatedAddress();
                            }
                            else {
                                completeStep();
                            }
                        }, function (e) {
                            if (allowInvalidAddresses) {
                                // TODO: sink the exception.in a better way.
                                me.parent.getOrder().messages.reset();
                                completeStep();
                            } else {
                                me.parent.getOrder().messages.reset({ message: Hypr.getLabel('addressValidationError') });
                            }
                        });
                    } else {
                        completeStep();
                    }
                }
            }
        }),

        FulfillmentInfo = CheckoutStep.extend({
            mozuType: 'shipment',
            initialize: function () {
                // this adds the price and other metadata off the chosen method to the info object itself
                this.updateShippingMethod(this.get('shippingMethodCode'));
                this.on('change:availableShippingMethods', function (me, value) {
                    me.updateShippingMethod(me.get('shippingMethodCode'));
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
            calculateStepStatus: function () {
                var st = "new", available;
                if (!this.requiresFulfillmentInfo()) return this.stepStatus("complete");
                if (this.provisional) return this.stepStatus("incomplete");
                if (this.get("fulfillmentContact").stepStatus() !== "complete") {
                    return this.stepStatus("new");
                }
                available = this.get("availableShippingMethods");
                if (available && available.length && _.findWhere(available, { shippingMethodCode: this.get("shippingMethodCode") })) {
                    return this.stepStatus("complete");
                }
                return this.stepStatus("incomplete");
            },
            updateShippingMethod: function (code) {
                var available = this.get("availableShippingMethods"),
                    newMethod = _.findWhere(available, { shippingMethodCode: code });
                if (!newMethod && available && available[0]) {
                    newMethod = available[0];
                    this.provisional = true;
                }
                if (newMethod) {
                    this.set(newMethod);
                }
            },
            next: function () {
                if (this.validate()) return false;
                var me = this;
                this.isLoading(true);
                this.getOrder().apiModel.update({ fulfillmentInfo: me.toJSON() }).ensure(function () {
                    me.provisional = false;
                    me.isLoading(false);
                    me.calculateStepStatus();
                    me.parent.get("billingInfo").calculateStepStatus();
                });
            }
        }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                paymentType: {
                    required: true,
                    msg: Hypr.getLabel('paymentTypeMissing')
                },
                "billingContact.email": {
                    required: true,
                    msg: Hypr.getLabel('emailMissing')
                }
            },
            dataTypes: {
                "isSameBillingShippingAddress": Backbone.MozuModel.DataTypes.Boolean,
                "creditAmountToApply": Backbone.MozuModel.DataTypes.Float
            },
            relations: {
                billingContact: CustomerModels.Contact,
                card: PaymentMethods.CreditCard,
                check: PaymentMethods.Check
            },
            helpers: ['savedPaymentMethods', 'availableStoreCredits', 'applyingCredit', 'maxCreditAmountToApply', 'activeStoreCredits', 'nonStoreCreditTotal', 'activePayments'],
            activePayments: function () {
                return this.getOrder().apiModel.getActivePayments();
            },
            nonStoreCreditTotal: function () {
                var order = this.getOrder(),
                    total = order.get('total'),
                    activeCredits = this.activeStoreCredits();
                if (!activeCredits) return total;
                return total - _.reduce(activeCredits, function (sum, credit) {
                    return sum + credit.amountRequested;
                }, 0);
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
                    availableCredits = credits && _.compact(_.map(credits, function (credit) {
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
                    order = this.getOrder();
                var currentPayment = order.apiModel.getCurrentPayment();
                if (currentPayment) {
                    // must first void the current payment because it will no longer be the right price
                    return order.apiVoidPayment(currentPayment.id).then(this.addStoreCredit);
                } else {
                    return this.addStoreCredit();
                }
            },
            addStoreCredit: function () {
                var self = this, apiOrder;
                return self.getOrder().apiAddStoreCredit({
                    storeCreditCode: this.get('selectedCredit'),
                    amount: this.get('creditAmountToApply')
                }).then(function (o) {
                    apiOrder = o;
                    self.closeApplyCredit();
                    return apiOrder; // return order.get('customer').getCredits();
                });
            },
            removeCredit: function (id) {
                var order = this.getOrder(),
                    currentPayment = order.apiModel.getCurrentPayment();
                // must also, asynchronously, void the current payment because it will no longer be the right price
                if (currentPayment) order.apiVoidPayment(currentPayment.id);
                return this.getOrder().apiVoidPayment(id);
            },
            syncPaymentMethod: function (me, newId) {
                if (!newId || newId === "new") {
                    me.get('billingContact').clear();
                    me.get('card').clear();
                    me.get('check').clear();
                    me.unset('paymentType');
                } else {
                    me.setSavedPaymentMethod(newId);
                }
            },
            setSavedPaymentMethod: function (newId) {
                var me = this,
                    customer = me.getOrder().get('customer'),
                    card = customer.get('cards').get(newId),
                    cardBillingContact = card && customer.get('contacts').get(card.get('contactId'));
                if (card) {
                    me.get('billingContact').set(cardBillingContact.toJSON());
                    me.get('card').set(card.toJSON());
                    me.set('paymentType', 'CreditCard');
                }
            },
            getPaymentTypeFromCurrentPayment: function () {
                var billingInfoPaymentType = this.get('paymentType'),
                        currentPayment = this.getOrder().apiModel.getCurrentPayment(),
                        currentPaymentType = currentPayment && currentPayment.billingInfo.paymentType;
                if (currentPaymentType && currentPaymentType !== billingInfoPaymentType) {
                    this.set('paymentType', currentPaymentType);
                }
            },
            edit: function () {
                this.getPaymentTypeFromCurrentPayment();
                CheckoutStep.prototype.edit.apply(this, arguments);
            },
            initialize: function () {
                var me = this;
                _.defer(function () {
                    me.getPaymentTypeFromCurrentPayment();
                    me.setSavedPaymentMethod(me.get('savedPaymentMethodId'));
                });
                this.on('change:paymentType', this.selectPaymentType);
                this.selectPaymentType(this, this.get('paymentType'));
                this.on('change:isSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                        this.get('billingContact').set(this.parent.get('fulfillmentInfo').get('fulfillmentContact').toJSON(), { silent: true });
                    }
                });
                this.on('change:savedPaymentMethodId', this.syncPaymentMethod);
                _.bindAll(this, 'applyPayment', 'addStoreCredit');
            },
            selectPaymentType: function (me, newPaymentType) {
                me.get('check').selected = newPaymentType == "Check";
                me.get('card').selected = newPaymentType == "CreditCard";
            },
            calculateStepStatus: function () {
                var fulfillmentComplete = this.parent.get('fulfillmentInfo').stepStatus() === "complete",
                    activePayments = this.activePayments(),
                    thereAreActivePayments = activePayments.length > 0,
                    paymentTypeIsCard = activePayments && !!_.findWhere(activePayments, { paymentType: 'CreditCard' }),
                    balanceZero = this.parent.get('amountRemainingForPayment') === 0;

                if (paymentTypeIsCard) return this.stepStatus("incomplete"); // initial state for CVV entry
                if (!fulfillmentComplete) return this.stepStatus('new');
                if (thereAreActivePayments && (balanceZero || this.get('paymentType') === "PaypalExpress")) return this.stepStatus("complete");
                return this.stepStatus("incomplete");

            },
            getPaypalUrls: function () {
                var base = window.location.href + (window.location.href.indexOf('?') !== -1 ? "&" : "?");
                return {
                    paypalReturnUrl: base + "PaypalExpress=complete",
                    paypalCancelUrl: base + "PaypalExpress=canceled"
                };
            },
            submit: function () {
                var order = this.getOrder();
                if (this.nonStoreCreditTotal() > 0 && this.validate()) return false;
                var currentPayment = order.apiModel.getCurrentPayment();
                if (currentPayment) {
                    return order.apiVoidPayment(currentPayment.id).then(this.applyPayment);
                } else {
                    return this.applyPayment();
                }
            },
            applyPayment: function () {
                var self = this, order = this.getOrder();
                if (this.get("paymentType") === "PaypalExpress") {
                    this.set(this.getPaypalUrls());
                } else {
                    this.unset('paypalReturnUrl');
                    this.unset('paypalCancelUrl');
                }
                this.syncApiModel();
                if (this.nonStoreCreditTotal() > 0) {
                    return order.apiAddPayment().then(function () {
                        var payment = order.apiModel.getCurrentPayment();
                        if (payment && payment.paymentType !== "PaypalExpress") self.markComplete();
                    });
                } else {
                    this.markComplete();
                }
            },
            markComplete: function () {
                this.stepStatus("complete");
                this.isLoading(false);
                this.getOrder().isReady(true);
            },
            toJSON: function () {
                if (this.nonStoreCreditTotal() > 0) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
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
            },
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            };
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
                amountRemainingForPayment: Backbone.MozuModel.DataTypes.Float
            },
            initialize: function () {
                var self = this;
                _.defer(function () {
                    var latestPayment = self.apiModel.getCurrentPayment(),
                        fulfillmentInfo = self.get('fulfillmentInfo'),
                        fulfillmentContact = fulfillmentInfo.get('fulfillmentContact'),
                        billingInfo = self.get('billingInfo'),
                        isReady = ((fulfillmentInfo.stepStatus() + fulfillmentContact.stepStatus() + billingInfo.stepStatus()) === "completecompletecomplete") ||
                                  (latestPayment && latestPayment.paymentType === "PaypalExpress" && window.location.href.indexOf('PaypalExpress=complete') !== -1);
                    self.isReady(isReady);

                    if (!self.get("requiresFulfillmentInfo")) {
                        self.validation = _.pick(self.constructor.prototype.validation, _.filter(_.keys(self.constructor.prototype.validation), function (k) { return k.indexOf("fulfillment") === -1; }));
                    }

                });
                var user = require.mozuData('user');
                if (user.isAuthenticated) {
                    this.set('customer', { id: user.accountId });
                }
                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'saveCustomerCard', 'apiCheckout');
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
                    me.set('couponCode', '');
                    var allDiscounts = me.get('orderDiscounts').concat(_.flatten(_.pluck(me.get('items'), 'productDiscounts')));
                    if (!allDiscounts || !_.findWhere(allDiscounts, { couponCode: code })) {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeError', code)
                        });
                    }
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
                    error = error.message ? {
                        items: [error]
                    } : {
                        items: [
                            {
                                message: Hypr.getLabel('unknownError')
                            }
                        ]
                    };
                }
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.name === "ADD_CUSTOMER_FAILED" && errorItem.message.toLowerCase().indexOf('invalid parameter: password')) {
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
                    if (!customer || (customer.type !== "customer" && customer.type !== "login")) return;
                    var newCustomer;
                    if (customer.type === "customer") newCustomer = customer.data;
                    if (customer.type === "login") newCustomer = customer.data.customerAccount;
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
                        firstName: billingContact.get("firstName"),
                        lastName: billingContact.get("lastNameOrSurname")
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    self.customerCreated = true;
                    return customer;
                }, function (error) {
                    self.customerCreated = false;
                    throw error;
                });
            },
            saveCustomerCard: function (cust) {
                var order = this,
                    customer = this.get('customer'), //new CustomerModels.EditableCustomer(this.get('customer').toJSON()),
                    billingInfo = this.get('billingInfo'),
                    billingContact = billingInfo.get('billingContact').toJSON(),
                    card = billingInfo.get('card'),
                    doSaveCard = function () {
                        order.cardsSaved = order.cardsSaved || {};
                        var method = order.cardsSaved[card.get('id')] ? 'updateCard' : 'addCard';
                        card.set('contactId', billingContact.id);
                        return customer.apiModel[method](card.toJSON()).then(function (card) {
                            order.cardsSaved[card.data.id] = true;
                            return card;
                        });
                    },
                    saveContactFirst = function () {
                        if (billingContact.id === -1) delete billingContact.id;
                        return customer.apiModel.addContact(billingContact).then(function (contact) {
                            billingContact.id = contact.data.id;
                            return contact;
                        });
                    };

                var contactId = billingContact.contactId;
                if (contactId) billingContact.id = contactId;

                if (!billingContact.id || billingContact.id === -1 || billingContact.id === "new") {
                    return saveContactFirst().then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            },
            syncBillingAndCustomerEmail: function () {
                var billingEmail = this.get('billingInfo').get('billingContact').get('email'),
                    customerEmail = this.get('emailAddress');
                if (!customerEmail) this.set('emailAddress', billingEmail);
            },
            submit: function () {
                var order = this,
                    billingInfo = this.get('billingInfo'),
                    process = [];

                if (this.isSubmitting) return;

                this.isSubmitting = true;

                this.syncBillingAndCustomerEmail();

                if (billingInfo.nonStoreCreditTotal() > 0 && this.validate()) {
                    this.isSubmitting = false;
                    return false;
                }
                this.isLoading(true);

                if (this.get("createAccount") && !this.customerCreated) {
                    process.push(this.addNewCustomer);
                }

                if (this.get('shopperNotes').has('comments')) {
                    process.push(this.update);
                }

                var card = billingInfo.get('card');
                if (billingInfo.get('paymentType') === "CreditCard" && card.get('isCardInfoSaved') && (this.get('createAccount') || require.mozuData('user').isAuthenticated)) {
                    process.push(this.saveCustomerCard);
                }

                process.push(this.apiCheckout);


                api.steps(process).then(this.onCheckoutSuccess, this.onCheckoutError);

            },
            update: function () {
                return this.apiModel.update(this.toJSON());
            },
            isReady: function (val) {
                this.set("isReady", val);
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
