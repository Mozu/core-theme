define(['modules/jquery-mozu', 'hyprlive', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, Hypr, _, api, Backbone, ProductModels, UserModels) {
        
        var user = require.mozuData('user'),
            InstockReqView = Backbone.MozuView.extend({
                templateName: 'modules/product/product-instock-request',
                clearError: function() {
                    this.setError('');
                },
                setError: function(txt) {
                    this.$('[data-mz-validationmessage-for]').text(txt);
                },
                widgetNotifyUserAction: function () {
                    this.clearError();
                    var email = user.isAnonymous ? this.$('[data-mz-role="email"]').val() : user.email;
                    if (!email) {
                        this.setError(Hypr.getLabel('emailMissing'));
                        return false;
                    }
                    api.create('instockrequest', {
                        email: email,
                        customerId: user.accountId,
                        productCode: this.model.get('productCode'),
                        locationCode: this.model.get('inventoryInfo').onlineLocationCode
                    }).then(function () {
                        this.$('[data-mz-action="widgetNotifyUserAction"]').text(Hypr.getLabel('subscribed')).prop('disabled', true);
                    });
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
                //Takes away the initial flicker of showing then hiding 
                $('.mz-instock-request').css('display', 'inherit');
            } else {
                if (currentProduct.attributes.inventoryInfo) {
                    //removes from store front if there is stock
                    $('.mz-instock-request').parent().html('');
                } else {
                    //displays for preview in site builder
                    relatedProductsView.render();
                    //Takes away the initial flicker of showing then hiding 
                    $('.mz-instock-request').css('display', 'inherit');
                }
                
            }


        });

    });