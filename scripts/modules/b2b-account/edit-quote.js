define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/product-picker/product-modal-view",
    "modules/product-picker/product-picker-view",
    "modules/models-product",
    "modules/models-quotes",
    'modules/models-b2b-account'
], function ($, api, _, Hypr, Backbone, HyprLiveContext, ProductModalViews,
        ProductPicker, ProductModels, QuoteModels, B2BAccountModels) {

    var QuoteEditView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/edit-quote',
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);            
        },
        render: function () {
            var self = this;
            this.populateWithUsers();
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var productModalView = new ProductModalViews.ModalView({
                el: self.$el.find("[mz-modal-product-dialog]"),
                model: new ProductModels.Product({}),
                messagesEl: self.$el.find("[mz-modal-product-dialog]").find('[data-mz-message-bar]')
            });
            window.quickOrderModalView = productModalView;

            var productPickerView = new ProductPicker({
                el: self.$el.find('[mz-wishlist-product-picker]'),
                model: self.model
            });

            productPickerView.render();
        },
        populateWithUsers: function () {
            var self = this;
            if (!self.model.get('fullName')) {
                var userId = self.model.get('userId');
                var b2bAccount = new B2BAccountModels.b2bAccount({ id: require.mozuData('user').accountId });
                return b2bAccount.apiGetUsers().then(function (users) {
                    if (users && users.data.items) {
                        users.data.items.forEach(function (user) {
                            if (user.userId == userId) {
                                self.model.set('fullName', user.firstName + ' ' + user.lastName);
                                self.render();
                            }
                        });
                    }
                });
            }
        },
        startEditingQuoteName: function () {
            var self = this;


            self.render();
        },
        toggleAdjustmentBlocks: function (e) {
            var self = this;
            var currentTargetId = e.currentTarget.id;
            var currentImage = $('#' + currentTargetId).attr('src');
            var toggleImage = currentImage.includes('arrow-down') ?
                currentImage.replace('arrow-down', 'arrow-right') :
                currentImage.replace('arrow-right', 'arrow-down');

            $('#' + currentTargetId).attr('src', toggleImage);
            self.$('.' + currentTargetId).toggle('slow');
        }
    });

    $(document).ready(function () {
        var model = new QuoteModels.Quote(require.mozuData("quote") || {});
        var quoteEditView = new QuoteEditView({
            el: $('#mz-edit-quote-page'),
            templateName: 'modules/b2b-account/quotes/edit-quote',
            model: model
        });

        quoteEditView.render();        
    });

});
