define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, _, api, Backbone, ProductModels) {

        var getRelatedProducts = function(codes) {
            var filter = _.map(codes, function (c) { return "ProductCode eq " + c }).join(' or ');
            return api.get("search", { filter: filter });
        };

        

        var pageContext = require.mozuData('pagecontext');

        $(document).ready(function() {
            var currentProduct = require.mozuData('product');
            
            $('[data-mz-related-products]').each(function (index, rp) {
                rp = $(rp);
             

                
              
                var config = rp.data('mzRelatedProducts');
                var attId = config.attributeId || 'tenant~product-crosssell';
                var template = config.template || 'modules/product/product-list-carousel';
                var title = config.title;
                var productCodes;// = _.pluck(currentProduct.properties[0].values, "value");


                var RelatedProductsView = Backbone.MozuView.extend({
                    templateName: template
                });

                if (currentProduct &&  currentProduct.properties) {

                    for (var x = 0; x < currentProduct.properties.length; x++) {
                        if (currentProduct.properties[x].attributeFQN == attId) {
                            productCodes = _.pluck(currentProduct.properties[x].values, "value");
                            productCodes = $.grep(productCodes || [], function (x) { return !!x });
                        }
                    }
                }

                if (!productCodes || !productCodes.length) {
                    if (pageContext.isEditMode) {
                        rp.html('<b>tbd preview content</b>');
                    }
                    return;
                }

                getRelatedProducts(productCodes).then(function (collection) {


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