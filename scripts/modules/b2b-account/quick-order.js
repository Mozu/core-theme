define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    'modules/preserve-element-through-render',
    'modules/modal-dialog',
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/models-cart",
    'modules/cart-monitor',
    "modules/product-picker/product-modal-view",
    "modules/product-picker/product-picker-view",
    "modules/models-product",
    'modules/xpress-paypal',
    'modules/amazonPay',
    'modules/applepay',
    'modules/cart-common-view',
    'modules/cart/discount-dialog/views-discount-dialog',
    'modules/models-discount',
    'modules/message-handler'
], function ($, api, _, Hypr, preserveElement, modalDialog, Backbone, HyprLiveContext, CartModels, CartMonitor, ProductModalViews,
    ProductPicker, ProductModels, paypal, AmazonPay, ApplePay, CartView, DiscountModalView, MessageHandler) {

    var QuickOrderView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quick-order/quick-order',
        autoUpdate: ['pickerItemQuantity'],
        additionalEvents: {
            "change [data-mz-value='quantity']": "onQuantityChange"
        },
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var productModalView = new ProductModalViews.ModalView({
                el: self.$el.find("[mz-modal-product-dialog]"),
                model: new ProductModels.Product({}),
                messagesEl: self.$el.find("[mz-modal-product-dialog]").find('[data-mz-message-bar]')
            });
            window.quickOrderModalView = productModalView;

            var productPickerView = new ProductPicker({
                el: self.$el.find('[mz-wishlist-product-picker]'),
                model: self.model
            });
            productPickerView.render();
            $(document).ready(function () {
                var cart = CartModels.Cart.fromCurrent();
                cart.apiModel.cartDetails().then(function (response) {

                    var cartModel = new CartModels.Cart(response.data);
                    var cartViews = {

                        cartView: new CartView({
                            el: $('#cart1'),
                            model: cartModel,
                            messagesEl: $('[data-mz-message-bar]')
                        }),
                        discountModalView: new DiscountModalView({
                            el: $("[mz-modal-discount-dialog]"),
                            model: cartModel.get('discountModal'),
                            messagesEl: $("[mz-modal-discount-dialog]").find('[data-mz-message-bar]')
                        })

                    };

                    _.debonce(renderCartView(cartModel, cartViews), 200);
                });
            });
        },

        addItemToOrder: function (event) {
            var self = this;
            var product = self.model.get('selectedProduct');
            if(product) {
                if (product.options) {
                    if (!(product instanceof ProductModels.Product)) {
                        if (product.toJSON)
                            product = product.toJSON();
                        product = new ProductModels.Product(product);
                    }

                    this.stopListening();
                    this.listenTo(product, "configurationComplete", function () {
                        self.finalizeAddItemToOrder(product);
                        window.quickOrderModalView.handleDialogClose();

                    });
                    window.quickOrderModalView.loadAddProductView(product);
                    window.quickOrderModalView.handleDialogOpen();
                    return;
                }
                self.finalizeAddItemToOrder(product);
               
            }
            //self.render();
        },
        finalizeAddItemToOrder: function (product, quantity) {
            var self = this;
            if (product.toJSON)
                product = product.toJSON();
                if(Number($('.quickorder-form-section #pickerItemQuantity').val()) === 0) {
                    var msg = Hypr.getLabel('enterProductQuantity') ;
                    $('[data-mz-role="popover-message"]').html('<span class="mz-addproductvalidationmessage">' + msg + '</span>');
                    self.resetProductPicker();
                    return false;   
                }
            this.model.addItemToOrder(product, product.quantity || $('.quickorder-form-section #pickerItemQuantity').val());
            self.resetProductPicker();
        },
        resetProductPicker: function() {
            var self = this;
            $('.quickorder-form-section .mz-searchbox-input.tt-input').val('');
            $('.quickorder-form-section #pickerItemQuantity').val(1);
            self.model.unset('selectedProduct');
        }
    });
    var QuickOrderModel = Backbone.MozuModel.extend({
        defaults: {
            'pickerItemQuantity': 1
        },
        relations: {
            items: Backbone.Collection.extend({
                model: Backbone.MozuModel
            })
        },
        addItemToOrder: function (product, quantity) {
            var self = this;
            var isItemDigital = _.contains(product.fulfillmentTypesSupported, "Digital");
            self.isLoading(true);
            var cart = CartModels.Cart.fromCurrent();
            cart.apiModel.addProduct({
                product: {
                    productCode: product.productCode,
                    variationProductCode: product.variationProductCode,
                    bundledProducts: product.bundledProducts,
                    options: product.options || []
                },
                fulfillmentMethod: (!isItemDigital ? "Ship" : "Digital"),
                quantity: quantity
            }).then(function (item) {
                $('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage"></span>');
                cart.apiModel.cartDetails().then(function (response) {

                    self.isLoading(false);
                    window.cartId = response.data.id;
                    var cartModel = new CartModels.Cart(response.data);
                    var cartViews = {

                        cartView: new CartView({
                            el: $('#cart1'),
                            model: cartModel,
                            messagesEl: $('[data-mz-message-bar]')

                        }),
                        discountModalView: new DiscountModalView({
                            el: $("[mz-modal-discount-dialog]"),
                            model: cartModel.get('discountModal'),
                            messagesEl: $("[mz-modal-discount-dialog]").find('[data-mz-message-bar]')
                        })
                    };
                    _.debonce(renderCartView(cartModel, cartViews), 200);
                });
            }, function (error) {
                self.isLoading(false);
                $('[data-mz-role="popover-message"]').html('<span class="mz-addproductvalidationmessage">' + error.message + '</span>');
            });
        }
    });

    function renderCartView(cartModel, cartViews) {
        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + '/checkout/' + order.prop('id');
        });

        cartModel.on('sync', function () {
            CartMonitor.setCount(cartModel.count());
        });
        window.order = {
            id: cartModel.id
        };


        window.cartView = cartViews;
        cartViews.cartView.render();
        CartMonitor.setCount(cartModel.count());
        cartViews.discountModalView.render();
        renderVisaCheckout(cartModel);

        if (cartModel.count() > 0) {
            paypal.loadScript();
            if (AmazonPay.isEnabled) {
                AmazonPay.addCheckoutButton(cartModel.id, true);
            }
            ApplePay.init();

           
        } else if (cartModel.count() === 0) {
            AmazonPay.isEnabled = false;
        }


    }
    function renderVisaCheckout(model) {

        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        //In case for some reason a model is not passed
        if (!model) {
            model = CartModels.Cart.fromCurrent();
        }
        window.cartId = model.get('id');
        function initVisa() {
            var delay = 200;
            if (window.V) {
                window.V.init({
                    apikey: apiKey,
                    clientId: clientId,
                    paymentRequest: {
                        currencyCode: model ? model.get('currencyCode') : 'USD',
                        subtotal: "" + model.get('subtotal')
                    }
                });
                return;
            }
            _.delay(initVisa, delay);
        }

        initVisa();

    }

    return {
        'QuickOrderView': QuickOrderView,
        'QuickOrderModel': QuickOrderModel
    };
});
