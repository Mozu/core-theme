define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, _, api, Backbone, ProductModels) {

        var getRelatedProducts = function(pageType, codes, pageSize) {
            var filter = _.map(codes, function (c) { return "ProductCode eq " + c }).join(' or ');
            var retval = '';
            
            switch(pageType) {
                case 'product': retval =api.get("search", { filter: filter});
                    break;
                case 'cart': retval = api.get("search", { filter: filter, pageSize: pageSize });
                    break;
            }
            
            return retval;
        };

        

        var pageContext = require.mozuData('pagecontext');

        $(document).ready(function() {
            var productCollection = [];

            switch(pageContext.pageType) {
                case 'product':
                    productCollection.push(require.mozuData('product'));
                    break;
                case 'cart':
                    var cartItems = require.mozuData('cart').items;
                    $.each(cartItems, function(index, value) {
                        productCollection.push(value.product);
                    });
                    break;
            }
            
            $('[data-mz-related-products]').each(function (index, rp) {
                rp = $(rp);
             
                var config = rp.data('mzRelatedProducts');
                var attId = config.attributeId || 'tenant~product-crosssell';
                var template = config.template || 'modules/product/product-list-carousel';
                var title = config.title;
                var numberToDisplay = config.count || 5;
                var productCodes = [];// = _.pluck(currentProduct.properties[0].values, "value");
                

                var RelatedProductsView = Backbone.MozuView.extend({
                    templateName: template
                });
                
                for (var i = 0; i < productCollection.length; i++) {
                    var currentProduct = productCollection[i];
                    
                    if (currentProduct && currentProduct.properties) {
                        for (var x = 0; x < currentProduct.properties.length; x++) {
                            if (currentProduct.properties[x].attributeFQN == attId) {
                                var temp = _.pluck(currentProduct.properties[x].values, "value");
                                productCodes = productCodes.concat($.grep(temp || [], function (x) { return !!x }));
                                
                            }
                        }
                    }
                }

                if (!productCodes || !productCodes.length) {
                    if (pageContext.isEditMode) {
                        rp.html('<b>tbd preview content</b>');
                    }
                    return;
                }

                getRelatedProducts(pageContext.pageType, productCodes, numberToDisplay).then(function (collection) {

                    var relatedProductsCollection = new ProductModels.ProductCollection(collection.data);
                    var relatedProductsView = new RelatedProductsView({
                        model: relatedProductsCollection,
                        el: rp
                    });
                    relatedProductsView.render();
                    rp.prepend('<h3>' + title + '</h3>');

                });


                
            });
           

        });

    });