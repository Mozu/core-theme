define(
    ["modules/jquery-plus", "modules/knockout-plus", "pciaas", "modules/knockout-viewmodel", "i18n!nls/messages-checkout", "i18n!nls/messages", "modules/api", "modules/models-user", "modules/models-address"],
    function ($, ko, PCIaaS, ViewModelPrototype, msg, genericMsg, api, UserModels, AddressModels) {

        var Step = ViewModelPrototype.extend({
            hasMessages: true,
            observables: {
                "stepStatus": {}
            },
            edit: function () {
                this.stepStatus("incomplete")
            },
            nextStep: function() {
                if (this.submit()) this.stepStatus("submitting");
            },
        }, function () {
            var self = this;
            this.getParentModel().on('error', function () {
                if (self.stepStatus() === "submitting") self.stepStatus("invalid");
            });
        });


        var ShippingPhone = AddressModels.PhoneNumbers.extend({
            observables: {
                Home: {
                    required: genericMsg.PhoneMissing
                }
            }
        });
        
        var ShippingAddress = Step.extend({
            statics: {
                "Id": ""
            },
            observables: {
                "FirstName": { required: msg.FirstNameMissing },
                "LastNameOrSurname": { required: msg.LastNameMissing },
                "CompanyOrOrganization": {}
            },
            submodels: {
                "Address": AddressModels.StreetAddress,
                "PhoneNumbers": ShippingPhone
            },
            nextStep: function () {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                this.messages([]);
                var self = this;
                var parent = this.getParentModel();
                parent.update().then(function () {
                    self.stepStatus('submitting');
                    parent.getShippingMethods().then(function (methodsJSON) {
                        self.stepStatus('complete');
                        parent.availableShippingMethods(methodsJSON);
                    });
                }, function (e) {
                    self.messages.push(e.Message);
                    self.stepStatus('invalid')
                });
            },
            checkStepStatus: function () {
                var newStepStatus = this.validate(false) ? 'complete' : 'invalid';
                this.stepStatus(newStepStatus);
            }

        }, function constructShippingAddress() {
            this.superInit();
            this.checkStepStatus();
        }),

        Price = ViewModelPrototype.extend({
            observables: {
                ISOCurrencyCode: {},
                Cost: { numeric: 2 },
                Price: { numeric: 2 }
            }
        }),

        ShippingInfo = Step.extend({
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
                ShippingContact: ShippingAddress,
                Price: Price
            },
            nextStep: function () {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                this.messages([]);
                var self = this;
                var parent = this.getParentModel();
                // have to manually create the payload here because a full order contains a blank BillingInfo, and a blank BillingInfo throws too-early validation errors
                parent.update({ ShippingInfo: this.toJS() }).then(function () {
                    self.checkStepStatus();
                });
            },
            checkStepStatus: function () {
                var st = "new", available = this.availableShippingMethods();
                if (available && available.length) st = this.chosenMethod() ? "complete" : "invalid";
                this.stepStatus(st);
            }
        }, function (conf) {
            var self = this;
            
            this.superInit();

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

            this.checkStepStatus();
            this.availableShippingMethods.subscribe($.proxy(this.checkStepStatus, this));
        }),

        paymentTypeIsCreditCard = function () {
            return this.getParentModel().PaymentType() === "CreditCard";
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
            var parent = this.getParentModel();
            return parent.PaymentType() === "CreditCard" && !parent.IsSameBillingShippingAddress();
        },
        grandparentBillingAddressRequired = function () {
            return parentBillingAddressRequired.call(this.getParentModel());
        },


        BillingStreetAddress = AddressModels.StreetAddress.extend({
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
        }),

        BillingAddress = ViewModelPrototype.extend({
            statics: {
                "Id": ""
            },
            observables: {
                "Email": {
                    required: {
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i
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

        BillingInfo = Step.extend({
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
            submit: function () {
                var self = this,
                    parent = this.getParentModel();
                if (this.validate()) {
                    if (this.paymentTypeIsCreditCard()) {
                        return this.pciProcessor.process();
                    } else {
                        return parent.update().then(function () {
                            self.stepStatus("complete");
                        });
                    }
                } else {
                    return false;
                }
            }
        }, function () {
            var self = this,
                parent = this.getParentModel();
            this.superInit();
            var shipmentStatus = parent.ShippingInfo.stepStatus,
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
                    CardType: this.Card.PaymentOrCardType,
                    CardNumber: this.Card.CardNumberPartOrMask,
                    CVV: this.Card.CVV,
                    PersistCard: this.Card.IsCardInfoSaved,
                    HiddenCardID: this.Card.PaymentServiceCardId
                },
                events: {
                    success: function () {
                        self.pciProcessor.applyMask();
                        parent.update().then(function () {
                            self.stepStatus("complete");
                        }), function () {
                            self.stepStatus("invalid");
                        };
                    },
                    error: function (messages) {
                        for (var i = 0; i < messages.length; i++) {
                            messages[i].Message = messages[i].message;
                        }
                        self.messages(messages);
                        self.stepStatus("invalid");
                    }
                },
                settings: {
                    framePath: "/../../Assets/pci_receiver.html",
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

        ShopperNotes = ViewModelPrototype.extend({
            observables: {
                "GiftMessage": {},
                "Comments": {}
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
                ShippingInfo: ShippingInfo,
                BillingInfo: BillingInfo,
                ShopperNotes: ShopperNotes,
                User: UserModels.User
            },
            observableArrays: {
                OrderDiscounts: {}
            },
            observables: {
                couponCode: {},
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
                this.applyCoupon(this.couponCode()).then(function() {
                    return self.get();
                }).then(function () {
                    self.submittingCoupon(false);
                    self.couponCode('');
                });
            },
            submit: function() {
                var order = this,
                    apiSteps = [],
                    createAccount = this.createAccount();
                if (!this.validate()) return false;
                this.submitting(true);
                this.messages([]);

                // build an array of sequential promises for all checkout tasks

                if (createAccount) {
                    apiSteps.push(function () {
                        return order.User.create();
                    }, function () {
                        return order.User.login({
                            EmailAddress: order.email(),
                            Password: order.password()
                        });
                    }, function (login) {
                        return order.setUserId();
                    });
                }
                if (order.ShopperNotes.Comments()) {
                    // the above conditional should be extended for any other changes that were made
                    apiSteps.push(function () {
                        return order.update();
                    });
                }
                apiSteps.push(function () {
                    var availableActions = order.AvailableActions;
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
                    if (createAccount) {
                        $.post('/auth/AjaxSignIn', {
                            email: order.email(),
                            password: order.password()
                        }).then(function () {
                            return order.publish('complete');
                        });
                    } else {
                        order.publish('complete');
                    }
                };

                api.steps(apiSteps).then(function (completedOrder) {
                    order.submitting(false);
                    if (completedOrder.data.Status === "Submitted") {
                        successHandler(completedOrder.data);
                    } else {
                        failHandler(completedOrder);
                    }
                }, failHandler);
            },
            editCart: function () {
                window.location = "/cart";
            },
            errorTimeout: 30000
        }, function (conf) {

            var self = this;

            this.submitting.subscribe(function (yes) {
                if (!yes) {
                    // clean up models that weren't unsubmitted by the populate
                    $.each(self.submodels, function (smName) {
                        if (self[smName].stepStatus && self[smName].stepStatus() == "submitting") self[smName].stepStatus("invalid");
                    });
                }
            });

            this.unknownError = function () {
                this.messages.push({ Message: genericMsg.UnexpectedError });
                this.submitting(false);
            };

            this.BillingInfo.pciProcessor.settings.set({
                apiBase: this.paymentApiBase
            });

            $.each(this.submodels, function (smName) {
                var submodel = self[smName];
                submodel.orderId = self.Id;
                if (submodel.apiPromise) submodel.apiPromise.then(function (apiModel) {
                    apiModel.prop('orderId',self.Id);
                });
                // consolidate messaging
                self[smName].messages = self.messages;
            });

            this.User.EmailAddress = this.email;
            this.User.Password = this.password;

            this.ShippingInfo.availableShippingMethods(this.availableShippingMethods);
            this.ShippingInfo.checkStepStatus();

            var ALLCOMPLETE = "completecompletecomplete",
                SUBMITTING = "submitting",
                errorTimer,
                backstop = $.proxy(this.unknownError,this);

            this.orderStatus = ko.computed(function () {
                var statuses = [self.ShippingInfo.ShippingContact.stepStatus(), self.ShippingInfo.stepStatus(), self.BillingInfo.stepStatus()].join("");

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
