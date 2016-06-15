define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive', 'hyprlivecontext', 'modules/models-address'], function ($, _, Backbone, Hypr, HyprLiveContext, Address) {
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
        /*validation: {
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
                fn: 'present'
            }
        }*/
    });

    var PurchaseOrderPaymentTerm = Backbone.MozuModel.extend({
        // validation should pass! This is set from code and not sent to server.
        /*validation: {
            code: {
                fn: 'present'
            },
            description: {
                fn: 'present'
            }
        }*/
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

        relations: {
            paymentTerm: PurchaseOrderPaymentTerm,
            customFields: Backbone.Collection.extend({
                model: PurchaseOrderCustomField
            }),
            paymentTermOptions: Backbone.Collection.extend({
                model: PurchaseOrderPaymentTerm
            })
        },
        
        initialize: function() {
            var self = this;
        },

        // take the custom fields array and add them to the model as individual .
        deflateCustomFields: function() {
            //"pOCustomField-"+field.code
            var customFields = this.get('customFields').models;
            var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
            /*if(customFields.length > 0) {
                customFields.forEach(function(field) {
                    var ssCustomField = siteSettingsCustomFields.find(function(searchField) {
                        return field.get('code') === searchField.code;
                    }, this);

                }, this);
            }*/
            siteSettingsCustomFields.forEach(function(field) {
                if(field.isEnabled) {
                    var data = customFields.find(function(val) {
                        return val.get('code') === field.code;
                    });

                    if(data && data.get('value').length > 0) {
                        this.set('pOCustomField-'+field.code, data.get('value'));
                    }

                    if(field.isRequired) {
                        this.validation['pOCustomField-'+field.code] =
                            {
                                fn: 'present',
                                msg: field.label+ " " + Hypr.getLabel('missing')
                            };
                    }
                }
            }, this);
        },

        inflateCustomFields: function() {
            var customFields = [];
            var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
            
            siteSettingsCustomFields.forEach(function(field) {
                if(field.isEnabled) {
                    var value = this.get("pOCustomField-"+field.code);
                    var customField = {"code":field.code, "label": field.label, "value":value};
                    // we only want this if it had data!
                    if(value && value.length > 0) {
                        customFields.push(customField);
                    }
                }
            }, this);

            if(customFields.length > 0) {
                this.set('customFields', customFields, {silent: true});
            }
        },

        validation: {
            purchaseOrderNumber: {
                fn: 'present',
                msg: Hypr.getLabel('purchaseOrderNumberMissing')
            },/*
            customFields: {
                fn: function(value, attr) {
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    var purchaseOrderCustomFields = this.get('purchaseOrder').get('customFields').models;
                    var result = null;
                    siteSettingsCustomFields.forEach(function(field) {
                        if(field.isEnabled && field.isRequired) {
                            var fieldInput = $('#mz-payment-pOCustomField-' + field.code);

                            var foundField = purchaseOrderCustomFields.find(function(poField){
                                return poField.code === field.code;
                            });

                            if(foundField && foundField.get('code') && foundField.get('value').length > 0) {
                                fieldInput.removeClass('is-invalid');
                                $('#mz-payment-pOCustomField-' + field.code + '-validation').empty();
                            } else {
                                var errorMessage = field.label + " " + Hypr.getLabel('missing');
                                fieldInput.addClass('is-invalid');
                                $('#mz-payment-pOCustomField-' + field.code + '-validation').text(errorMessage);
                                result = Hypr.getLabel('purchaseOrderCustomFieldMissing');
                            }
                        }
                    });
                    return result;
                }
            },*/
            paymentTerm: {
                fn: function(value, attr) {

                    var selectedPaymentTerm = null;
                    var purchaseOrder = null;
                    if(attr.indexOf('billingInfo') > -1) {
                        purchaseOrder = this.get('billingInfo').get('purchaseOrder');
                        selectedPaymentTerm = this.get('billingInfo').get('purchaseOrder').get('paymentTerm');
                    } else {
                        purchaseOrder = this.get('purchaseOrder');
                        selectedPaymentTerm = this.get('purchaseOrder').get('paymentTerm');
                    }

                    if(!purchaseOrder.selected) {
                        return;
                    }
                    
                    if(!selectedPaymentTerm.get('description')) {
                        return Hypr.getLabel('purchaseOrderPaymentTermMissing');
                    }

                    return;
                }
            }
        },
        // the toJSON method should omit the CVV so it is not sent to the wrong API
        toJSON: function (options) {
            var j = PaymentMethod.prototype.toJSON.apply(this);
            
            return j;
        },

        dataTypes: {
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