define(
    ["modules/jquery-plus", "modules/knockout-plus", "pciaas", "modules/knockout-viewmodel", "i18n!nls/messages-checkout", "i18n!nls/messages", "modules/api", "modules/models-user", "modules/models-address"],
    function ($, ko, PCIaaS, ViewModelPrototype, msg, genericMsg, api, UserModels, AddressModels) {


        //function modelObservableValueIs(obsName, desiredValue) {
        //    return function () {
        //        return this[obsName]() == desiredValue;
        //    }
        //}

        function submitStep() {
            if (this.submit()) this.stepStatus("submitting");
        }

        function editStep() {
            this.stepStatus("incomplete");
        }

        
        var ShippingAddress = ViewModelPrototype.extend({
            statics: {
                "Id": ""
            },
            observables: {
                "FirstName": { required: msg.FirstNameMissing },
                "LastNameOrSurname": { required: msg.LastNameMissing },
                "CompanyOrOrganization": {},
                "stepStatus": {}
            },
            submodels: {
                "Address": AddressModels.StreetAddress,
                "PhoneNumbers": AddressModels.PhoneNumbers
            },
            edit: editStep,
            nextStep: function () {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                var self = this;
                var parent = this.getParentModel();
                parent.update({ ShippingContact: self.toJS() }).then(function () {
                    self.stepStatus('submitting');
                    parent.getShippingMethods().then(function (methodsJSON) {
                        self.stepStatus('complete');
                        parent.availableShippingMethods(methodsJSON);
                    });
                }, function (e) {
                    parent.getParentModel().messages.push(e.message);
                    self.stepStatus('invalid')
                });
            },
            checkStepStatus: function () {
                if (!this.stepStatus) this.stepStatus = ko.observable();
                var newStepStatus = this.validate(false) ? 'complete' : 'invalid';
                this.stepStatus(newStepStatus);
                return newStepStatus;
            }

        }, function constructShippingAddress() {
            this.stepStatus = ko.observable("incomplete");
            this.checkStepStatus();
        }),

        Price = ViewModelPrototype.extend({
            observables: {
                ISOCurrencyCode: {},
                Cost: { numeric: 2 },
                Price: { numeric: 2 }
            }
        }),

        Shipment = ViewModelPrototype.extend({
            mozuType: 'shipment',
            statics: {
                "OrderId": ""
            },
            observables: {
                "ShippingMethodCode": { required: msg.ShippingMethodMissing },
                "ShippingMethodName": {}
            },
            observableArrays: {
                "availableShippingMethods": {}
            },
            submodels: {
                ShippingAddress: ShippingAddress,
                Price: Price
            },
            edit: editStep,
            nextStep: function () {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                var self = this;
                var parent = this.getParentModel();
                this.update().then(function () {
                    if (self.checkStepStatus() === "complete") {
                        parent.get()
                    }
                });
            },
            checkStepStatus: function () {
                var st = "new", available = this.availableShippingMethods();
                if (available && available.length) st = this.chosenMethod() ? "complete" : "invalid";
                this.stepStatus(st);
                var parent = this.getParentModel();
                return st;
            }
        }, function (conf) {
            var self = this;
            

            // calculating this observable has side effects, namely, autoselecting the first shipping method in a list if no available method is selected
            this.chosenMethod = ko.computed(function () {
                var code = self.ShippingMethodCode(),
                    available = self.availableShippingMethods(),
                    chosen;
                if (!code || !available || !available.length) {
                    return null;
                }
                chosen = ko.utils.arrayFirst(available, function (m) {
                    return m.ShippingMethodCode && m.ShippingMethodCode.toLowerCase() == code.toLowerCase();
                });
                if (chosen) {
                    self.ShippingMethodCode(chosen.ShippingMethodCode);
                    self.Price.Price(chosen.Price);
                    self.ShippingMethodName(chosen.ShippingMethodName);
                };
                return chosen;
            });

            this.stepStatus = ko.observable('new');
            this.checkStepStatus();
            this.availableShippingMethods.subscribe($.proxy(this.checkStepStatus, this));
        }),

        paymentTypeIsCreditCard = function () {
            return this.getParentModel().PaymentType() === "Credit Card";
        },
        paymentTypeIsCheck = function () {
            return this.getParentModel().PaymentType() === "Check";
        },
        expirationDateLaterThanToday = function () {
            var expMonth = parseInt(this.ExpireMonth()),
                expYear = parseInt(this.ExpireYear()),
                exp,
                thisMonth,
                isValid;

            if (isNaN(expMonth) || isNaN(expYear)) return false;

            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            isValid = exp >= thisMonth;
            // small cheat here--revalidate card expire month at the same time
            this.ExpireMonth.invalid(!isValid);
            return isValid;
        },

        parentBillingAddressRequired = function () {
            return this.getParentModel().PaymentType() === "CreditCard" && !parent.IsSameBillingShippingAddress();
        },
        grandparentBillingAddressRequired = function () {
            return parentBillingAddressRequired.call(this.getParentModel());
        },


        BillingStreetAddress = ViewModelPrototype.extend($.extend(true, {}, AddressModels.addressConf, {
            observables: {
                "Address1": {
                    required: {
                        message: msg.StreetMissing,
                        onlyIf: grandparentBillingAddressRequired
                    }
                },
                "CityOrTown": {
                    required: {
                        message: msg.CityMissing,
                        onlyIf: grandparentBillingAddressRequired
                    }
                },
                "StateOrProvince": {
                    required: {
                        message: msg.StateProvMissing,
                        invalidateOnChange: false,
                        onlyIf: grandparentBillingAddressRequired
                    }
                },
                "PostalOrZipCode": {
                    required: {
                        message: msg.PostalCodeMissing,
                        onlyIf: grandparentBillingAddressRequired
                    }
                },
                "CountryCode": {
                    required: {
                        message: msg.CountryMissing,
                        invalidateOnChange: false,
                        onlyIf: grandparentBillingAddressRequired
                    }
                }
            }
        }), AddressModels.constructAddress),

        BillingAddress = ViewModelPrototype.extend({
            statics: {
                "Id": ""
            },
            observables: {
                "Email": {
                    required: {
                        onlyIf: parentBillingAddressRequired,
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                    }
                },
                "FirstName": {
                    required: {
                        onlyIf: parentBillingAddressRequired
                    },
                },
                "MiddleNameOrInitial": {},
                "LastNameOrSurname": {
                    required: {
                        onlyIf: parentBillingAddressRequired
                    },
                },
                "CompanyOrOrganization": {}
            },
            submodels: {
                "Address": BillingStreetAddress,
                "PhoneNumbers": AddressModels.PhoneNumbers
            }
        }),

        CreditCard = ViewModelPrototype.extend({
            observables: {
                "PaymentServiceCardId": {},
                "PaymentOrCardType": {
                    required: {
                        message: msg.CardTypeMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "CardNumberPartOrMask": {
                    required: {
                        message: msg.CardNumberMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "ExpireMonth": {
                    required: {
                        message: msg.CardExpInvalid,
                        onlyIf: paymentTypeIsCreditCard,
                        invalidateOnChange: false,
                        fn: expirationDateLaterThanToday
                    }
                },
                "ExpireYear": {
                    required: {
                        message: msg.CardExpInvalid,
                        onlyIf: paymentTypeIsCreditCard,
                        invalidateOnChange: false,
                        fn: expirationDateLaterThanToday
                    }
                },
                "IsUsedRecurring": {},
                "IsSameBillingShippingAddress": {},
                "NameOnCard": {
                    required: {
                        message: msg.CardNameMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "CVV": {
                    required: {
                        message: msg.CardCVVMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "IsCardInfoSaved": {}
            },
            doNotSubmit: ["CVV"]
        }, function () {
            var saveInfo = this.IsCardInfoSaved();
            if (saveInfo !== false) this.IsCardInfoSaved(true);
        }),

        Check = ViewModelPrototype.extend({
            observables: {
                NameOnCheck: {
                    required: {
                        onlyIf: paymentTypeIsCheck
                    }
                },
                RoutingNumber: {
                    required: {
                        onlyIf: paymentTypeIsCheck
                    }
                },
                CheckNumber: {
                    required: {
                        onlyIf: paymentTypeIsCheck
                    }
                }
            }
        }),

        Payment = ViewModelPrototype.extend({
            //endpoint: "/resources/scripts/fixtures/checkout-updatepaymentsection.json",
            //endpoint: "/checkout/updatepayment",
            mozuType: 'payment',
            observables: {
                "PaymentType": { required: msg.PaymentMethodMissing },
                "IsSameBillingShippingAddress": {}
            },
            submodels: {
                "Card": CreditCard,
                "Check": Check,
                "BillingContact": BillingAddress
            },
            edit: editStep,
            submit: function () {
                var self = this;
                if (this.validate()) {
                    if (this.paymentTypeIsCreditCard()) {
                        return this.pciProcessor.process();
                    } else {
                        return self.update().then(function () {
                            self.checkStepStatus();
                        });
                    }
                } else {
                    return false;
                }
            },
            nextStep: submitStep
        }, function () {
            var self = this;
            this.stepStatus = ko.observable();
            var shipmentStatus = self.getParentModel().Shipment.stepStatus,
                checkStatus = function (newValue) {
                    self.stepStatus(newValue === "complete" ? "incomplete" : "new");
                };
            shipmentStatus.subscribe(checkStatus);
            checkStatus(shipmentStatus());
                
            // on initial load, this is only complete if we are loading a saved order in progress. in case of credit card, we need to allow for the PCI holes to be refilled.

            if (paymentTypeIsCreditCard.apply(this.Card) && this.Card.CardNumberPartOrMask()) {
                this.Card.ExpireMonth.validate();
                this.Card.ExpireYear.validate();
                this.Card.CVV.validate();
                this.Card.ExpireYear.validationMessage(msg.ReEnterExpDate);
                this.Card.CVV.validationMessage(msg.ReEnterCVV);
            }

            this.pciProcessor = PCIaaS({
                fields: {
                    CardType: this.PaymentType,
                    CardNumber: this.Card.CardNumberPartOrMask,
                    CVV: this.Card.CVV,
                    PersistCard: this.Card.IsCardInfoSaved,
                    HiddenCardID: this.Card.PaymentServiceCardId
                },
                events: {
                    success: function () {
                        self.pciProcessor.applyMask();
                        self.update().then(function () {
                            self.stepStatus("complete");
                        }), function () {
                            self.stepStatus("invalid");
                        };
                    }
                },
                settings: {
                    framePath: "/Assets/pci_receiver.html",
                    siteId: api.context.Site(),
                    tenantId: api.context.Tenant()
                }
            });

            // expose some of the helper functions to templates
            this.billingAddressRequired = ko.computed(function () {
                return self.PaymentType() === "CreditCard" && !self.IsSameBillingShippingAddress();
            });
            this.paymentTypeIsCreditCard = ko.computed(function () {
                return self.PaymentType() === "CreditCard";
            });
            this.paymentTypeIsCheck = ko.computed(function () {
                return self.PaymentType() === "Check";
            });

        }),

        isCreatingAccount = function () {
            return this.createAccount();
        },
        isNotCreatingAccount = function () {
            return !isCreatingAccount.apply(this);
        },

        Note = ViewModelPrototype.extend({
            mozuType: 'ordernote',
            statics: {
                "Id": "",
                "orderId": ""
            },
            observables: {
                "Text": {}
            }
        }),

        CheckoutPage = ViewModelPrototype.extend({
            mozuType: 'order',
            hasMessages: true,
            statics: {
                Id: "",
                ISOCurrencyCode: "usd"
            },
            submodels: {
                Shipment: Shipment,
                Payment: Payment,
                Note: Note,
                User: UserModels.User
            },
            observables: {
                CouponCode: {},
                Subtotal: { numeric: 2 },
                ShippingTotal: { numeric: 2 },
                TaxTotal: { numeric: 2 },
                Total: { numeric: 2 },
                Items: {},
                createAccount: {},
                agreeToTerms: { required: msg.DidNotAgreeToTerms },
                submittingCoupon: {},
                email: {
                    blankIf: isNotCreatingAccount,
                    required: {
                        onlyIf: isCreatingAccount,
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                        message: msg.EmailMissing
                    }
                },
                password: {
                    blankIf: isNotCreatingAccount,
                    required: {
                        onlyIf: isCreatingAccount,
                        message: msg.PasswordMissing
                    },
                },
                confirmPassword: {
                    blankIf: isNotCreatingAccount,
                    required: {
                        onlyIf: isCreatingAccount,
                        fn: function (newValue) {
                            return this.password() == newValue;
                        },
                        message: msg.PasswordsDoNotMatch
                    }
                }
            },
            addCoupon: function() {
                var self = this;
                this.submittingCoupon(true);
                this.applyCoupon(this.CouponCode()).then(function() {
                    return self.get();
                }).then(function() {
                    self.submittingCoupon(false);
                });
            },
            submit: function() {
                var order = this,
                    apiSteps = [];
                if (!this.validate()) return false;
                this.submitting(true);
                this.messages([]);
                if (this.createAccount()) {
                    apiSteps.push(function () {
                        return order.User.create();
                    }, function () {
                        return order.User.login({
                            EmailAddress: order.email(),
                            Password: order.password()
                        });
                    }, function (login) {
                        // TODO: add a cool api login method
                        api.context.UserClaims(login.data.AuthTicket.AccessToken);
                        return order.setUserId();
                    });
                }
                if (order.Note.Text()) {
                    apiSteps.push(function () {
                        return order.Note.create();
                    });
                }
                apiSteps.push(function () {
                    return order.getAvailableActions();
                }, function (availableActions) {
                    if (availableActions.indexOf('SubmitOrder') !== -1)
                        return order.performOrderAction('SubmitOrder');
                    if (availableActions.indexOf('CancelOrder') !== -1)
                        return successHandler(order.apiModel.data);
                });

                var failHandler = function (error) {
                    console.log('noooo', error, error.message);
                    order.submitting(false);
                    $.each(error.Items, function (ix, errorItem) {
                        if (errorItem.ErrorCode === "MISSING_OR_INVALID_PARAMETER" && errorItem.AdditionalErrorData && errorItem.AdditionalErrorData[0] && errorItem.AdditionalErrorData[0].Value === "password" && errorItem.AdditionalErrorData[0].Name === "ParameterName") {
                            order.password.validationMessage(errorItem.Message.substring(errorItem.Message.indexOf('Password')));
                            order.password.invalid(true);
                        } else {
                            order.messages.push({ Message: errorItem.Message });
                        }
                    });
                }, successHandler = function (completedOrder) {
                    //$.cookie.raw = true;
                    //$.cookie('order', 'lastorderid=' + completedOrder.Id + ';', { path: '/' });
                    return order.publish('complete');
                };

                api.steps.apply(api, apiSteps).then(function (completedOrder) {
                    order.submitting(false);
                    if (completedOrder.data.OrderStatus === "Open") {
                        successHandler(completedOrder.data);
                    } else {
                        failHandler(completedOrder);
                    }
                }, failHandler);
            },
            editCart: function () {
                window.location = "/cart";
            },
            endSubmit: function () {
                var self = this;
                // clean up models that weren't unsubmitted by the populate
                $.each(this.submodels, function (smName) {
                    if (self[smName].stepStatus && self[smName].stepStatus() == "submitting") self[smName].stepStatus("invalid");
                });
            },
            errorTimeout: 30000
        }, function (conf) {

            var self = this;

            this.unknownError = function () {
                this.messages.push({ Message: genericMsg.UnexpectedError });
                this.endSubmit();
            };

            this.Payment.pciProcessor.events.error = function (messages) {
                self.messages(messages);
                self.Payment.stepStatus("invalid");
            };

            this.Payment.pciProcessor.settings.set({
                apiBase: this.paymentApiBase
            });

            $.each(this.submodels, function (smName) {
                self[smName].orderId = self.Id;
                if (self[smName].apiModel && self[smName].apiModel.data) self[smName].apiModel.data.orderId = self.Id;
            });

            this.User.EmailAddress = this.email;
            this.User.Password = this.password;

            this.Shipment.availableShippingMethods(this.availableShippingMethods);
            this.Shipment.checkStepStatus();

            var ALLCOMPLETE = "completecompletecomplete",
                SUBMITTING = "submitting",
                errorTimer,
                backstop = $.proxy(this.unknownError,this);

            this.orderStatus = ko.computed(function () {
                var statuses = [self.Shipment.ShippingAddress.stepStatus(), self.Shipment.stepStatus(), self.Payment.stepStatus()].join("");

                clearTimeout(errorTimer);
                if (statuses.indexOf(SUBMITTING) !== -1) {
                    errorTimer = setTimeout(backstop, self.errorTimeout);
                }

                return statuses == ALLCOMPLETE;
            });

        });

        return {
            CheckoutPage: CheckoutPage
        }
    }
);
