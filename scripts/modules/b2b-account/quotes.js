define([
  "modules/jquery-mozu",
  'modules/api',
  "underscore",
  "hyprlive",
  "modules/backbone-mozu",
  "hyprlivecontext",
  "modules/models-customer",
  "modules/models-cart",
  "modules/models-b2b-account",
  "modules/product-picker/product-modal-view",
  "modules/product-picker/product-picker-view",
  "modules/models-product",
  "modules/b2b-account/wishlists"
], function ($, api, _, Hypr, Backbone, HyprLiveContext,
  CustomerModels, CartModels, B2BAccountModels, ProductModalViews,
  ProductPicker, ProductModels, WishlistModels) {

    var QuoteEditView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/edit-quotes',
        initialize: function(){
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function(){
            var self = this;
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

    var QuoteModel = Backbone.MozuModel.extend({
      });

    return {
        'QuoteEditView': QuoteEditView,
        'QuoteModel': QuoteModel
    };
});
