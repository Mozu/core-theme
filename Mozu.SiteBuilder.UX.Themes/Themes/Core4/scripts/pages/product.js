require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/models-product", "modules/views-productimages", "modules/jquery-dateinput-localized"], function ($, Backbone, ProductModels, ProductImageViews) {

    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail',
        autoUpdate: ['Quantity'],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange"
        },
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', '#333').on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        configure: function ($optionEl) {
            var newValue = $optionEl.val(),
                id = $optionEl.data('mz-product-option');
            this.model.get('Options').get(id).set("Value", newValue);
        },
        addToCart: function () {
            this.model.addToCart();
        },

        initialize: function () {
            // handle preset selects, etc
            var me = this;
            this.$('[data-mz-product-option]').each(function () {
                var $this = $(this);
                if ($this.val()) me.configure($this);
            });
        }
    });

    $(document).ready(function () {

        var product = ProductModels.Product.fromCurrent();
        product.on('addedtocart', function (cartitem) {
            if (cartitem && cartitem.prop('Id')) {
                product.isLoading(true);
                window.location.href = "/cart";
            } else {
                product.trigger("error", { Message: "Unknown error!" });
            }
        });

        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        window.productView = productView;

        productView.render();


    });

});
