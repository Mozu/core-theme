require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/models-product", "modules/product-images", "shim!vendor/jquery.tools.dateinput[jquery=jQuery]"], function ($, Backbone, ProductModels) {

    var ProductView = Backbone.MozuView.extend({
        templateName: 'Modules/Product/ProductDetail',
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
        onOptionChange: function(e){
            return this.configure($(e.currentTarget));
        },
        configure: function($optionEl) {
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

        // gather view elements
        var $productEl = $('#mz-product-detail');

        // create the observable view model
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
            el: $productEl.find('.mz-detail-info-wrap'),
            model: product,
            messagesEl: $productEl.find('[data-mz-message-bar]')
        });

        window.productView = productView;


    });

});
