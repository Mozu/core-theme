require(["modules/jquery-mozu", "shim!vendor/underscore>_", "hyprlive", "modules/backbone-mozu", "modules/models-checkout", "modules/views-messages", "modules/cart-monitor"], function ($, _, Hypr, Backbone, CheckoutModels, messageViewFactory, CartMonitor) {

    var CheckoutStepView = Backbone.MozuView.extend({
        edit: function () {
            this.model.edit();
        },
        next: function () {
            // wait for blur validation to complete
            var me = this;
            _.defer(function () {
                me.model.next();
            });
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            Backbone.MozuView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.resize();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });

    var OrderSummaryView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/checkout-order-summary',
        editCart: function () {
            window.location = "/cart";
        },
        // override loading button changing at inappropriate times
        handleLoadingChange: function () { }
    });

    var ShippingAddressView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-address',
        autoUpdate: [
            'firstName',
            'lastNameOrSurname',
            'address.address1',
            'address.address2',
            'address.address3',
            'address.cityOrTown',
            'address.countryCode',
            'address.stateOrProvince',
            'address.postalOrZipCode',
            'address.addressType',
            'phoneNumbers.home',
            'contactId',
            'email'
        ],
        renderOnChange: [
            'address.countryCode',
            'contactId'
        ]
    });

    var ShippingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-method',
        renderOnChange: [
            'availableShippingMethods'
        ],
        additionalEvents: {
            "change [data-mz-shipping-method]": "updateShippingMethod"
        },
        updateShippingMethod: function (e) {
            this.model.updateShippingMethod(this.$('[data-mz-shipping-method]:checked').val());
        }
    });

    var BillingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-payment-info',
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
            'selectedCredit',
            'digitalCreditCode'
        ],
        renderOnChange: [
            'selectedCredit',
            'savedPaymentMethodId',
            'billingContact.address.countryCode',
            'paymentType',
            'isSameBillingShippingAddress'
        ],
        initialize: function () {
            this.listenTo(this.model, 'change:digitalCreditCode', this.onEnterDigitalCreditCode, this);
            this.codeEntered = !!this.model.get('digitalCreditCode');
            //this.listenTo(this.model, 'change:creditAmountToApply', this.onChangeDigitalCredit, this);
        },
        updateAcceptsMarketing: function(e) {
            this.model.getOrder().set('acceptsMarketing', $(e.currentTarget).prop('checked'));
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

        //onChangeDigitalCredit: function(model, amt) {
        //    //var amtToApply = parseFloat(amt.replace(/[^\d\.]/g, ''));
        //    //if (isNaN(amtToApply)) {
        //    //    amtToApply = 0;
        //    //}

        //    model.applyDigitalCredit(this._selectedCode, this.stripNonNumericAndParseFloat(amt));
        //    //amtToApply);
        //    this.render(); //this?

        //},

        stripNonNumericAndParseFloat: function(val) {
            var result = parseFloat(val.replace(/[^\d\.]/g, ''));
            return isNaN(result) ? 0 : result;
        },

        applyDigitalCredit: function(e) {
            var val = $(e.currentTarget).prop('value'),
                creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');
            var amtToApply = parseFloat(val.replace(/[^\d\.]/g, ''));
            if (isNaN(amtToApply)) {
                amtToApply = 0;
            }

            this.model.applyDigitalCredit(creditCode, amtToApply);
            this.render();
        },

        onEnterDigitalCreditCode: function(model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('button').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
        },

        enableDigitalCredit: function(e) {
            var creditCode = $(e.currentTarget).attr('data-mz-credit-code-source'), // or e.currentTarget.attributes.getNamedItem('data-mz-credit-code').value
                isEnabled = $(e.currentTarget).prop('checked') === true,
                balance = $(e.currentTarget).attr('data-mz-credit-balance'),
                targetCreditAmtEl = this.$el.find("input[data-mz-credit-code-target='" + creditCode + "']"),
                me = this;

            if (isEnabled) {
                targetCreditAmtEl.prop('disabled', false);
                var creditBalance = this.stripNonNumericAndParseFloat(balance);
                var remainingTotal = this.model.nonStoreCreditTotal();
                var maxAmt = remainingTotal < creditBalance ? remainingTotal : creditBalance;
                maxAmt = Math.round(maxAmt * 100) / 100.0; //round to 2 decimal places
                targetCreditAmtEl.prop('value', maxAmt);
                //experiment
                this.model.applyDigitalCredit(creditCode, maxAmt);


            } else {
                targetCreditAmtEl.prop('disabled', true);
                targetCreditAmtEl.prop('value', '0.00');
                this.model.applyDigitalCredit(creditCode, 0);
                this.render();
            }
        },

        updateCreditAmountApplied: _.debounce(function(e) {
            var val = $(e.currentTarget).prop('value'),
                creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');
            var amtToApply = this.stripNonNumericAndParseFloat(val);
            this.model.applyDigitalCredit(creditCode, amtToApply);
            this.render();
        }, 500),

        handleEnterKey: function (e) {
            var source = $(e.currentTarget).prop('id');
            if (source === 'digital-credit-code')
                this.getDigitalCredit();
        }
    });

    var CouponView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/coupon-code-field',
        handleLoadingChange: function (isLoading) {
            // override adding the isLoading class so the apply button 
            // doesn't go loading whenever other parts of the order change
        },
        initialize: function() {
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('button').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        addCoupon: function (e) {
            // add the default behavior for loadingchanges
            // but scoped to this button alone
            var self = this;
            this.$el.addClass('is-loading');
            this.model.addCoupon().ensure(function() {
                self.$el.removeClass('is-loading');
            });
        },
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    var CommentsView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/comments-field',
        autoUpdate: ['shopperNotes.comments']
    });

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/step-review',
        autoUpdate: [
            'createAccount',
            'agreeToTerms',
            'emailAddress',
            'password',
            'confirmPassword'
        ],
        renderOnChange: [
            'createAccount',
            'isReady'
        ],
        initialize: function () {
            var me = this;
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey();
                    return false;
                }
            });
            this.model.on('passwordinvalid', function(message) {
                me.$('[data-mz-validationmessage-for="password"]').text(message);
            });
            this.model.on('userexists', function (user) {
                me.$('[data-mz-validationmessage-for="emailAddress"]').html(Hypr.getLabel("customerAlreadyExists", user, encodeURIComponent(window.location.pathname)));
            });
        },
        submit: function () {
            var self = this;
            _.defer(function () {
                self.model.submit();
            });
        },
        handleEnterKey: function () {
            this.submit();
        }
    });

    $(document).ready(function () {

        var $checkoutView = $('#checkout-form'),
            checkoutData = require.mozuData('checkout');

        var checkoutModel = window.order = new CheckoutModels.CheckoutPage(checkoutData),
            checkoutViews = {
                steps: {
                    shippingAddress: new ShippingAddressView({
                        el: $('#step-shipping-address'),
                        model: checkoutModel.get("fulfillmentInfo").get("fulfillmentContact")
                    }),
                    shippingInfo: new ShippingInfoView({
                        el: $('#step-shipping-method'),
                        model: checkoutModel.get('fulfillmentInfo')
                    }),
                    paymentInfo: new BillingInfoView({
                        el: $('#step-payment-info'),
                        model: checkoutModel.get('billingInfo')
                    })
                },
                orderSummary: new OrderSummaryView({
                    el: $('#order-summary'),
                    model: checkoutModel
                }),
                couponCode: new CouponView({
                    el: $('#coupon-code-field'),
                    model: checkoutModel
                }),
                comments: Hypr.getThemeSetting('showCheckoutCommentsField') && new CommentsView({
                    el: $('#comments-field'),
                    model: checkoutModel
                }),
                
                reviewPanel: new ReviewOrderView({
                    el: $('#step-review'),
                    model: checkoutModel
                }),
                messageView: messageViewFactory({
                    el: $checkoutView.find('[data-mz-message-bar]'),
                    model: checkoutModel.messages
                })
            };

        window.checkoutViews = checkoutViews;

        checkoutModel.on('complete', function() {
            CartMonitor.setCount(0);
            window.location = "/checkout/" + checkoutModel.get('id') + "/confirmation";
        });

        var $reviewPanel = $('#step-review');
        checkoutModel.on('change:isReady',function (model, isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');

        $checkoutView.noFlickerFadeIn();

    });
});
