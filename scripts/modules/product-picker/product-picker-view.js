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

            var $fields = self.$el.find('[data-mz-role="searchquery"]').each(function (field) {
                var search = new SearchAutoComplete();
                search.initialize({doNotsuggestPriorSearchTerms: true});

                var $field = search.AutocompleteManager.$typeaheadField = $(this);

                search.AutocompleteManager.typeaheadInstance = $field.typeahead({
                    minLength: 1
                }, search.dataSetConfigs).data('ttTypeahead');
                $field.on('typeahead:selected', function (e, data, set) {
                    var product = data.suggestion;
                    self.model.set('selectedProduct', product);
                });
            });
        }
    });
    return productPickerView;
});