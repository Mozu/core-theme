define(["modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'hyprlivecontext',
    'modules/preserve-element-through-render',
    'modules/checkout/steps/views-base-checkout-step',
    'modules/xpress-paypal'],
    function ($, _, Hypr, Backbone, HyprLiveContext, preserveElements, CheckoutStepView,PayPal) {
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var pageContext = require.mozuData('pagecontext');
        var poCustomFields = function() {

            var fieldDefs = [];

            var isEnabled = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder &&
                HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled;

                if (isEnabled) {
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    siteSettingsCustomFields.forEach(function(field) {
                        if (field.isEnabled) {
                            fieldDefs.push('purchaseOrder.pOCustomField-' + field.code);
                        }
                    }, this);
                }

            return fieldDefs;
        };
        var BillingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-payment-info',
            autoUpdate: [
                'savedPaymentMethodId',
                'paymentType',
                'card.paymentOrCardType',
                'card.cardNumberPartOrMask',
                'card.nameOnCard',
                'card.expireMonth',
                'card.expireYear',
                'card.cvv',
                'card.isCardInfoSaved',
                'check.nameOnCheck',
                'check.routingNumber',
                'check.checkNumber',
                'isSameBillingShippingAddress',
                'billingContact.firstName',
                'billingContact.lastNameOrSurname',
                'billingContact.address.address1',
                'billingContact.address.address2',
                'billingContact.address.address3',
                'billingContact.address.cityOrTown',
                'billingContact.address.countryCode',
                'billingContact.address.stateOrProvince',
                'billingContact.address.postalOrZipCode',
                'billingContact.phoneNumbers.home',
                'billingContact.email',
                'creditAmountToApply',
                'digitalCreditCode',
                'purchaseOrder.purchaseOrderNumber',
                'purchaseOrder.paymentTerm'
            ].concat(poCustomFields()),
            renderOnChange: [
                'billingContact.address.countryCode',
                'paymentType',
                'isSameBillingShippingAddress',
                'usingSavedCard',
                'savedPaymentMethodId'
            ],
            additionalEvents: {
                "change [data-mz-digital-credit-enable]": "enableDigitalCredit",
                "change [data-mz-digital-credit-amount]": "applyDigitalCredit",
                "change [data-mz-digital-add-remainder-to-customer]": "addRemainderToCustomer",
                "change [name='paymentType']": "resetPaymentData",
                "change [data-mz-purchase-order-payment-term]": "updatePurchaseOrderPaymentTerm",
                "change [data-mz-single-fulfillment-contact]": "handleBillingAddressSelectorChange"
            },
            initialize: function () {
                // this.addPOCustomFieldAutoUpdate();
                this.listenTo(this.model, 'change:digitalCreditCode', this.onEnterDigitalCreditCode, this);
                this.listenTo(this.model, 'orderPayment', function (order, scope) {
                        this.render();
                }, this);
                this.listenTo(this.model, 'updateCheckoutPayment', function (order, scope) {
                        this.render();
                }, this);
                this.listenTo(this.model, 'change:savedPaymentMethodId', function (order, scope) {
                    $('[data-mz-saved-cvv]').val('').change();
                    this.render();
                }, this);
                this.codeEntered = !!this.model.get('digitalCreditCode');
            },
            resetPaymentData: function (e) {
                if (e.target !== $('[data-mz-saved-credit-card]')[0]) {
                    $("[name='savedPaymentMethods']").val('0');
                }
                var billingContactEmail = this.model.get('billingContact').get('email');
                this.model.clear();
                this.model.resetAddressDefaults();
                this.model.get('billingContact').set('email', billingContactEmail);
                if(HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled) {
                    this.model.resetPOInfo();
                }
            },
            updatePurchaseOrderPaymentTerm: function(e) {
                this.model.setPurchaseOrderPaymentTerm(e.target.value);
            },
            render: function() {
                preserveElements(this, ['.v-button', '.p-button'], function() {
                    CheckoutStepView.prototype.render.apply(this, arguments);
                });
                var status = this.model.stepStatus();
                if (visaCheckoutSettings.isEnabled && !this.visaCheckoutInitialized && this.$('.v-button').length > 0) {
                     window.onVisaCheckoutReady = _.bind(this.initVisaCheckout, this);
                     require([pageContext.visaCheckoutJavaScriptSdkUrl]);
                     this.visaCheckoutInitialized = true;
                }

                if (this.$(".p-button").length > 0)
                    PayPal.loadScript();
            },
            updateAcceptsMarketing: function(e) {
                this.model.getOrder().set('acceptsMarketing', $(e.currentTarget).prop('checked'));
            },
            updatePaymentType: function(e) {
                var newType = $(e.currentTarget).val();
                this.model.set('usingSavedCard', e.currentTarget.hasAttribute('data-mz-saved-credit-card'));
                this.model.set('paymentType', newType);
            },
            beginEditingCard: function() {
                var me = this;

                if (!this.model.isExternalCheckoutFlowComplete()) {
                    this.editing.savedCard = true;
                    this.render();
                } else {
                    this.cancelExternalCheckout();
                }
            },
            cancelExternalCheckout: function () {
                var me = this;
                this.doModelAction('cancelExternalCheckout').then(function () {
                    me.editing.savedCard = false;
                    me.render();
                });
            },
            beginEditingBillingAddress: function() {
                this.editing.savedBillingAddress = true;
                this.render();
            },
            beginApplyCredit: function () {
                this.model.beginApplyCredit();
                this.render();
            },
            cancelApplyCredit: function () {
                this.model.closeApplyCredit();
                this.render();
            },
            finishApplyCredit: function () {
                var self = this;
                this.model.finishApplyCredit().then(function() {
                    self.render();
                });
            },
            handleBillingAddressSelectorChange : function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var destinationId = $target.val();
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");

                if($target.val() === "" && !customerContactId) {
                    return false;
                }

                var destination = this.model.getOrder().get('destinations').get(destinationId);
                if(!destination) {
                    destination = this.model.getOrder().get('destinations').findWhere({customerContactId: customerContactId });
                }

                if(destination){
                    self.model.updateBillingContact(destination.get('destinationContact'));
                }
                self.render();
            },
            handleNewContact : function(){
                var self = this;
                this.listenTo(this.model.getOrder().get('dialogContact'), 'dialogClose', function () {
                       self.render();
                }, this);
                this.model.addNewContact();
            },
            removeCredit: function (e) {
                var self = this,
                    id = $(e.currentTarget).data('mzCreditId');
                this.model.removeCredit(id).then(function () {
                    self.render();
                });
            },
            getDigitalCredit: function (e) {
                var self = this;
                this.$el.addClass('is-loading');
                this.model.getDigitalCredit().ensure(function () {
                    self.$el.removeClass('is-loading');
                });
            },
            stripNonNumericAndParseFloat: function (val) {
                if (!val) return 0;
                var result = parseFloat(val.replace(/[^\d\.]/g, ''));
                return isNaN(result) ? 0 : result;
            },
            applyDigitalCredit: function(e) {
                var val = $(e.currentTarget).prop('value'),
                    creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');  //target
                if (!creditCode) {
                    //console.log('checkout.applyDigitalCredit could not find target.');
                    return;
                }
                var amtToApply = this.stripNonNumericAndParseFloat(val);

                this.model.applyDigitalCredit(creditCode, amtToApply, true);
                this.render();
            },
            onEnterDigitalCreditCode: function(model, code) {
                if (code && !this.codeEntered) {
                    this.codeEntered = true;
                    this.$el.find('input#digital-credit-code').siblings('button').prop('disabled', false);
                }
                if (!code && this.codeEntered) {
                    this.codeEntered = false;
                    this.$el.find('input#digital-credit-code').siblings('button').prop('disabled', true);
                }
            },
            enableDigitalCredit: function(e) {
                var creditCode = $(e.currentTarget).attr('data-mz-credit-code-source'),
                    isEnabled = $(e.currentTarget).prop('checked') === true,
                    targetCreditAmtEl = this.$el.find("input[data-mz-credit-code-target='" + creditCode + "']"),
                    me = this;

                if (isEnabled) {
                    targetCreditAmtEl.prop('disabled', false);
                    me.model.applyDigitalCredit(creditCode, null, true);
                } else {
                    targetCreditAmtEl.prop('disabled', true);
                    me.model.applyDigitalCredit(creditCode, 0, false);

                }

            },
            addRemainderToCustomer: function (e) {
                var creditCode = $(e.currentTarget).attr('data-mz-credit-code-to-tie-to-customer'),
                    isEnabled = $(e.currentTarget).prop('checked') === true;
                this.model.addRemainingCreditToCustomerAccount(creditCode, isEnabled);
            },
            handleEnterKey: function (e) {
                var source = $(e.currentTarget).attr('data-mz-value');
                if (!source) return;
                switch (source) {
                    case "creditAmountApplied":
                        return this.applyDigitalCredit(e);
                    case "digitalCreditCode":
                        return this.getDigitalCredit(e);
                }
            },
            /* begin visa checkout */
            initVisaCheckout: function () {
                var me = this;
                var apiKey = visaCheckoutSettings.apiKey || '0H1JJQFW9MUVTXPU5EFD13fucnCWg42uLzRQMIPHHNEuQLyYk';
                var clientId = visaCheckoutSettings.clientId || 'mozu_test1';
                var orderModel = this.model.getOrder();


                if (!window.V) {
                    //console.warn( 'visa checkout has not been initilized properly');
                    return false;
                }
                // on success, attach the encoded payment data to the window
                // then call the sdk's api method for digital wallets, via models-checkout's helper
                window.V.on("payment.success", function(payment) {
                    //console.log({ success: payment });
                    me.editing.savedCard = false;
                    me.model.parent.processDigitalWallet('VisaCheckout', payment);
                });



                window.V.init({
                    apikey: apiKey,
                    clientId: clientId,
                    paymentRequest: {
                        currencyCode: orderModel.get('currencyCode'),
                        subtotal: "" + orderModel.get('subtotal')
                    }
                });
            }
            /* end visa checkout */
        });

    return BillingInfoView;
});
