define(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/backbone-mozu", "pciaas", "modules/api", "modules/models-user", "modules/models-address"],
    function ($, _, Backbone, PCIaaS, api, UserModels, AddressModels) {

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

        FulfillmentContact = CheckoutStep.extend({
            relations: {
                address: AddressModels.StreetAddress,
                phoneNumbers: AddressModels.PhoneNumbers
            },
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            validation: {
                firstName: {
                    required: true,
                    msg: require.mozuLabel('firstNameMissing')
                },
                lastNameOrSurname: {
                    required: true,
                    msg: require.mozuLabel('lastNameMissing')
                }
            },
            next: function () {
                if (this.validate()) return false;
                var parent = this.parent, me = this;
                this.isLoading(true);
                //parent.apiModel.update({ FulfillmentContact: this.toJSON() }).then(function () {
                //    return parent.apiGetShippingMethods();
                //}).then(function (methods) {
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
                    msg: require.mozuLabel('chooseShippingMethod')
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

        // payment methods only validate if they are selected!
        PaymentMethod = Backbone.MozuModel.extend({
            present: function (value, attr) {
                if (!this.selected) return undefined;
                if (!value) return this.validation[attr.split('.').pop()].msg || require.mozuLabel('genericRequired');
            }
        });

        CreditCard = PaymentMethod.extend({
            validation: {
                paymentOrCardType: {
                    fn: "present",
                    msg: require.mozuLabel('cardTypeMissing')
                },
                cardNumberPartOrMask: {
                    fn: "present",
                    msg: require.mozuLabel('cardNumberMissing')
                },
                expireMonth: {
                    fn: 'expirationDateInPast'
                },
                expireYear: {
                    fn: 'expirationDateInPast'
                },
                nameOnCard: {
                    fn: "present",
                    msg: require.mozuLabel('cardNameMissing')
                },
                cvv: {
                    fn: "present",
                    msg: require.mozuLabel('securityCodeMissing')
                }
            },
            dataTypes: {
                expireMonth: Backbone.MozuModel.DataTypes.Int,
                expireYear: Backbone.MozuModel.DataTypes.Int,
                isCardInfoSaved: Backbone.MozuModel.DataTypes.Boolean
            },
            expirationDateInPast: function (value, attr, computedState) {
                if (!this.selected) return undefined;
                var expMonth = this.get('expireMonth'),
                    expYear = this.get('expireYear'),
                    exp,
                    thisMonth,
                    isValid;

                if (isNaN(expMonth) || isNaN(expYear)) return false;

                exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
                thisMonth = new Date();
                thisMonth.setDate(1);
                thisMonth.setHours(0, 0, 0, 0);

                isValid = exp >= thisMonth;
                if (!isValid) return require.mozuLabel('cardExpInvalid');
            }
        }),

        Check = PaymentMethod.extend({
            validation: {
                nameOnCheck: {
                    fn: "present"
                },
                routingNumber: {
                    fn: "present"
                },
                checkNumber: {
                    fn: "present"
                }
            }
        }),

        BillingContact = Backbone.MozuModel.extend({
            relations: {
                address: AddressModels.StreetAddress,
                phoneNumbers: AddressModels.PhoneNumbers
            },
            validation: {
                firstName: {
                    required: true,
                    msg: require.mozuLabel('firstNameMissing')
                },
                lastNameOrSurname: {
                    required: true,
                    msg: require.mozuLabel('lastNameMissing')
                }
            }
        }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                paymentType: {
                    required: true,
                    msg: require.mozuLabel('paymentTypeMissing')
                },

            },
            dataTypes: {
                "isSameBillingShippingAddress": Backbone.MozuModel.DataTypes.Boolean,
                "isCardInfoSaved": Backbone.MozuModel.DataTypes.Boolean
            },
            relations: {
                billingContact: BillingContact,
                card: CreditCard,
                check: Check
            },
            constructor: function (conf) {
                var me = this;
                CheckoutStep.apply(this, arguments),

                pciSettings = {
                    framePath: "/../../Assets/pci_receiver.html",
                    siteId: api.context.Site(),
                    tenantId: api.context.Tenant(),
                    apiBase: api.context.getServiceUrls().paymentService
                },

                fields = {};
                // create jQuery-style accessor functions for PCIaaS
                _.each(['paymentOrCardType', 'cardNumberPartOrMask', 'cvv', 'isCardInfoSaved', 'paymentServiceCardId'], function (prop) {
                    fields[prop] = function (val) {
                        var card = me.get("Card");
                        if (!card) return undefined;
                        if (arguments.length > 0) return card.set(prop, val);
                        return card.get(prop);
                    };
                });
                this.pciProcessor = PCIaaS({
                    fields: {
                        CardType: fields.paymentOrCardType,
                        CardNumber: fields.cardNumberPartOrMask,
                        CVV: fields.cvv,
                        PersistCard: fields.isCardInfoSaved,
                        HiddenCardID: fields.paymentServiceCardId
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
            // the toJSON method should omit the CVV so it is not sent to the wrong API
            toJSON: function (options) {
                var j = PaymentMethod.prototype.toJSON.apply(this);
                if (j.card && (!options || !options.helpers)) delete j.card.cvv;
                return j;
            },
            calculateStepStatus: function() {
                this.stepStatus(!!this.parent.get('fulfillmentInfo').get('shippingMethodCode') ? (
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
                if (this.get('paymentType') === "CreditCard") return this.pciProcessor.process();
                return this.updateOrder();
            }
        });



        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'user.emailAddress': {
                fn: function(value) {
                    if (this.validateUser && (!value || !value.match(Backbone.Validation.patterns.email))) return require.mozuLabel('emailMissing')
                }
            },
            'user.password': {
                fn: function(value) {
                    if (this.validateUser && !value) return require.mozuLabel('passwordMissing')
                }
            },
            'user.confirmPassword': {
                fn: function(value) {
                    if (this.validateUser && value !== this.get('User.password')) return require.mozuLabel('passwordsDoNotMatch')
                }
            },
        };

        if (require.mozuThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: require.mozuLabel('didNotAgreeToTerms')
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
            initialize: function() {
                this.on('change:createAccount', function (me, yes) {
                    me.validateUser = yes;
                    if (!yes) me.unset("User");
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
            onCheckoutSuccess: function (completedOrder) {
                var order = this,
                    user = order.get('user');
                if (user) {
                    $.post('/login', {
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
                process.push(function() {
                    var availableActions = order.get("availableActions");
                    if (_.indexOf(availableActions, 'SubmitOrder') !== -1)
                        return order.apiPerformOrderAction('SubmitOrder');
                    if (_.indexOf(availableActions, 'CancelOrder') !== -1)
                        // that's the best way we have of knowing that the order is submitted, currently
                        return order.onCheckoutSuccess(order.apiModel.data);
                });

                api.steps(process).then(function (completedOrder) {
                    order.isLoading(false);
                    if (completedOrder.prop("status") === "Submitted") {
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
                this.set("isReady", val);
            }
        });

        return {
            CheckoutPage: CheckoutPage
        }
    }
);
