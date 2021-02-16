require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", "modules/cart-monitor", "modules/models-product", "modules/views-productimages", "hyprlivecontext", "modules/api", "vendor/es6-promise/dist/es6-promise"], function ($, _, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, HyprLiveContext, api, Promise) {

    var ProductView = Backbone.MozuView.extend({
        requiredBehaviors: [1014],
        templateName: 'modules/product-collection/product-collection-detail',
        additionalEvents: {
            "click [data-mz-action='getMembersData']": "getMembersData",
            "change [data-mz-value='quantity']": "onMemberQuantityChange",
            "keyup input[data-mz-value='quantity']": "onMemberQuantityChange",
            "change [data-mz-product-option]": "onMemberOptionChange",
            "blur [data-mz-product-option]": "onMemberOptionChange"
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
            if (array === null || array.length < 1)
                return Promise.resolve();

            var productFilter = this.buildProductFilter(array);
            var member1 = api.request('GET', "/api/commerce/catalog/storefront/products/" + productFilter);
            return member1.then(function (response) {
                var members = [];
                //Sort based on collection member ranking
                var sortedResults =  response.items.sort(function(a, b){  
                    if (array.indexOf(a.productCode) < 0 ) return 1;
                    return array.indexOf(a.productCode) - array.indexOf(b.productCode);
                });
                for (var memberProduct in sortedResults) {
                    var mp = new ProductModels.Product(sortedResults[memberProduct]);
                    // initialize
                    mp.set('memberindex', memberProduct);
                    mp.on('optionsUpdated', self.onMemberOptionUpdate);
                    if (mp.get('productUsage') === 'Configurable') {
                        mp.lastConfiguration = mp.getConfiguredOptions();
                    }
                    members.push(mp);
                }
                var mpo = self.model.get('memberProducts');
                mpo.add(members);
                self.model.set('count', members.length);
                return members;
            });

        },
        buildProductFilter: function (productMembers) {
            var products = "?filter=productCode in [" + productMembers.join(",") + "]";
            var pageSize = "&pagesize=35";
            var responseFields = "&responseFields=items(productCode,content(productName,productShortDescription,seoFriendlyUrl,productImages),purchasableState,price,pricingBehavior,isTaxable,inventoryInfo,options,variations,productCollections)";
            return products + pageSize; // + responseFields;
        },
        getProductMembers: function () {
            var productMembers = this.model.get('productCollectionMembers'), members = [];
            for (var key in productMembers) {
                if (productMembers.hasOwnProperty(key)) {
                    members.push(productMembers[key].memberKey.value);
                }
                this.model.set('productMembers', members);
            }
            return this.getMembersData();
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
            //this.getProductMembers();
        },
        addToCart: function (e) {
            this.model.addMemberToCart(e, true);
        },
        addToWishlist: function (e) {
            this.model.addMemberToWishlist(e);
        },
        onMemberQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                memberIndex = $(e.currentTarget).data("memberindex");
            if (!isNaN(newQuantity)) {
                var me = this;
                // determine which member model to call this one
                var members = me.model.get('memberProducts');
                var memberProduct = members.models[memberIndex];
                memberProduct.updateQuantity(newQuantity);

            }
        }, 500),
        onMemberOptionChange: function (e) {            
            return this.configure($(e.currentTarget));
        },
        onMemberOptionUpdate: function () {
            var me = this;
            // force re-render of main view
            window.productView.render();            
        },
        configure: function ($optionEl) {
            var me = this;
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked;

            var memberIndex = $($optionEl).parent().data('memberindex');
            var members = me.model.get('memberProducts');
            var memberProduct = members.models[memberIndex];

            var option = memberProduct.get('options').findWhere({ 'attributeFQN': id });
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        }
    });




    $(document).ready(function () {
        var product = ProductModels.Product.fromCurrent();

        product.on('addedtocart', function (cartitem, stopRedirect) {
            if (cartitem && cartitem.prop('id')) {
                //product.isLoading(true);
                CartMonitor.addToCount(cartitem.data.quantity);
                if (!stopRedirect) {
                    window.location.href = (HyprLiveContext.locals.pageContext.secureHost || HyprLiveContext.locals.siteContext.siteSubdirectory) + "/cart";
                }

            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            }
        });

        product.on('addedtowishlist', function (cartitem, e) {
            $(e.currentTarget).prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
            //$('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
        });
       
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
        productView.getProductMembers().then(function () {
            productView.render();
        });

        $('.mz-carttable-button-active').on('click', function () {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#product-detail").offset().top
            }, 1000);
        });

    });
});