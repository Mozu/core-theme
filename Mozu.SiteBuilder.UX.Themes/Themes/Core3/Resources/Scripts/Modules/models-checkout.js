define(
    ["jquery", "modules/knockout-plus", "pciaas", "modules/knockout-viewmodel", "i18n!nls/messages-checkout", "i18n!nls/messages", "modules/api"],
    function ($, ko, PCIaaS, ViewModelPrototype, msg, genericMsg, api) {


        function modelObservableValueIs(obsName, desiredValue) {
            return function () {
                return this[obsName]() == desiredValue;
            }
        }

        function submitStep() {
            if (this.submit()) this.stepStatus("submitting");
        }

        function editStep() {
            this.stepStatus("incomplete");
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

            AddressSchemesPromise.then(function (r) {
                AddressSchemes = r.statesByCountry;
                self.countryList(r.countries);
                self.CountryCode.notifySubscribers();
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
                "Email": {},
                "stepStatus": {}
            },
            submodels: {
                "Address": ShippingStreetAddress,
                "PhoneNumbers": PhoneNumbers
            },
            edit: editStep,
            nextStep: function() {
                if (!this.validate()) return false;
                this.stepStatus('submitting');
                var self = this;
                this.getParentModel().update().then(function () {
                    if (self.checkStepStatus() === 'complete')
                        self.getParentModel().getShippingMethods();
                }, function(e) {
                    self.getParentModel().getParentModel().messages.push(e.message);
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
            this.checkStepStatus();
        }),
       
        ShippingMethod = ViewModelPrototype.extend({
            mozuType: 'shippingmethod',
            //endpoint: "/resources/scripts/fixtures/checkout-updateshippingmethod.json",
            endpoint: "/checkout/updateshippingmethod",
            statics: {
                "orderId": ""
            },
            observables: {
                "id": { required: msg.ShippingMethodMissing },
                "stepStatus": {},
                "name": {},
                "price": {
                    numeric: 2
                },
                "stepStatus": {}
            },
            observableArrays: {
                "availableShippingMethods": {}
            },
            edit: editStep,
            nextStep: submitStep,
            doNotSubmit: ["stepStatus", "availableShippingMethods", "price"]
        }, function (conf) {
            var self = this;
            
            // calculating this observable has side effects, namely, autoselecting the first shipping method in a list if no available method is selected
            this.chosenMethod = ko.computed(function(){
                var id = self.id(),
                    available = self.availableShippingMethods(),
                    chosen;
                if (!available || !available.length) {
                    self.id('');
                    return null;
                }
                chosen = ko.utils.arrayFirst(available, function(m) { 
                    return m.id == id;
                });
                if (!chosen) {
                    chosen = available[0];
                    self.id(chosen.id);
                }
                self.price(chosen.price);
                self.name(chosen.name);
                return chosen;
            });
        }), 

        Shipment = ViewModelPrototype.extend({
            mozuType: 'shipment',
            statics: {
                "OrderId": ""
            },
            submodels: {
                "ShippingAddress": ShippingAddress,
                "ShippingMethod": ShippingMethod
            }
        }),

        paymentTypeIsCreditCard = modelObservableValueIs("paymentType", "CreditCard"),
        paymentTypeIsCheck = modelObservableValueIs("paymentType", "Check"),
        useShippingAddressIsUnchecked = modelObservableValueIs("isSameBillingShippingAddress", false),
        billingAddressRequired = function () {
            return paymentTypeIsCreditCard.apply(this) && useShippingAddressIsUnchecked.apply(this);
        },
        expirationDateLaterThanToday = function () {
            var expMonth = parseInt(this.cardExpireMonth()),
                expYear = parseInt(this.cardExpireYear()),
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
            this.cardExpireMonth.invalid(!isValid);
            return isValid;
        },

        PaymentSection = ViewModelPrototype.extend({
            //endpoint: "/resources/scripts/fixtures/checkout-updatepaymentsection.json",
            endpoint: "/checkout/updatepayment",
            statics: {
                "orderId": ""
            },
            observables: {
                // *** Pay by card
                "paymentType": { required: msg.PaymentMethodMissing },
                // "paymentOrCardType": { required: msg.PaymentMethodMissing },
                // "cardNumber": { required: msg.CardNumberMissing },
                "cardType": {
                    required: {
                        message: msg.CardTypeMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "nameOnCard": {
                    required: {
                        message: msg.CardNameMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "cvv": {
                    required: {
                        message: msg.SecurityCodeMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "cardNumberPartOrMask": {
                    required: {
                        message: msg.CardNumberMissing,
                        onlyIf: paymentTypeIsCreditCard
                    }
                },
                "cardExpireMonth": {
                    required: {
                        message: msg.CardExpInvalid,
                        onlyIf: paymentTypeIsCreditCard,
                        invalidateOnChange: false,
                        fn: expirationDateLaterThanToday
                    }
                },
                "cardExpireYear": {
                    required: {
                        message: msg.CardExpInvalid,
                        onlyIf: paymentTypeIsCreditCard,
                        invalidateOnChange: false,
                        fn: expirationDateLaterThanToday
                    }
                },
                "paymentServiceCardId": {},
                "isCardInfoSaved": {
                    defaultValue: true
                },
                "isSameBillingShippingAddress": {},
                "firstName": {
                    required: {
                        onlyIf: billingAddressRequired
                    }
                },
                "lastName": {
                    required: {
                        onlyIf: billingAddressRequired
                    }
                },
                "middleName": {},
                "address1": {
                    required: {
                        onlyIf: billingAddressRequired
                    }
                },
                "address2": {},
                "address3": {},
                "cityOrTown": {
                    required: {
                        onlyIf: billingAddressRequired
                    }
                },
                "countryCode": {
                    required: {
                        onlyIf: billingAddressRequired
                    }
                },
                "stateOrProvince": {
                    required: {
                        onlyIf: billingAddressRequired,
                        message: msg.StateProvMissing,
                        invalidateOnChange: false
                    }
                },
                "postalOrZipCode": { 
                    required: {
                        onlyIf: billingAddressRequired,
                        message: msg.ZipOrPostalCodeMissing
                    }
                },

                // *** Pay by check
                "nameOnCheck": {
                    required: {
                        onlyIf: paymentTypeIsCheck
                    }
                },
                "checkNumber": {
                    required: {
                        onlyIf: paymentTypeIsCheck
                    }
                },

                // *** General billing info
                "phoneNumbers": {},
                "email": {
                    required: {
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                        message: msg.EmailMissing
                    }
                },
                // "wantSpecialOffers": {}

                stepStatus: {}
            },
            doNotSubmit: ["stepStatus"],
            edit: function () {
                this.stepStatus("incomplete");
            },
            submit: function () {
                if (this.validate()) {
                    if (paymentTypeIsCreditCard.apply(this)) {
                        return this.pciProcessor.process();
                    } else {
                        return PaymentSection.prototype.submit.apply(this);
                    }
                } else {
                    return false;
                }
            },
            nextStep: submitStep
        }, function () {
            var self = this;

            // on initial load, this is only complete if we are loading a saved order in progress. in case of credit card, we need to allow for the PCI holes to be refilled.
            if (this.stepStatus() == "complete" && paymentTypeIsCreditCard.apply(this)) {
                this.stepStatus("incomplete");
                this.cardExpireMonth.validate();
                this.cardExpireYear.validate();
                this.cvv.validate();
                this.cardExpireYear.validationMessage(msg.ReEnterExpDate);
                this.cvv.validationMessage(msg.ReEnterCVV);
            }

            this.pciProcessor = PCIaaS({
                fields: {
                    CardType: this.cardType,
                    CardNumber: this.cardNumberPartOrMask,
                    CVV: this.cvv,
                    PersistCard: this.isCardInfoSaved,
                    HiddenCardID: this.paymentServiceCardId
                },
                events: {
                    success: function () {
                        self.pciProcessor.applyMask();
                        PaymentSection.prototype.submit.apply(self);
                    }
                },
                settings: {
                    framePath: "/../Assets/pci_receiver.html",
                    siteId: api.context.Site(),
                    tenantId: api.context.Tenant()
                }
            });

            // expose some of the helper functions to templates
            this.billingAddressRequired = ko.computed($.proxy(billingAddressRequired, self));
            this.paymentTypeIsCreditCard = ko.computed($.proxy(paymentTypeIsCreditCard, self));
            this.paymentTypeIsCheck = ko.computed($.proxy(paymentTypeIsCheck, self));
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

        isCreatingAccount = modelObservableValueIs("createAccount", true),
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
                paymentSection: PaymentSection,
                orderSummary: OrderSummary
            },
            observables: {
                createAccount: {},
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
            doNotSubmit: ["messages", "shippingAddress", "shippingMethod", "paymentSection", "orderSummary", "confirmPassword"],
            editCart: function() {
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

            this.paymentSection.pciProcessor.events.error = function (messages) {
                self.messages(messages);
                self.paymentSection.stepStatus("invalid");
            };

            this.paymentSection.pciProcessor.settings.set({
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
                var statuses = [self.Shipment.ShippingAddress.stepStatus(), self.Shipment.ShippingMethod.stepStatus(), self.paymentSection.stepStatus()].join("");

                clearTimeout(errorTimer);
                if (statuses.indexOf(SUBMITTING) !== -1) {
                    errorTimer = setTimeout(backstop, self.errorTimeout);
                }

                return statuses == ALLCOMPLETE;
            });

            AddressSchemesPromise.otherwise(backstop);

        });

        return {
            ShippingAddress: ShippingAddress,
            ShippingMethod: ShippingMethod,
            PaymentSection: PaymentSection,
            OrderSummary: OrderSummary,
            CheckoutPage: CheckoutPage,
        }
    }
);
