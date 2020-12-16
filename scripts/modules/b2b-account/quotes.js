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
    "modules/b2b-account/wishlists",
    'modules/mozu-quotes-grid/mozuquotesgrid-view',
    'modules/mozu-grid/mozugrid-pagedCollection',
    "modules/views-paging",
    'modules/editable-view',
    "modules/models-quotes"], 
    function ($, api, _, Hypr, Backbone, HyprLiveContext,
    CustomerModels, CartModels, B2BAccountModels, ProductModalViews,
    ProductPicker, ProductModels, WishlistModels, MozuGrid, MozuGridCollection,
    PagingViews, EditableView, QuoteModels) {
        var nameFilter = "name cont ";
        var expirationDateFilter  = "expirationdate ge ";
        var timeComponent = "T00:00:00z";
        var FILTERSTRING = "";
    var QuotesMozuGrid = MozuGrid.extend({
        render: function () {
            var self = this;
            MozuGrid.prototype.render.apply(self, arguments);
        }
    });

    var QuotesView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/quotes/quotes",
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var collection = new QuotesGridCollectionModel({ autoload: true });            
            $('[data-mz-action="applyfilter"]').on('change input', function(e) {
                e.preventDefault();
                FILTERSTRING = "";
                var dateValue ="";
                var nameValue = $(this).val();
                if($("#expirationdate").val()!=="")
                {                    
                    dateValue  = $("#expirationdate").val();
                }
                self.filterGrid(nameValue, dateValue, collection);
                
                });
             $('[data-mz-action="applyDatefilter"]').on('change', function(e) {
                e.preventDefault();
               
                var nameValue ="";
                if($("#searchName").val()!=="")
                {
                    nameValue  = $("#searchName").val()+" and ";
                }

                var dateValue =  $(this).val();                    
                self.filterGrid(nameValue, dateValue, collection);             
               
                });
            this.initializeGrid(collection);
        },

        filterGrid: function (nameValue, dateValue, collection)
        {
            FILTERSTRING = "";
             if(nameValue!=="")
             {
                 nameValue = nameFilter + nameValue;
                 FILTERSTRING = nameValue;
                 if(dateValue!=="")
                 {
                     dateValue = expirationDateFilter + dateValue + timeComponent;
                     FILTERSTRING = FILTERSTRING + " and "  + dateValue;
                 }
                 collection.filterBy(FILTERSTRING);
             }
          else if(dateValue!=="")
             {
                 FILTERSTRING = expirationDateFilter + dateValue + timeComponent;
                 collection.filterBy(FILTERSTRING);
             }
        },
        initializeGrid: function (collection) {
            var self = this;
            self._quotesGridView = new QuotesMozuGrid({
                el: $('.mz-b2b-quotes-grid'),
                model: collection
            });
        },
        registerRowActions: function () {
            var self = this;
            var rowActions = this.model.get('rowActions');
            _.each(rowActions, function (action) {
                self[action.action] = function (e) {
                    var rowNumber = $(e.target).parents('.mz-grid-row').data('mzRowIndex');
                    var row = self.model.get('items').at(rowNumber - 1);
                    self.model[action.action](e, row);
                };
            });
        }     
       
    });

    var QuoteEditView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/edit-quotes',
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
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

    var QuotesGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'quotes',
        defaultSort: 'submittedDate desc',
        columns: [
            {
                index: 'name',
                displayName: 'Quote Name',
                sortable: false
            },
            {
                index: 'expirationDate',
                displayName: 'Expiration Date',
                sortable: true,
                displayTemplate: function (value) {
                    var date = new Date(value);
                    return date.toLocaleString();
                }
            },
            {
                index: 'submittedDate',
                displayName: 'Created',
                sortable: true,
                displayTemplate: function (value) {
                    var date = new Date(value);
                    return date.toLocaleString();
                }
            },
            {
                index: 'total',
                displayName: 'Total',
                sortable: false,
                displayTemplate: function (amount) {
                    return '$' + amount.toFixed(2);
                }
            },
            {
                index: 'status',
                displayName: 'Status',
                sortable: false
            }
        ],
        rowActions: [
            {
                displayName: 'Edit Quote',
                action: 'editQuote'
            },
            {
                displayName: 'Delete Quote',
                action: 'deleteQuote'
            },
            {
                displayName: 'Copy Quote',
                action: 'copyQuote'
            },
            {
                displayName: 'Email Quote',
                action: 'emailQuote'
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: QuoteModels.Quote
            })
        },
        editQuote: function (e, row) {
            var quoteId = row.get('id');
            window.location = '/myaccount/quote/' + quoteId + '/edit';
        },
        deleteQuote: function () {
            this.trigger('deleteQuoteView');
        },
        copyQuote: function () {
            this.set('copyQuoteView');
        },
        emailQuote: function () {
            this.set('emailQuoteView');
        }
    });

    return {
        'QuotesView': QuotesView,
        'QuoteEditView': QuoteEditView,
        'QuoteModel': QuoteModel
    };
});
