require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", "modules/cart-monitor", "modules/models-product", "modules/views-productimages", "hyprlivecontext", "modules/api", "vendor/es6-promise/dist/es6-promise"], function ($, _, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, HyprLiveContext, api, Promise) {

    var ProductView = Backbone.MozuView.extend({
        requiredBehaviors: [1014],
        templateName: 'modules/product-collection/product-collection-detail',
        additionalEvents: {            
            "click [data-mz-action='getMembersData']": "getMembersData"
        },
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        getMembersData: function () {
            var self = this;
            var array = self.model.get('productMembers');
            var count = array.length;
            if (array === null || array.length < 1)
                return;

            self.model.set('count', count);
            var productFilter = this.buildProductFilter(array);
            //var member1 = api.request('GET', "/api/commerce/catalog/storefront/products/"+array[0]);            
            //var member2 = api.request('GET', "/api/commerce/catalog/storefront/products/"+array[1]);            
            var member1 = api.request('GET', "/api/commerce/catalog/storefront/products/" + productFilter);
            member1.then(function (response) {
                self.model.set('productMembersdata', response.items);
                self.render();
            });
        },
        buildProductFilter: function(productMembers) {
            var products = "?filter=productCode in [" + productMembers.join(",") + "]";
            var pageSize = "&pagesize=35";
            var responseFields = "&responseFields=items(productCode,content(productName,productShortDescription,seoFriendlyUrl,productImages),purchasableState,price,pricingBehavior,isTaxable,inventoryInfo,options,variations,productCollections)";
            return products + pageSize + responseFields;
        },
        getProductMembers: function () {
            var productMembers = this.model.get('productCollectionMembers'), members = [];
            for (var key in productMembers) {
                if (productMembers.hasOwnProperty(key)) {
                    members.push(productMembers[key].memberKey.value);
                }
                this.model.set('productMembers', members);
            }
            this.getMembersData();
        },                
        initialize: function () {
            // handle preset selects, etc
            var me = this;
            this.$('[data-mz-product-option]').each(function () {
                var $this = $(this), isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });
            this.getProductMembers();
        }
    });

    $(document).ready(function () {
        var product = ProductModels.Product.fromCurrent();               

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        window.productView = productView;
        productView.render();
    });
});