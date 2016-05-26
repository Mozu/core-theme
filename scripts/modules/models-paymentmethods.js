define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive', 'hyprlivecontext'], function ($, _, Backbone, Hypr, HyprLiveContext) {
    // payment methods only validate if they are selected!
    var PaymentMethod = Backbone.MozuModel.extend({
        present: function (value, attr) {
            if (!this.selected) return undefined;
            if (this.get('isSavedCard')) return false;
            if (!value) return this.validation[attr.split('.').pop()].msg || Hypr.getLabel('genericRequired');
        }
    });

    var twoWayCardShapeMapping = {
        "cardNumber": "cardNumberPartOrMask",
        "cardNumberPart": "cardNumberPartOrMask",
        "cardType": "paymentOrCardType",
        "id": "paymentServiceCardId"
    };

    var firstDigitMap = {
        "3": "AMEX",
        "4": "VISA",
        "5": "MC",
        "6": "DISCOVER"
    };

    var CreditCard = PaymentMethod.extend({
        mozuType: 'creditcard',
        defaults: {
            isCvvOptional: false,
            isDefaultPayMethod: false,
            isSavedCard: false,
            isVisaCheckout: false
        },
        validation: {
            paymentOrCardType: {
                fn: "present",
                msg: Hypr.getLabel('cardTypeMissing')
            },
            cardNumberPartOrMask: {
                fn: "present",
                msg: Hypr.getLabel('cardNumberMissing')
            },
            expireMonth: {
                fn: 'expirationDateInPast'
            },
            expireYear: {
                fn: 'expirationDateInPast'
            },
            nameOnCard: {
                fn: "present",
                msg: Hypr.getLabel('cardNameMissing')
            }
        },
        initialize: function () {
            var self = this;
            _.each(twoWayCardShapeMapping, function (k, v) {
                self.on('change:' + k, function (m, val) {
                    self.set(v, val, { silent: true });
                });
                self.on('change:' + v, function (m, val) {
                    self.set(v, val, { silent: true });
                });
            });

            if (this.detectCardType) {
                this.on('change:cardNumberPartOrMask', _.debounce(function(self, newValue) {
                    var firstDigit;
                    if (newValue && newValue.toString) {
                        firstDigit = newValue.toString().charAt(0);
                    }
                    if (firstDigit && firstDigit in firstDigitMap) {
                        self.set({ paymentOrCardType: firstDigitMap[firstDigit] });
                    }
                }, 500));
            }
        },
        dataTypes: {
            expireMonth: Backbone.MozuModel.DataTypes.Int,
            expireYear: Backbone.MozuModel.DataTypes.Int,
            isCardInfoSaved: Backbone.MozuModel.DataTypes.Boolean,
            isDefaultPayMethod: Backbone.MozuModel.DataTypes.Boolean
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
            if (!isValid) return Hypr.getLabel('cardExpInvalid');
        },
        // the toJSON method should omit the CVV so it is not sent to the wrong API
        toJSON: function (options) {
            var j = PaymentMethod.prototype.toJSON.apply(this);
            _.each(twoWayCardShapeMapping, function (k, v) {
                if (!(k in j) && (v in j)) j[k] = j[v];
                if (!(v in j) && (k in j)) j[v] = j[k];
            });
            if (j && (!options || !options.helpers) && j.cvv && j.cvv.toString().indexOf('*') !== -1) delete j.cvv;
            return j;
        }
    });

    var CreditCardWithCVV = CreditCard.extend({
        validation: _.extend({}, CreditCard.prototype.validation, {
            cvv: {
                fn: function(value, attr) {
                    var cardType = attr.split('.')[0],
                        card = this.get(cardType),
                        isSavedCard = card.get('isSavedCard'),
                        isVisaCheckout = card.get('isVisaCheckout');

                    var skipValidationSaved = Hypr.getThemeSetting('isCvvSuppressed') && isSavedCard;
                    var skipValidationVisaCheckout = Hypr.getThemeSetting('isCvvSuppressed') && isVisaCheckout;

                    // If card is not selected or cvv is not required, no need to validate
                    if (!card.selected || skipValidationVisaCheckout || skipValidationSaved) {
                        return;
                    }

                    if (!value) {
                        return Hypr.getLabel('securityCodeMissing') || Hypr.getLabel('genericRequired');
                    }

                }
            }
        })
    });

    
    var Check = PaymentMethod.extend({
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
    });

    var DigitalCredit = PaymentMethod.extend({

        isEnabled: false,
        creditAmountApplied: null,
        remainingBalance: null,
        isTiedToCustomer: true,
        addRemainderToCustomer: false,

        initialize: function() {
            this.set({ isEnabled: this.isEnabled });
            this.set({ creditAmountApplied: this.creditAmountApplied });
            this.set({ remainingBalance: this.remainingBalance });
            this.set({ isTiedToCustomer: this.isTiedToCustomer });
            this.set({ addRemainderToCustomer: this.addRemainderToCustomer });
        },

        helpers: ['calculateRemainingBalance'],

        calculateRemainingBalance: function () {
            return (! this.get('creditAmountApplied')) ? this.get('currentBalance') : this.get('currentBalance') - this.get('creditAmountApplied');
        },

        validate: function(attrs, options) {
            if ( (attrs.creditAmountApplied) && (attrs.creditAmountApplied > attrs.currentBalance)) {
                return "Exceeds card balance.";
            }
        }
    });

    var PurchaseOrderCustomField = Backbone.MozuModel.extend({
        //code: null,
        //label: null,
        //value: null,
        validation: {
            code: {
                // set from code, before validation call
                fn: 'present'
            },
            label: {
                // set from code, before validation call
                fn: 'present'
            },
            value: {
                // set from user, but should be set before validation call:

                fn: function(value, attrs) {
                    // validate value of purchase order custom field
                    // Try validation from below:
                    /*
                    function(value, attr) {
                        var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                        var result = null;
                        siteSettingsCustomFields.forEach(function(field) {
                            if(field.isEnabled && field.isRequired) {
                                var fieldInput = $('#purchase-order-custom-field-' + field.code);
                                if(fieldInput.val().length < 1) {
                                    var errorMessage = field.label + " " + Hypr.getLabel('missing');
                                    fieldInput.addClass('is-invalid');
                                    $('#purchase-order-custom-field-' + field.code + '-validation').text(errorMessage);
                                    result = Hypr.getLabel('purchaseOrderCustomFieldMissing');
                                } else {
                                    fieldInput.removeClass('is-invalid');
                                    $('#purchase-order-custom-field-' + field.code + '-validation').empty();
                                }
                            }
                        });
                        return result;
                    }
                    */
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    var result = null;
                    siteSettingsCustomFields.forEach(function(field) {
                        if(field.isEnabled && field.isRequired) {
                            var fieldInput = $('#purchase-order-custom-field-' + field.code);
                            if(fieldInput.val().length < 1) {
                                var errorMessage = field.label + " " + Hypr.getLabel('missing');
                                fieldInput.addClass('is-invalid');
                                $('#purchase-order-custom-field-' + field.code + '-validation').text(errorMessage);
                                result = Hypr.getLabel('purchaseOrderCustomFieldMissing');
                            } else {
                                fieldInput.removeClass('is-invalid');
                                $('#purchase-order-custom-field-' + field.code + '-validation').empty();
                            }
                        }
                    });
                    return result;
                }
            }
        },
        dataTypes: {
            code: Backbone.MozuModel.DataTypes.String,
            label: Backbone.MozuModel.DataTypes.String,
            value: Backbone.MozuModel.DataTypes.String
        }
    });

    var PurchaseOrderPaymentTerm = Backbone.MozuModel.extend({
        //code: null,
        //description: null,
        // validation should pass! This is set from code and not sent to server.
        validation: {
            code: {
                fn: 'present'
            },
            description: {
                fn: 'present'
            }
        },
        dataTypes: {
            code: Backbone.MozuModel.DataTypes.String,
            description: Backbone.MozuModel.DataTypes.String
        }
    });

    var PurchaseOrder = PaymentMethod.extend({
        mozuType: 'purchaseorder',
        defaults: {
            isEnabled: false,
            splitPayment: false,
            amount: 0,
            availableBalance: 0,
            creditLimit: 0
        },
        //Payment specific:
        //paymentTerm: null,
        //purchaseOrderNumber: null,
        // Stuff required for book keeping on storefront

        relations: {
            customFields: Backbone.Collection.extend({
                model: PurchaseOrderCustomField
            }),
            paymentTermOptions: Backbone.Collection.extend({
                model: PurchaseOrderPaymentTerm
            })
        },
        
        initialize: function() {
            
        },

        validation: {
            purchaseOrderNumber: {
                fn: function(value, attr){
                    if(!value) {
                        return Hypr.getLabel('purchaseOrderNumberMissing');
                    }
                    return;
                }
            },
            customFields: {
                fn: function(value, attr) {
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    var result = null;
                    siteSettingsCustomFields.forEach(function(field) {
                        if(field.isEnabled && field.isRequired) {
                            var fieldInput = $('#purchase-order-custom-field-' + field.code);
                            if(fieldInput.val().length < 1) {
                                var errorMessage = field.label + " " + Hypr.getLabel('missing');
                                fieldInput.addClass('is-invalid');
                                $('#purchase-order-custom-field-' + field.code + '-validation').text(errorMessage);
                                result = Hypr.getLabel('purchaseOrderCustomFieldMissing');
                            } else {
                                fieldInput.removeClass('is-invalid');
                                $('#purchase-order-custom-field-' + field.code + '-validation').empty();
                            }
                        }
                    });
                    return result;
                }
            },
            paymentTerm: {
                fn: function(value, attr) {
                    var paymentTermOptions = this.get('purchaseOrder').get('paymentTermOptions');
                    if(!value && paymentTermOptions.length === 1) {
                        // this should be set before validation occurs.
                        return;
                    }
                    if(!value) {
                        return Hypr.getLabel('purchaseOrderPaymentTermMissing');
                    }
                    return;
                }
            }
        },

        dataTypes: {
            paymentTerm: Backbone.MozuModel.DataTypes.String,
            purchaseOrderNumber: Backbone.MozuModel.DataTypes.String,
            
            isEnabled: Backbone.MozuModel.DataTypes.Boolean,
            splitPayment: Backbone.MozuModel.DataTypes.Boolean,
            amount: Backbone.MozuModel.DataTypes.Float,
            availableBalance: Backbone.MozuModel.DataTypes.Float,
            creditLimit: Backbone.MozuModel.DataTypes.Float
        }

    });

    return {
        PurchaseOrder: PurchaseOrder,
        CreditCard: CreditCard,
        CreditCardWithCVV: CreditCardWithCVV,
        Check: Check,
        DigitalCredit: DigitalCredit
    };
});