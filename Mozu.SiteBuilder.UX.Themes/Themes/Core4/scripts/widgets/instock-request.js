define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product", 'modules/models-user'],
    function ($, _, api, Backbone, ProductModels, UserModels) {
        
        var InstockReqView = Backbone.MozuView.extend({
                templateName: 'modules/product/product-instock-request',
                widgetNotifyUserAction: function () {
                    var user = UserModels.User.fromCurrent();
                    var product = ProductModels.Product.fromCurrent();
                    var email = '';
                                     
                    if (user.attributes.isAnonymous) {
                        //get email address from text box
                        email = $('.mz-intstock-request-email').val();
                    } else {
                        //get email from customer model 
                        email = user.attributes.email;
                    }
                    console.log(email);
                    console.log(product.attributes.productCode);
                   
                }
            });
        
        $(document).ready(function () {
            var currentProduct = ProductModels.Product.fromCurrent();
            
            var relatedProductsView = new InstockReqView({
                model: ProductModels.Product.fromCurrent(),
                el: $('.mz-instock-request').parent()
            });
            
            if (currentProduct.attributes.inventoryInfo && currentProduct.attributes.inventoryInfo.onlineStockAvailable < 1) {
                //renders on store front if there is no stock
                relatedProductsView.render();
            } else {
                if (currentProduct.attributes.inventoryInfo) {
                    //removes from store front if there is stock
                    $('.mz-instock-request').parent().html('');
                } else {
                    //displays for preview in site builder
                    relatedProductsView.render();
                }
                
            }


        });

    });