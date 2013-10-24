define(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/backbone-mozu", "pciaas", "i18n!nls/messages-checkout", "i18n!nls/messages", "modules/api", "modules/models-user", "modules/models-address"],
    function ($, _, Backbone, PCIaaS, messages, genericMessages, api, UserModels, AddressModels) {

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
                var herp = this.validate();
                var newStepStatus = this.isValid() ? 'complete' : 'invalid';
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

        ShippingContact = CheckoutStep.extend({
            relations: {
                Address: AddressModels.StreetAddress,
                PhoneNumbers: AddressModels.PhoneNumbers
            },
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            validation: {
                FirstName: {
                    required: true,
                    msg: messages.FirstNameMissing
                },
                LastNameOrSurname: {
                    required: true,
                    msg: messages.LastNameMissing
                }
            },
            next: function () {
                if (this.validate()) return false;
                var parent = this.parent, me = this;
                this.isLoading(true);
                parent.apiModel.update({ ShippingContact: this.toJSON() }).then(function () {
                    return parent.apiGetShippingMethods();
                }).then(function (methods) {
                    return parent.set({
                        AvailableShippingMethods: methods
                    });
                }).ensure(function () {
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.calculateStepStatus();
                    parent.calculateStepStatus();
                });
            }
        }),

        ShippingInfo = CheckoutStep.extend({
            mozuType: 'shipment',
            initialize: function () {
                // this adds the price and other metadata off the chosen method to the info object itself
                this.updateShippingMethod(this.get('ShippingMethodCode'));
            },
            relations: {
                ShippingContact: ShippingContact
            },
            validation: {
                ShippingMethodCode: {
                    required: true,
                    msg: messages.ShippingMethodMissing
                }
            },
            calculateStepStatus: function () {
                var st = "new", available;
                if (this.get("ShippingContact").stepStatus() !== "complete") {
                    return this.stepStatus("new");
                }
                available = this.get("AvailableShippingMethods");
                if (available && available.length && _.findWhere(available, { ShippingMethodCode: this.get("ShippingMethodCode") })) {
                    return this.stepStatus("complete");
                }
                return this.stepStatus("incomplete");
            },
            updateShippingMethod: function (code) {
                var newMethod;
                if (code) newMethod = _.findWhere(this.get("AvailableShippingMethods"), { ShippingMethodCode: code });
                if (newMethod) {
                    this.set(newMethod);
                }
            },
            next: function () {
                if (this.validate()) return false;
                var me = this;
                this.isLoading(true);
                this.getOrder().apiModel.update({ ShippingInfo: me.toJSON() }).ensure(function () {
                    me.isLoading(false);
                    me.calculateStepStatus();
                    me.parent.get("BillingInfo").calculateStepStatus();
                });
            }
        }),

        // payment methods only validate if they are selected!
        PaymentMethod = Backbone.MozuModel.extend({
            present: function (value, attr) {
                if (!this.selected) return undefined;
                if (!value) return this.validation[attr.split('.').pop()].msg || "Required";
            }
        });

        CreditCard = PaymentMethod.extend({
            validation: {
                PaymentOrCardType: {
                    fn: "present",
                    msg: messages.CardTypeMissing
                },
                CardNumberPartOrMask: {
                    fn: "present",
                    msg: messages.CardNumberMissing
                },
                ExpireMonth: {
                    fn: 'expirationDateInPast'
                },
                ExpireYear: {
                    fn: 'expirationDateInPast'
                },
                NameOnCard: {
                    fn: "present",
                    msg: messages.CardNameMissing
                },
                CVV: {
                    fn: "present",
                    msg: messages.CardCVVMissing
                }
            },
            dataTypes: {
                ExpireMonth: Backbone.MozuModel.DataTypes.Int,
                ExpireYear: Backbone.MozuModel.DataTypes.Int,
                IsCardInfoSaved: Backbone.MozuModel.DataTypes.Boolean
            },
            expirationDateInPast: function (value, attr, computedState) {
                if (!this.selected) return undefined;
                var expMonth = this.get('ExpireMonth'),
                    expYear = this.get('ExpireYear'),
                    exp,
                    thisMonth,
                    isValid;

                if (isNaN(expMonth) || isNaN(expYear)) return false;

                exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
                thisMonth = new Date();
                thisMonth.setDate(1);
                thisMonth.setHours(0, 0, 0, 0);

                isValid = exp >= thisMonth;
                if (!isValid) return messages.CardExpInvalid;
            }
        }),

        Check = PaymentMethod.extend({
            validation: {
                NameOnCheck: {
                    fn: "present"
                },
                RoutingNumber: {
                    fn: "present"
                },
                CheckNumber: {
                    fn: "present"
                }
            }
        }),

        BillingContact = Backbone.MozuModel.extend({
            relations: {
                Address: AddressModels.StreetAddress,
                PhoneNumbers: AddressModels.PhoneNumbers
            },
            validation: {
                FirstName: {
                    required: true,
                    msg: messages.FirstNameMissing
                },
                LastNameOrSurname: {
                    required: true,
                    msg: messages.LastNameMissing
                }
            }
        }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                PaymentType: {
                    required: true,
                    msg: messages.PaymentMethodMissing
                },

            },
            dataTypes: {
                "IsSameBillingShippingAddress": Backbone.MozuModel.DataTypes.Boolean
            },
            relations: {
                BillingContact: BillingContact,
                Card: CreditCard,
                Check: Check
            },
            constructor: function (conf) {
                var me = this;
                CheckoutStep.apply(this, arguments),

                pciSettings = {
                    framePath: "/../../Assets/pci_receiver.html",
                    siteId: api.context.Site(),
                    tenantId: api.context.Tenant(),
                    apiBase: api.context.getServiceUrls().PaymentService
                },

                fields = {};
                // create jQuery-style accessor functions for PCIaaS
                _.each(['PaymentOrCardType', 'CardNumberPartOrMask', 'CVV', 'IsCardInfoSaved', 'PaymentServiceCardId'], function (prop) {
                    fields[prop] = function (val) {
                        var card = me.get("Card");
                        if (!card) return undefined;
                        if (arguments.length > 0) return card.set(prop, val);
                        return card.get(prop);
                    };
                });
                this.pciProcessor = PCIaaS({
                    fields: {
                        CardType: fields.PaymentOrCardType,
                        CardNumber: fields.CardNumberPartOrMask,
                        CVV: fields.CVV,
                        PersistCard: fields.IsCardInfoSaved,
                        HiddenCardID: fields.PaymentServiceCardId
                    },
                    events: {
                        success: function () {
                            me.pciProcessor.applyMask();
                            me.updateOrder();
                        },
                        error: function (messages) {
                            me.trigger('error', { Messages: messages });
                            me.stepStatus("invalid");
                        }
                    },
                    settings: pciSettings
                });
                this.on('change:PaymentType', function (model, newPaymentType) {
                    me.selectPaymentType(newPaymentType);
                });
                this.selectPaymentType(this.get('PaymentType'));
                this.on('change:IsSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                        this.get('BillingContact').set(this.parent.get('ShippingInfo').get('ShippingContact').toJSON(), { silent: true });
                    }
                });
            },
            selectPaymentType: function(newPaymentType) {
                this.get('Check').selected = newPaymentType == "Check";
                this.get('Card').selected = newPaymentType == "CreditCard";
                this.trigger('paymentchange');
            },
            // the toJSON method should omit the CVV so it is not sent to the wrong API
            toJSON: function () {
                var j = PaymentMethod.prototype.toJSON.apply(this);
                if (j.Card) delete j.Card.CVV;
                return j;
            },
            // but since the toJS method relies on toJSON, we need to add it back for templates
            toJS: function () {
                var j = PaymentMethod.prototype.toJS.apply(this);
                if (j.Card) j.Card.CVV = this.get('Card.CVV');
                return j;
            },
            calculateStepStatus: function() {
                this.stepStatus(!!this.parent.get('ShippingInfo').get('ShippingMethodCode') ? (
                    this.isValid(true) ? 'complete' : 'invalid')
                    : 'new');
            },
            updateOrder: function() {
                var me = this,
                    order = me.getOrder();
                order.update().then(function () {
                    me.stepStatus("complete");
                    order.isReady(true);
                }, function () {
                    me.stepStatus("invalid");
                }).ensure(function () {
                    me.isLoading(false);
                });
            },
            submit: function () {
                if (this.validate()) return false;
                if (this.get('PaymentType') === "CreditCard") return this.pciProcessor.process();
                return this.updateOrder();
            }
        });



        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'User.EmailAddress': {
                fn: function(value) {
                    if (this.validateUser && (!value || !value.match(Backbone.Validation.patterns.email))) return messages.EmailMissing;
                }
            },
            'User.Password': {
                fn: function(value) {
                    if (this.validateUser && !value) return messages.PasswordMissing;
                }
            },
            'User.ConfirmPassword': {
                fn: function(value) {
                    if (this.validateUser && value !== this.get('User.Password')) return messages.PasswordsDoNotMatch;
                }
            },
        };

        if (require.mozuThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.AgreeToTerms = {
                acceptance: true,
                msg: messages.DidNotAgreeToTerms
            }
        }

        var CheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'order',
            handlesMessages: true,
            relations: {
                ShippingInfo: ShippingInfo,
                BillingInfo: BillingInfo,
                ShopperNotes: ShopperNotes,
                User: UserModels.User
            },
            validation: ,
            dataTypes: {
                CreateAccount: Backbone.MozuModel.DataTypes.Boolean
            },
            initialize: function() {
                this.on('change:CreateAccount', function (me, yes) {
                    me.validateUser = yes;
                    if (!yes) me.unset("User");
                });
            },
            addCoupon: function () {
                var me = this;
                this.isLoading(true);
                return this.apiApplyCoupon(this.get('CouponCode')).then(function () {
                    return me.apiModel.get();
                }).then(function () {
                    me.set('CouponCode', '');
                    me.isLoading(false);
                });
            },
            onCheckoutSuccess: function (completedOrder) {
                var order = this,
                    user = order.get('User');
                if (user) {
                    $.post('/login', {
                        email: user.get('EmailAddress'),
                        password: user.get("Password")
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
                $.each(error.Items, function (ix, errorItem) {
                    if (errorItem.ErrorCode === "MISSING_OR_INVALID_PARAMETER" && errorItem.AdditionalErrorData && errorItem.AdditionalErrorData[0] && errorItem.AdditionalErrorData[0].Value === "password" && errorItem.AdditionalErrorData[0].Name === "ParameterName") {
                        order.trigger('passwordinvalid', errorItem.Message.substring(errorItem.Message.indexOf('Password')));
                    } else {
                        order.messages.add({ Message: errorItem.Message });
                    }
                });
            },
            submit: function() {
                var order = this, process = [];
                if (this.validate()) return false;
                this.isLoading(true);
                if (this.get("CreateAccount")) {
                    var user = this.get("User");
                    process.push(function () {
                        return user.apiCreate();
                    }, function() {
                        return user.apiLogin({
                            EmailAddress: user.get('EmailAddress'),
                            Password: user.get('Password')
                        });
                    },function(login) {
                        return order.apiSetUserId();
                    });
                } 
                if (order.get('ShopperNotes').has('Comments')) process.push(function() {
                    return order.update();
                });
                process.push(function() {
                    var availableActions = order.get("AvailableActions");
                    if (_.indexOf(availableActions, 'SubmitOrder') !== -1)
                        return order.apiPerformOrderAction('SubmitOrder');
                    if (_.indexOf(availableActions, 'CancelOrder') !== -1)
                        // that's the best way we have of knowing that the order is submitted, currently
                        return order.onCheckoutSuccess(order.apiModel.data);
                });

                api.steps(process).then(function (completedOrder) {
                    order.isLoading(false);
                    if (completedOrder.prop("Status") === "Submitted") {
                        order.onCheckoutSuccess(completedOrder.data);
                    } else {
                        order.onCheckoutError(completedOrder);
                    }
                }, function (error) {
                    order.onCheckoutError(error);
                });
            },
            update: function() {
                return this.apiModel.update(this.toJSON());
            },
            isReady: function (val) {
                this.set("IsReady", val);
            }
        });

        return {
            CheckoutPage: CheckoutPage
        }
    }
);
