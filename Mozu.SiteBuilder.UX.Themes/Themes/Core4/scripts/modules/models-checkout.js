define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "modules/models-user",
    "modules/models-customer",
    "modules/models-address",
    "modules/models-paymentmethods"
],
    function ($, _, Hypr, Backbone, api, UserModels, CustomerModels, AddressModels, PaymentMethods) {

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
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            next: function () {
                if (this.validate()) return false;
                var parent = this.parent, me = this;
                this.isLoading(true);
                parent.syncApiModel();
                parent.apiModel.getShippingMethodsFromContact().then(function(methods) {
                    return parent.set({
                        availableShippingMethods: methods
                    });
                }).ensure(function () {
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.calculateStepStatus();
                    parent.calculateStepStatus();
                });
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
            },
            selectPaymentType: function(newPaymentType) {
                this.get('check').selected = newPaymentType == "Check";
                this.get('card').selected = newPaymentType == "CreditCard";
                this.trigger('paymentchange');
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
                var self = this, order = self.getOrder();
                if (self.validate()) return false;
                if (this.get("paymentType") === "PaypalExpress") {
                    this.set(this.getPaypalUrls());
                } else {
                    this.unset(this.getPaypalUrls());
                }
                this.syncApiModel();
                order.syncApiModel();
                this.isLoading(true);
                order.apiModel.addPayment().then(function () {
                    var payment = order.apiModel.getActivePayment();
                    if (!payment.paymentType === "PaypalExpress") {
                        self.stepStatus("complete");
                        self.isLoading(false);
                        order.isReady(true);
                    }
                }, function () {
                    self.isLoading(false);
                    self.stepStatus("invalid");
                }).done();
            }
        });



        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'user.emailAddress': {
                fn: function(value) {
                    if (this.validateUser && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing')
                }
            },
            'user.password': {
                fn: function(value) {
                    if (this.validateUser && !value) return Hypr.getLabel('passwordMissing')
                }
            },
            'user.confirmPassword': {
                fn: function(value) {
                    if (this.validateUser && value !== this.get('user').get('password')) return Hypr.getLabel('passwordsDoNotMatch')
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
                user: UserModels.User
            },
            validation: checkoutPageValidation,
            dataTypes: {
                createAccount: Backbone.MozuModel.DataTypes.Boolean
            },
            unsetUserIfNoCreateAccount: function(self, yes) {
                self.validateUser = yes;
                if (!yes) self.unset("user");
            },
            initialize: function () {
                this.on('change:createAccount', this.unsetUserIfNoCreateAccount);
                var self = this;
                _.defer(function () {
                    self.unsetUserIfNoCreateAccount(self, self.get('createAccount'));
                    var payment = self.apiModel.getActivePayment();
                    if (payment) {
                        if (payment.paymentType === "Check") self.isReady(true);
                        if (payment.paymentType === "PaypalExpress" && window.location.href.indexOf('PaypalExpress=complete') !== -1) self.isReady(true);
                    }
                });
            },
            addCoupon: function () {
                var me = this;
                this.isLoading(true);
                return this.apiApplyCoupon(this.get('couponCode')).then(function () {
                    return me.apiModel.get();
                }).then(function () {
                    me.set('couponCode', '');
                    me.isLoading(false);
                });
            },
            onCheckoutSuccess: function () {
                var order = this,
                    user = order.get('user');
                if (order.get('createAccount') && user) {
                    $.post('/user/login', {
                        email: user.get('emailAddress'),
                        password: user.get("password")
                    }).then(function () {
                        return order.trigger('complete');
                    });
                } else {
                    order.trigger('complete');
                }
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
            submit: function() {
                var order = this, process = [];
                if (this.validate()) return false;
                this.isLoading(true);
                if (this.get("createAccount")) {
                    var user = this.get("user");
                    process.push(function () {
                        return user.apiCreate();
                    }, function() {
                        return user.apiLogin({
                            emailAddress: user.get('emailAddress'),
                            password: user.get('password')
                        });
                    },function(login) {
                        return order.apiSetUserId();
                    });
                } 
                if (order.get('shopperNotes').has('comments')) process.push(function() {
                    return order.update();
                });
                process.push(function(error) {
                    if (order.apiModel.isReadyForSubmit()) {
                        return order.apiModel.submitOrder();
                    }
                    if (order.apiModel.isComplete()) {
                        return order.onCheckoutSuccess();
                    }
                    return order.onCheckoutError(error);
                });

                api.steps(process).then(function (error) {
                    if (order.apiModel.isComplete()) {
                        order.onCheckoutSuccess();
                    } else {
                        order.onCheckoutError(error);
                    }
                }, function (error) {
                    order.onCheckoutError(error);
                }).done();
            },
            update: function() {
                return this.apiModel.update(this.toJSON());
            },
            isReady: function (val) {
                this.set("isReady", val);
            }
        });

        return {
            CheckoutPage: CheckoutPage
        }
    }
);
