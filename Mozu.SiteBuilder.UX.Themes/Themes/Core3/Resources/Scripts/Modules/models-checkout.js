define(
    ["jquery", "modules/knockout-plus", "pciaas", "modules/knockout-viewmodel", "i18n!nls/messages-checkout", "i18n!nls/messages", "modules/api"],
    function ($, ko, PCIaaS, ViewModelPrototype, msg, genericMsg, api) {


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

        function checkStepStatus() {
            if (!this.stepStatus) this.stepStatus = ko.observable();
            var newStepStatus = this.validate(false) ? 'complete' : 'invalid';
            this.stepStatus(newStepStatus);
            return newStepStatus;
        }

        var PhoneNumbers = ViewModelPrototype.extend({
            observables: {
                Home: {},
                Work: {},
                Mobile: {},
                Fax: {}
            }
        });

        // TODO: write a real KO binding for AddressSchemas, once the data is better
        var AddressSchemesPromise = api.get('addressschemas').then(function (r) {
            var items = r.data.Items,
                statesByCountry = {};
            $.each(items, function (ix, item) {
                var states;
                $.each(item.Fields, function (ix, field) {
                    if (field.Label === "State") {
                        states = field.Data;
                        return false;
                    }
                });
                statesByCountry[item.CountryCode] = {
                    stateprovLabel: 'State',
                    stateprovList: states
                };
            });
            return {
                statesByCountry: statesByCountry,
                countries: items
            };
        });

        var addressConf = {            observables: {
                "Address1": { required: msg.StreetMissing },
                "Address2": {},
                "Address3": {},
                "Address4": {},
                "CityOrTown": { required: msg.CityMissing },
                "StateOrProvince": { 
                    required: {
                        message: msg.StateProvMissing,
                        invalidateOnChange: false
                    }
                },
                "PostalOrZipCode": { required: msg.PostalCodeMissing },
                "CountryCode": {
                    required: {
                        message: msg.CountryMissing,
                        invalidateOnChange: false
                    }
                }
            }
        };

        var constructAddress = function (conf) {
            var self = this,
                AddressSchemes = false;

            this.stateprovLabel = ko.computed(function () {
                var countryCode = self.CountryCode();
                if (AddressSchemes&&AddressSchemes[countryCode]) {
                    return AddressSchemes[countryCode].stateprovLabel;
                }
                return "";
            });
            this.stateprovList = ko.computed(function () {
                var countryCode = self.CountryCode();
                if (AddressSchemes&&AddressSchemes[countryCode]) {
                    return AddressSchemes[countryCode].stateprovList;
                }
                return [];
            });

            self.countryList = ko.observableArray();
            // to prepopupate
            var countryCode = self.CountryCode();

            AddressSchemesPromise.then(function (r) {
                AddressSchemes = r.statesByCountry;
                self.countryList(r.countries);
                self.CountryCode.notifySubscribers();
                self.CountryCode(countryCode);
                self.StateOrProvince.notifySubscribers();
            });
        };

        var ShippingStreetAddress = ViewModelPrototype.extend(addressConf, constructAddress);

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
                "Address": ShippingStreetAddress,
                "PhoneNumbers": PhoneNumbers
            },
            edit: editStep,
            nextStep: function () {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                var self = this;
                var parent = this.getParentModel();
                parent.update({ ShippingAddress: self.toJS() }).then(function () {
                    if (self.checkStepStatus() === 'complete')
                        parent.getShippingMethods().then(function (methodsJSON) {
                            parent.availableShippingMethods(methodsJSON);
                        });
                }, function (e) {
                    parent.getParentModel().messages.push(e.message);
                    self.stepStatus('invalid')
                });
            },
            checkStepStatus: checkStepStatus
        }, function constructShippingAddress() {
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
                        parent.Payment.stepStatus("incomplete");
                    }
                });
            },
            checkStepStatus: function () {
                var origStatus = checkStepStatus.apply(this);
                if (this.ShippingAddress.stepStatus() !== "complete") {
                    origStatus = "new";
                    this.stepStatus(origStatus);
                }
                return origStatus
            }
        }, function (conf) {
            var self = this;
            this.checkStepStatus();

            // calculating this observable has side effects, namely, autoselecting the first shipping method in a list if no available method is selected
            this.chosenMethod = ko.computed(function () {
                var code = self.ShippingMethodCode(),
                    available = self.availableShippingMethods(),
                    chosen;
                if (!available || !available.length) {
                    self.ShippingMethodCode('');
                    return null;
                }
                chosen = ko.utils.arrayFirst(available, function (m) {
                    return m.ShippingMethodCode == code;
                });
                if (!chosen) {
                    chosen = available[0];
                    self.ShippingMethodCode(chosen.ShippingMethodCode);
                }
                self.Price.Price(chosen.Price);
                self.ShippingMethodName(chosen.ShippingMethodName);
                return chosen;
            });
        }),

        paymentTypeIsCreditCard = function () {
            return this.getParentModel().PaymentType() === "Credit Card";
        },
        paymentTypeIsCheck = function() {
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

        parentUseShippingAddressUnchecked = function () {
            return !this.getParentModel().IsSameBillingShippingAddress();
        },
        grandparentUseShippingAddressUnchecked = function () {
            return parentUseShippingAddressUnchecked.call(this.getParentModel());
        },
        

        BillingStreetAddress = ViewModelPrototype.extend($.extend(true, {}, addressConf, {
            observables: {
                "Address1": {
                    required: {
                        message: msg.StreetMissing,
                        onlyIf: grandparentUseShippingAddressUnchecked
                    }
                },
                "CityOrTown": {
                    required: {
                        message: msg.CityMissing,
                        onlyIf: grandparentUseShippingAddressUnchecked
                    }
                },
                "StateOrProvince": {
                    required: {
                        message: msg.StateProvMissing,
                        invalidateOnChange: false,
                        onlyIf: grandparentUseShippingAddressUnchecked
                    }
                },
                "PostalOrZipCode": {
                    required: {
                        message: msg.PostalCodeMissing,
                        onlyIf: grandparentUseShippingAddressUnchecked
                    }
                },
                "CountryCode": {
                    required: {
                        message: msg.CountryMissing,
                        invalidateOnChange: false,
                        onlyIf: grandparentUseShippingAddressUnchecked
                    }
                }
            }
        }), constructAddress),

        BillingAddress = ViewModelPrototype.extend({
            statics: {
                "Id": ""
            },
            observables: {
                "Email": {
                    required: {
                        onlyIf: parentUseShippingAddressUnchecked,
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                    }
                },
                "FirstName": {
                    required: {
                        onlyIf: parentUseShippingAddressUnchecked
                    },
                },
                "MiddleNameOrInitial": {},
                "LastNameOrSurname": {
                    required: {
                        onlyIf: parentUseShippingAddressUnchecked
                    },
                },
                "CompanyOrOrganization": {}
            },
            submodels: {
                "Address": BillingStreetAddress,
                "PhoneNumbers": PhoneNumbers
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
                "ExpireMonth": {                    required: {
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
                        message: msg.CardCVVMissing
                    }
                },
                "IsCardInfoSaved": {}
            },
            submodels: {
                "BillingAddress": BillingAddress
            },
            doNotSubmit: ["CVV"]
        }),

        Payment = ViewModelPrototype.extend({
            //endpoint: "/resources/scripts/fixtures/checkout-updatepaymentsection.json",
            //endpoint: "/checkout/updatepayment",
            observables: {
                "PaymentType": { required: msg.PaymentMethodMissing },
            },
            submodels: {
                "Card": CreditCard
            },
            edit: editStep,
            submit: function () {
                if (this.validate()) {
                    if (paymentTypeIsCreditCard.apply(this)) {
                        return this.pciProcessor.process();
                    } else {
                        return 
                    }
                } else {
                    return false;
                }
            },
            nextStep: submitStep,
            checkStepStatus: function() {
                var origStatus = checkStepStatus.apply(this);
                if (this.getParentModel().Shipment.stepStatus() !== "complete") {
                    origStatus = "new";
                    this.stepStatus(origStatus);
                }
                return origStatus
            }
        }, function () {
            var self = this;

            // on initial load, this is only complete if we are loading a saved order in progress. in case of credit card, we need to allow for the PCI holes to be refilled.
            this.checkStepStatus();

            if (this.stepStatus() == "complete" && paymentTypeIsCreditCard.apply(this)) {
                this.stepStatus("incomplete");
                this.ExpireMonth.validate();
                this.ExpireYear.validate();
                this.cvv.validate();
                this.ExpireYear.validationMessage(msg.ReEnterExpDate);
                //this.cvv.validationMessage(msg.ReEnterCVV);
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
                        Payment.prototype.submit.apply(self);
                    }
                },
                settings: {
                    framePath: "/../Assets/pci_receiver.html",
                    siteId: api.context.Site(),
                    tenantId: api.context.Tenant()
                }
            });

            // expose some of the helper functions to templates
            this.billingAddressRequired = ko.computed(function () {
                return self.PaymentType() === "CreditCard" && !self.Card.IsSameBillingShippingAddress();
            });
            this.paymentTypeIsCreditCard = ko.computed(function () {
                return self.PaymentType() === "CreditCard";
            });
            this.paymentTypeIsCheck = ko.computed(function () {
                return self.PaymentType() === "Check";
            });
        }),

        OrderSummary = ViewModelPrototype.extend({
            endpoint: "/checkout/updateorder",
            statics: {
                orderId: ""
            },
            observables: {
                couponCode: {},
                stepStatus: {},
                subTotal: { numeric: 2 },
                shippingTotal: { numeric: 2 },
                taxTotal: { numeric: 2 },
                total: { numeric: 2 },
                items: {}
            },
            doNotSubmit: ["stepStatus", "subTotal", "shippingTotal", "taxTotal", "total", "items"],
            nextStep: submitStep
        }),

        isCreatingAccount = function () {
            return this.CreateAccount();
        },
        isNotCreatingAccount = function () {
            return !isCreatingAccount.apply(this);
        },

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
                orderSummary: OrderSummary
            },
            observables: {
                CreateAccount: {},
                agreeToTerms: { required: msg.DidNotAgreeToTerms },
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
                },
                comments: {}
            },
            editCart: function () {
                window.location = "/cart";
            },
            update: function (newData) {
                if (newData.model)
                    this.populate(mapFromServer(newData));
                this.messages(newData.messages || (newData.message ? [{ message: newData.message }] : []));
                if (!newData.success && !newData.messages && !newData.message)
                    this.unknownError();
                if (newData.actions) {
                    processActions(newData.actions);
                }
                this.endSubmit();
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

            var boundUpdate = $.proxy(this.update, this),
                self = this;

            this.unknownError = function () {
                this.messages.push({ message: genericMsg.UnexpectedError });
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

            AddressSchemesPromise.otherwise(backstop);

        });

        return {
            CheckoutPage: CheckoutPage
        }
    }
);
