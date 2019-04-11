define([
  "modules/jquery-mozu",
  'modules/api',
  "underscore",
  "hyprlive",
  "modules/backbone-mozu",
  "hyprlivecontext",
  'modules/mozu-grid/mozugrid-view',
  'modules/mozu-grid/mozugrid-pagedCollection',
  "modules/views-paging",
  "modules/models-product",
  "modules/models-quote",
  "modules/search-autocomplete",
  "modules/models-cart",
  "modules/product-picker/product-picker-view",
  "modules/backbone-pane-switcher",
  "modules/product-picker/product-modal-view",
  "modules/mozu-utilities",
  "modules/message-handler"
], function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, ProductModels, QuoteModels, SearchAutoComplete, CartModels, ProductPicker, PaneSwitcher, ProductModalViews, MozuUtilities, MessageHandler) {
    var ALL_LISTS_FILTER = "";
    var USER_LISTS_FILTER = "userId eq " + require.mozuData('user').userId;
    var QuoteModel = QuoteModels.Quote.extend({
        handlesMessages: true,
        deleteQuote: function (id) {
            // if (id) {
            //     return this.apiModel['delete']({ id: id });
            // }
        },
        saveQuote: function () {
            // this.set('customerAccountId', require.mozuData('user').accountId);
            // if (!this.get('name') || this.get('name') === " ") {
            //     this.set('name', 'New List - ' + Date.now());
            // }
            // if(!this.get('userId')) {
            //     this.set('userId', require.mozuData('user').userId);
            // }
            // this.set('customerAccountId', require.mozuData('user').accountId);
            //
            // if (this.get('id')) {
            //     this.syncApiModel();
            //     return this.apiModel.update();
            // }
            //   return this.apiModel.create(this.model);
        }
    });

    var QuotesModel = Backbone.MozuModel.extend({
        defaults: {
            isDetailMode: false
        },
        relations: {
            quote: QuoteModel
        },
        setQuote: function (quote) {
            if (!(quote instanceof QuoteModel)) {
                if (quote.toJSON)
                    quote = quote.toJSON();
                quote = new QuoteModel(quote);
            }
            this.get('quote').clear();
            if (this.get('quote').get('items').length) {
                this.get('quote').get('items').reset();
            }

            quote.get('items').forEach(function(item){
                item.get('product').url = (HyprLiveContext.locals.siteContext.siteSubdirectory || '')+'/p/'+item.get('product').productCode;
            });
            this.set('quote', quote);
            this.get('quote').syncApiModel();
        },
        setDetailMode: function (flag) {
            return this.set('isDetailMode', flag);
        },
        toggleDetailMode: function () {
            if (this.get('isDetailMode')) {
                return this.setDetailMode(false);
            }
            return this.setDetailMode(true);
        }
    });

    var QuotesMozuGrid = MozuGrid.extend({
      render: function(){
          var self = this;
          this.populateWithUsers();
          MozuGrid.prototype.render.apply(self, arguments);
      },
      populateWithUsers: function(){
          var self = this;
          self.model.get('items').models.forEach(function(quote){
              var userInQuestion = window.b2bUsers.find(function(user){
                  return (user.userId === quote.get('userId'));
              });
              quote.set('userFullName', userInQuestion.firstName+' '+userInQuestion.lastName);
          });
          return self.model;
      }
    });

    var QuotesView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/my-quotes',
        initialize: function(){
            var self = this;
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
            this.model.set('viewingAllQuotes', true);
        },
        toggleViewAllLists: function (e) {
          this._wishlistsGridView.model.setPage(1);
            if (e.currentTarget.checked){
              this.model.set('viewingAllQuotes', true);
              this._wishlistsGridView.model.filterBy(ALL_LISTS_FILTER);
            } else {
              this.model.set('viewingAllQuotes', false);
              this._wishlistsGridView.model.filterBy(USER_LISTS_FILTER);
            }
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            if (this._detailQuote) {
                this._detailQuote.stopListening();
            }
            var detailQuoteView = new DetailQuoteView({
                // TODO: CHANGE THIS EL!!
                el: self.$el.find('.mz-b2b-wishlists-product-picker'),
                model: self.model.get('quote'),
                messagesEl: self.$el.find('.mz-b2b-wishlists-product-picker').parent().find('[data-mz-message-bar]')
            });

            this._detailQuote = detailQuoteView;

            $(document).ready(function () {
                if (!self.model.get('isDetailMode')) {
                    var collection = new MozuGridCollectionModel();

                    var quotesGrid = new QuotesMozuGrid({
                        el: $('.mz-b2b-quotes-grid'),
                        model: collection
                    });

                    self._quotesGridView = quotesGrid;
                    quotesGrid.render();
                    return;
                } else {
                    detailQuoteView.render();
                }
            });
        }
    });

    var DetailQuoteView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/quote-detail',
        initialize: function() {
            var self = this;
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
            this.originalData = this.model.toJSON() || {};
        },
        submitOrder: function () {
            console.log("submit order");
        },
        closeQuoteDetail: function () {
          console.log("close quote");
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            var quoteListView = new QuoteListView({
                el: self.$el.find('.mz-b2b-quote-list'),
                model: self.model
            });
            quoteListView.render();
        }
    });

    var QuoteListView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/quote-list'
    });

    var MozuGridCollectionModel = MozuGridCollection.extend({
      //TODO: change to quotes mozutype when data is available
        mozuType: 'wishlists',
        filter: ALL_LISTS_FILTER,
        columns: [
            {
                index: 'name',
                displayName: 'Quote Name',
                sortable: true
            },
            {
                index: 'auditInfo',
                displayName: 'Last Modified',
                displayTemplate: function (auditInfo) {
                    if (auditInfo) {
                        var date = new Date(auditInfo.createDate);
                        return date.toLocaleDateString();
                    }
                }
            },
            {
                index: 'userFullName',
                displayName: 'Created By',
                displayTemplate: function(value){
                    return (value || '');
                }
            },
            {
                index: 'status',
                displayName: 'Status'
            },
            {
               index: 'price',
               displayName: 'Price'
            }
        ],
        defaultSort: 'updateDate desc',
        rowActions: [
            {
                displayName: 'View',
                action: 'viewQuote'
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: QuoteModel
            })
        },
        viewQuote: function (e, row) {
            window.views.currentPane.model.setQuote(row);
            window.views.currentPane.model.setDetailMode(true);
            window.views.currentPane.render();
        }
    });

    return {
        'QuotesModel': QuotesModel,
        'QuoteModel': QuoteModel,
        'QuotesView': QuotesView
    };
});
