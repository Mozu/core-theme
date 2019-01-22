define(["modules/jquery-mozu", "modules/backbone-mozu", "modules/product-picker/product-modal-view", "modules/models-product", "modules/search-autocomplete"], function ($, Backbone, ProductModalViews, ProductModels, SearchAutoComplete) {
    var productPickerModel = Backbone.MozuModel.extend({
        relations: {
            selectedProduct: ProductModels.Product
        },
        defaults: {
            selectedProduct: ProductModels.Product.extend({})
        },
        toJSON: function(){
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            delete j.selectedProduct;
            return j;
        }
    });
    
    var productPickerView = Backbone.MozuView.extend({
        templateName: 'modules/product-picker/product-picker',
        render: function(){
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            //self.model.set('selectedProduct', new ProductModels.Product({}));
            // var productModalView = new ProductModalViews.ModalView({
            //     el: self.$el.find("[mz-modal-product-dialog]"),
            //     model: self.model.get('selectedProduct'),
            //     messagesEl: self.$el.find("[mz-modal-product-dialog]").find('[data-mz-message-bar]')
            // });
            // this.stopListening(self.model.get('selectedProduct'), "configurationComplete");
            // this.listenTo(self.model.get('selectedProduct'), "configurationComplete", function (product) {
            //     //console.log('Config Complete')
            //     self.model.addQuoteItem(product.model.toJSON(), self.model.get('pickerItemQuantity'));
            //     self.model.unset('selectedProduct');
            //     // productModalView.handleDialogCancel();
            //     window.productModalView.handleDialogCancel();
            //     $('.mz-b2b-quotes .mz-searchbox-input.tt-input').val('');
            //     $('.mz-b2b-quotes #pickerItemQuantity').val(1);
            // });

            // window.productConfigurationView = productModalView;
            // window.productConfigurationView.render();

            var $fields = self.$el.find('[data-mz-role="searchquery"]').each(function (field) {
                var search = new SearchAutoComplete();
                search.initialize();

                var $field = search.AutocompleteManager.$typeaheadField = $(this);

                search.AutocompleteManager.typeaheadInstance = $field.typeahead({
                    minLength: 0
                }, search.dataSetConfigs).data('ttTypeahead');
                $field.on('typeahead:selected', function (e, data, set) {
                    var product = data.suggestion;
                    self.model.set('selectedProduct', product);
                    // window.productModalView.loadAddProductView(self.model.get('selectedProduct'));
                    // window.productModalView.handleDialogOpen();
                    //self.model.trigger('productSelected', product);
                    // window.console.log('Add Product ' + data.suggestion.productCode);
                });
            });
        }
    });
    return productPickerView;
});