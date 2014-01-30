define(['modules/jquery-mozu', 'hyprlive', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu", "modules/models-product"],
    function ($, Hypr, _, api, Backbone, ProductModels, UserModels) {
        
        function getExistingNotifications() {
            return ($.cookie('mozustocknotify') || '').split(',');
        }

        function saveNotification(productCode) {
            var existing = getExistingNotifications();
            $.cookie('mozustocknotify', existing.concat(productCode).join(','), { path: '/', expires: 365 });
        }

        var user = require.mozuData('user'),
            InstockReqView = Backbone.MozuView.extend({
                templateName: 'modules/product/product-instock-request',
                clearError: function() {
                    this.setError('');
                },
                setError: function(txt) {
                    this.$('[data-mz-validationmessage-for]').text(txt);
                },
                getRenderContext: function() {
                    var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                    context.subscribed = (_.indexOf(getExistingNotifications(), (this.model.get('variationProductCode') || this.model.get('productCode'))) !== -1);
                    return context;
                },
                render: function() {
                    Backbone.MozuView.prototype.render.apply(this, arguments);
                    this.$('.mz-instock-request').css('display', 'inherit');
                },
                widgetNotifyUserAction: function () {
                    var self = this;
                    this.clearError();
                    var email = this.$('[data-mz-role="email"]').val() || user.email;
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
                        saveNotification(self.model.get('variationProductCode') || self.model.get('productCode'));
                        self.render();
                    }, function () {
                        self.setError(Hypr.getLabel('notifyWidgetError'));
                    });
                }
            });
        
        $(document).ready(function () {
            var currentProduct = ProductModels.Product.fromCurrent(),
                inventoryInfo = currentProduct.get('inventoryInfo'),
                inStockRequestView = new InstockReqView({
                    model: currentProduct,
                    el: $('.mz-instock-request').first().parent()
                });
            
            
            if ((inventoryInfo && inventoryInfo.onlineStockAvailable < 1) || $('body').hasClass('mz-cms-editing')) {
                //renders on store front if there is no stock, or if we're in editing mode (for preview)
                inStockRequestView.render();
                //Takes away the initial flicker of showing then hiding 
            } else {
                inStockRequestView.$('.mz-instock-request').remove();
            }

        });

    });