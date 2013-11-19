define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, _, api, Backbone, ProductModels) {
        
        var pageContext = require.mozuData('pagecontext');
        var InstockReqView = Backbone.MozuView.extend({
                    templateName: 'modules/product/product-instock-request'
                });
        
        $(document).ready(function () {
            
            var relatedProductsView = new InstockReqView({
            el: 'mz-instock-request'
            });
            
        relatedProductsView.render();
           
        });

    });