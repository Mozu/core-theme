define(['modules/backbone-mozu', 'underscore', 'modules/jquery-mozu', 'modules/models-cart', 'modules/cart-monitor', 'hyprlivecontext'], function (Backbone, _, $, CartModels, CartMonitor, HyprLiveContext) {
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        initialize: function () {
            var me = this;

            this.listenTo(this.model, 'change:total', this.onTotalChange, this);
            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });

            // This url will differ between sandbox and production. It may be added to the site context,
            // or it could come from a theme setting, ex: Hypr.getThemeSetting('visaCheckoutSdkUrl')
            var sdkUrl = 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js';

            // The VisaCheckout SDK wants a global function to call when it's ready
            // so we give it the same function we call when we're ready
            window.onVisaCheckoutReady = initVisaCheckout;
            require([sdkUrl], initVisaCheckout);
        },
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
            }
        },400),
        removeItem: function(e) {
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.removeItem(id);
            return false;
        },
        empty: function() {
            this.model.apiDel().then(function() {
                window.location.reload();
            });
        },
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        addCoupon: function () {
            var self = this;
            this.model.addCoupon().ensure(function () {
                self.model.unset('couponCode');
                self.render();
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
            }
        },
        onTotalChange: initVisaCheckout,
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    /* begin visa checkout */
    function initVisaCheckout (model, total) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey || '0H1JJQFW9MUVTXPU5EFD13fucnCWg42uLzRQMIPHHNEuQLyYk';
        var clientId = visaCheckoutSettings.clientId || 'mozu_test1';

        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            total = model.get('total');
            delay = 0;

            // on success, attach the encoded payment data to the window
            // then turn the cart into an order and advance to checkout
            V.on("payment.success", function(payment) {
                // payment here is an object, not a string. we'll stringify it later
                window.V_success = payment;
                window.cartView.cartView.model.toOrder();
            });

            // for debugging purposes only. don't use this in production
            V.on("payment.cancel", function(payment) {
                console.log({ cancel: JSON.stringify(payment) });
            });

            // for debugging purposes only. don't use this in production
            V.on("payment.error", function(payment, error) {
                console.warn({ error: JSON.stringify(error) });
            });
        }

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                total: "" + total
            }
        });
    }
    /* end visa checkout */

    $(document).ready(function() {
        var cartModel = CartModels.Cart.fromCurrent(),
            cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                })

            };

        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.prop('id');
        });

        cartModel.on('sync', function() {
            CartMonitor.setCount(cartModel.count());
        });

        window.cartView = cartViews;

        CartMonitor.setCount(cartModel.count());
    });

});