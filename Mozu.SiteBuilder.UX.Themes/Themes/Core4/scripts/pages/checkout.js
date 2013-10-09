require(["shim!vendor/bootstrap-affix[modules/jquery-mozu=jQuery]>jQuery", "shim!vendor/underscore>_", "modules/backbone-mozu", "modules/models-checkout"], function ($, _, Backbone, CheckoutModels) {

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
            this.$el.removeClass('mz-stepstatus-new mz-stepstatus-incomplete mz-stepstatus-complete mz-stepstatus-invalid').addClass('mz-stepstatus-' + this.model.stepStatus());
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.resize();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });

    var OrderSummaryView = Backbone.MozuView.extend({
        templateName: 'Modules/Checkout/CheckoutOrderSummaryPanel',
        editCart: function () {
            window.location = "/cart";
        }
    });

    var ShippingAddressView = CheckoutStepView.extend({
        templateName: 'Modules/Checkout/CheckoutShippingAddressPanel',
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
        templateName: 'Modules/Checkout/CheckoutShippingMethodPanel',
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
        templateName: 'Modules/Checkout/CheckoutPaymentInfoPanel',
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
        templateName: 'Modules/Checkout/CheckoutCouponCodeField',
        autoUpdate: [
            'CouponCode'
        ],
        renderOnChange: [
            'CouponCode'
        ],
        addCoupon: function (e) {
            this.model.addCoupon();
        },
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    var CommentsView = Backbone.MozuView.extend({
        templateName: 'Modules/Checkout/CheckoutCommentsField',
        autoUpdate: ['Comments']
    });

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'Modules/Checkout/CheckoutReviewPanel',
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

        var $checkoutView = $('#mz-checkout-form'),
            checkoutData = require.mozuData('checkout'),
            shippingMethodData = require.mozuData('shippingmethods'),
            $messageBar = $('[data-mz-message-bar]')


        // some defaults to overcome backbone not initializing models right
        // when there isn't an object for them. TODO: make unnecessary
        checkoutData = $.extend(true, {
            ShippingInfo: {
                AvailableShippingMethods: $.isArray(shippingMethodData) ? shippingMethodData : [],
                ShippingContact: {
                    Address: {},
                    PhoneNumbers: {}
                }
            },
            BillingInfo: {
                paymentApiBase: require.mozuData('paymentapibase'),
                BillingContact: {
                    Address: {},
                    PhoneNumbers: {}
                }
            }
        }, checkoutData);

        var checkoutModel = new CheckoutModels.CheckoutPage(checkoutData),
            checkoutViews = {
                steps: {
                    shippingAddress: new ShippingAddressView({
                        el: $('#mz-shipping-address-panel'),
                        model: checkoutModel.get("ShippingInfo").get("ShippingContact")
                    }),
                    shippingInfo: new ShippingInfoView({
                        el: $('#mz-shipping-method-panel'),
                        model: checkoutModel.get('ShippingInfo')
                    }),
                    paymentInfo: new BillingInfoView({
                        el: $('#mz-payment-information-panel'),
                        model: checkoutModel.get('BillingInfo')
                    })
                },
                orderSummary: new OrderSummaryView({
                    el: $('#mz-order-summary-panel'),
                    model: checkoutModel
                }),
                couponCode: new CouponView({
                    el: $('#mz-coupon-code-container'),
                    model: checkoutModel
                }),
                comments: new CommentsView({
                    el: $('#mz-order-comments-container'),
                    model: checkoutModel
                }),
                
                reviewPanel: new ReviewOrderView({
                    el: $('#mz-checkout-reviewpanel'),
                    model: checkoutModel
                }),
                messageView: new Backbone.MozuMessageView({
                    el: $checkoutView.find('[data-mz-message-bar]'),
                    model: checkoutModel.messages
                })
            };


        // run jquery affix manually (since the spy attributes don't work with IE in knockout)
        var $rightcol = $('#mz-checkout-rightcol');
        var rcOffset = $rightcol.offset();
        var affixer = $rightcol.css('left', rcOffset.left).affix({ offset: rcOffset }).data('affix');

        $(window).on('resize', function () {
            if ($rightcol.hasClass('affix')) {
                $rightcol.css('position', 'static').css('left', $rightcol.offset().left).css('position', '');
            } else {
                $rightcol.css('left', $rightcol.offset().left);
            }
        });

        window.checkoutViews = checkoutViews;

        checkoutModel.on('complete', function () {
            window.location = "/checkout/" + checkoutModel.apiModel.data.Id + "/confirmation";
        });

        var $reviewPanel = $('#mz-checkout-reviewpanel');
        checkoutModel.on('change:IsReady',function (isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');

        $checkoutView.noFlickerFadeIn();

    });
});
