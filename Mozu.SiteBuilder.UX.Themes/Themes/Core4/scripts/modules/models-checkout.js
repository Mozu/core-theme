define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "modules/models-customer",
    "modules/models-address",
    "modules/models-paymentmethods"
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods) {

        var CheckoutStep = Backbone.MozuModel.extend({
            helpers: ['stepStatus'],
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
                this.stepStatus(newStepStatus);
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
            edit: function () {
                this.stepStatus("incomplete")
            },
            next: function () {
                if (this.submit()) this.isLoading(true);
            }
        }),

        FulfillmentContact = CheckoutStep.extend({
            relations: CustomerModels.Contact.prototype.relations,
            validation: CustomerModels.Contact.prototype.validation,
            helpers: ['contacts'],
            contacts: function() {
                var contacts = this.getOrder().get('customer').get('contacts').toJSON();
                return contacts && contacts.length > 0 && contacts;
            },
            initialize: function() {
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
            next: function () {
                if (this.validate()) return false;
                var parent = this.parent,
                    me = this,
                    isAddressValidationEnabled = Hypr.engine.options.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = Hypr.engine.options.locals.siteContext.generalSettings.allowInvalidAddresses;
                this.isLoading(true);
                var addr = this.get('address');
                var completeStep = function () {
                    $('.mz-messagebar').html('');
                    parent.syncApiModel();
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
                }

                var promptValidatedAddress = function () {
                    parent.syncApiModel();
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.stepStatus('invalid');
                }

                if (!isAddressValidationEnabled) {
                    completeStep();
                } else {
                    if (addr.get('candidateValidatedAddresses') == null) {
                        addr.apiModel.validateAddress().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                var addrCompare = function (addr, valAddr) {
                                    var s1 = '',
                                        s2 = '';
                                    for (var k in valAddr) {
                                        if (k === 'isValidated')
                                            continue;
                                        s1 = (valAddr[k] || '').toLowerCase();
                                        s2 = (addr.get(k) || '').toLowerCase();
                                        if (s1 != s2) {
                                            return -1;
                                        }
                                    }
                                    return 0;
                                };
                                var addrIsDifferent = false;
                                for (var i = 0; i < resp.data.addressCandidates.length; i++) {
                                    if (addrCompare(addr, resp.data.addressCandidates[i]) == 0) {
                                        completeStep();
                                        return;
                                    }
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
                                $('.mz-messagebar').html('');
                                completeStep();
                            } else {
                                //$('.mz-messagebar').html('The address you entered could not be validated. Please check your address and try again.');
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
                var newMethod;
                if (code) newMethod = _.findWhere(this.get("availableShippingMethods"), { shippingMethodCode: code });
                if (newMethod) {
                    this.set(newMethod);
                }
            },
            next: function () {
                if (this.validate()) return false;
                var me = this;
                this.isLoading(true);
                this.getOrder().apiModel.update({ fulfillmentInfo: me.toJSON() }).ensure(function () {
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
                }
            },
            dataTypes: {
                "isSameBillingShippingAddress": Backbone.MozuModel.DataTypes.Boolean,
                "isCardInfoSaved": Backbone.MozuModel.DataTypes.Boolean
            },
            relations: {
                billingContact: CustomerModels.Contact,
                card: PaymentMethods.CreditCard,
                check: PaymentMethods.Check
            },
            helpers: ['savedPaymentMethods'],
            savedPaymentMethods: function() {
                var cards = this.getOrder().get('customer').get('cards').toJSON();
                return cards && cards.length > 0 && cards;
            },
            initialize: function() {
                var me = this;
                this.on('change:paymentType', function (model, newPaymentType) {
                    me.selectPaymentType(newPaymentType);
                });
                this.selectPaymentType(this.get('paymentType'));
                this.on('change:isSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                        this.get('billingContact').set(this.parent.get('fulfillmentInfo').get('fulfillmentContact').toJSON(), { silent: true });
                    }
                });
                this.on('change:savedPaymentMethodId', function (me, newId) {
                    if (!newId || newId === "new") {
                        me.get('billingContact').clear();
                        me.get('card').clear();
                        me.get('check').clear();
                        me.unset('paymentType');
                    } else {
                        var customer = me.getOrder().get('customer'),
                            card = customer.get('cards').get(newId),
                            cardBillingContact = card && customer.get('contacts').get(card.get('contactId'));
                        if (card) {
                            me.get('billingContact').set(cardBillingContact.toJSON());
                            me.get('card').set(card.toJSON());
                            me.set('paymentType', 'CreditCard');
                        }
                    }
                });
            },
            selectPaymentType: function(newPaymentType) {
                this.get('check').selected = newPaymentType == "Check";
                this.get('card').selected = newPaymentType == "CreditCard";
            },
            calculateStepStatus: function() {
                this.stepStatus(!!this.parent.get('fulfillmentInfo').get('shippingMethodCode') ? (
                    this.isValid(true) ? 'complete' : 'invalid')
                    : 'new');
            },
            getPaypalUrls: function() {
                var base = window.location.href + (window.location.href.indexOf('?') !== -1 ? "&" : "?");
                return {
                    paypalReturnUrl: base + "PaypalExpress=complete",
                    paypalCancelUrl: base + "PaypalExpress=canceled"
                }
            },
            submit: function () {
                if (!this.validate()) {
                    this.stepStatus("complete");
                    this.getOrder().isReady(true);
                }
            },
            applyPayment: function() {
                var order = this.getOrder();
                if (this.get("paymentType") === "PaypalExpress") {
                    this.set(this.getPaypalUrls());
                } else {
                    this.unset('paypalReturnUrl');
                    this.unset('paypalCancelUrl');
                }
                return order.apiAddPayment().then(function() {
                    var payment = order.apiModel.getActivePayment();
                    if (payment.paymentType !== "PaypalExpress") {
                        order.isReady(true);
                    }
                });
            }
        });



        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'emailAddress': {
                fn: function(value) {
                    if (this.attributes.createAccount && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing')
                }
            },
            'password': {
                fn: function(value) {
                    if (this.attributes.createAccount && !value) return Hypr.getLabel('passwordMissing')
                }
            },
            'confirmPassword': {
                fn: function(value) {
                    if (this.attributes.createAccount && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch')
                }
            },
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            }
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
                createAccount: Backbone.MozuModel.DataTypes.Boolean
            },
            initialize: function () {
                var self = this;
                _.defer(function () {
                    var payment = self.apiModel.getActivePayment();
                    if (payment) {
                        if (payment.paymentType === "Check") self.isReady(true);
                        if (payment.paymentType === "PaypalExpress" && window.location.href.indexOf('PaypalExpress=complete') !== -1) self.isReady(true);
                    }
                });
                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'apiCheckout');
            },
            addCoupon: function () {
                var me = this;
                this.isLoading(true);
                return this.apiAddCoupon(this.get('couponCode')).then(function () {
                    me.set('couponCode', '');
                    me.isLoading(false);
                });
            },
            onCheckoutSuccess: function () {
                this.trigger('complete');
            },
            onCheckoutError: function (error) {
                var order = this;
                order.isLoading(false);
                if (!error || !error.items) error = {
                    items: [
                        {
                            message: Hypr.getLabel('unknownError')
                        }
                    ]
                };
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.errorCode === "MISSING_OR_INVALID_PARAMETER" && errorItem.additionalErrorData && errorItem.additionalErrorData[0] && errorItem.additionalErrorData[0].value === "password" && errorItem.additionalErrorData[0].name === "ParameterName") {
                        order.trigger('passwordinvalid', errorItem.message.substring(errorItem.message.indexOf('Password')));
                    } else {
                        order.messages.add(errorItem);
                    }
                });
            },
            addNewCustomer: function() {
                var self = this,
                    billingContact = this.get('billingInfo').get('billingContact'),
                    email = this.get('emailAddress');
                return this.apiAddNewCustomer({
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: billingContact.get("firstName"),
                        lastName: billingContact.get("lastNameOrSurname")
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    // this should only happen once per session--if the order tries to do it again, bad things happen
                    self.customerCreated = true;
                    self.trigger('sync', self);
                });
            },
            submit: function () {
                var order = this,
                    operation;

                if (this.validate()) return false;
                this.isLoading(true);
                operation = this.get('billingInfo').applyPayment();
                if (this.get("createAccount") && !this.customerCreated) {
                    operation = operation.then(this.addNewCustomer);
                } 
                if (this.get('shopperNotes').has('comments')) {
                    operation = operation.then(this.update);
                }
                operation.then(this.apiCheckout).then(this.onCheckoutSuccess, this.onCheckoutError).done();

            },
            update: function() {
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
        }
    }
);
