require(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/backbone-mozu", "modules/models-checkout", "modules/views-messages"], function ($, _, Backbone, CheckoutModels, messageViewFactory) {

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
                    me.handleEnterKey();
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
            'FirstName',
            'LastNameOrSurname',
            'Address.Address1',
            'Address.Address2',
            'Address.Address3',
            'Address.CityOrTown',
            'Address.CountryCode',
            'Address.StateOrProvince',
            'Address.PostalOrZipCode',
            'PhoneNumbers.Home'
        ],
        renderOnChange: [
            'Address.CountryCode'
        ]
    });

    var ShippingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-method',
        renderOnChange: [
            'AvailableShippingMethods'
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
            'PaymentType',
            'Card.PaymentOrCardType',
            'Card.CardNumberPartOrMask',
            'Card.NameOnCard',
            'Card.ExpireMonth',
            'Card.ExpireYear',
            'Card.CVV',
            'Card.IsCardInfoSaved',
            'Check.NameOnCheck',
            'Check.RoutingNumber',
            'Check.CheckNumber',
            'IsSameBillingShippingAddress',
            'BillingContact.FirstName',
            'BillingContact.LastNameOrSurname',
            'BillingContact.Address.Address1',
            'BillingContact.Address.Address2',
            'BillingContact.Address.Address3',
            'BillingContact.Address.CityOrTown',
            'BillingContact.Address.CountryCode',
            'BillingContact.Address.StateOrProvince',
            'BillingContact.Address.PostalOrZipCode',
            'BillingContact.PhoneNumbers.Home',
            'BillingContact.Email'
        ],
        renderOnChange: [
            'BillingContact.Address.CountryCode',
            'PaymentType',
            'IsSameBillingShippingAddress',
        ]
    });

    var CouponView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/coupon-code-field',
        handleLoadingChange: function (isLoading) {
            // override adding the isLoading class so the apply button 
            // doesn't go loading whenever other parts of the order change
        },
        autoUpdate: [
            'CouponCode'
        ],
        renderOnChange: [
            'CouponCode'
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
        autoUpdate: ['Comments']
    });

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/step-review',
        autoUpdate: [
            'CreateAccount',
            'AgreeToTerms',
            'User.EmailAddress',
            'User.Password',
            'User.ConfirmPassword'
        ],
        renderOnChange: [
            'CreateAccount',
            'IsReady'
        ],
        initialize: function() {
            this.model.on('passwordinvalid', function(e, message) {
                this.$('[data-mz-validation-message-for="Password"]').text(message);
            });
        },
        submit: function () {
            _.defer(_.bind(this.model.submit, this.model));
        }
    });

    $(document).ready(function () {

        var $checkoutView = $('#checkout-form'),
            checkoutData = require.mozuData('checkout');


        // some defaults to overcome backbone not initializing models right
        // when there isn't an object for them. TODO: make unnecessary
        //checkoutData = $.extend(true, {
        //    ShippingInfo: {
        //        ShippingContact: {
        //            Address: {},
        //            PhoneNumbers: {}
        //        }
        //    },
        //    BillingInfo: {
        //        BillingContact: {
        //            Address: {},
        //            PhoneNumbers: {}
        //        }
        //    }
        //}, checkoutData);

        var checkoutModel = new CheckoutModels.CheckoutPage(checkoutData),
            checkoutViews = {
                steps: {
                    shippingAddress: new ShippingAddressView({
                        el: $('#step-shipping-address'),
                        model: checkoutModel.get("ShippingInfo").get("ShippingContact")
                    }),
                    shippingInfo: new ShippingInfoView({
                        el: $('#step-shipping-method'),
                        model: checkoutModel.get('ShippingInfo')
                    }),
                    paymentInfo: new BillingInfoView({
                        el: $('#step-payment-info'),
                        model: checkoutModel.get('BillingInfo')
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
                comments: new CommentsView({
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

        checkoutModel.on('complete', function () {
            window.location = "/checkout/" + checkoutModel.apiModel.data.Id + "/confirmation";
        });

        var $reviewPanel = $('#step-review');
        checkoutModel.on('change:IsReady',function (isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');

        $checkoutView.noFlickerFadeIn();

    });
});
