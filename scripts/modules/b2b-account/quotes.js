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
  "modules/backbone-pane-switcher",
  "modules/mozu-utilities",
  "modules/message-handler",
  "modules/models-dialog",
  "modules/views-modal-dialog"
], function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, ProductModels, QuoteModels, SearchAutoComplete, PaneSwitcher, MozuUtilities, MessageHandler, DialogModels, ModalDialogView) {
    var ALL_QUOTES_FILTER = "Status ne Cancelled";
    var USER_QUOTES_FILTER = ALL_QUOTES_FILTER + " and userId eq " + require.mozuData('user').userId;
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

    var ConfirmationModel = DialogModels.extend({});
    var ConfirmationDialogView = ModalDialogView.extend({
        templateName: "modules/b2b-account/quotes/confirmation-dialog",
        handleDialogOpen: function (message) {
            this.$el.find('.mz-confirmation-body').text(message);
            this.bootstrapInstance.setOptions({width: "300px", hasXButton: false});
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
        handleDialogCancel: function () {
            var self = this;
            this.bootstrapInstance.hide();
        },
        handleDialogSave: function () {
            var self = this;
            this.bootstrapInstance.hide();
            var quoteView = window.views.currentPane;
            var quote = quoteView.model.get('quote');
            quote.set('status', 'Cancelled');
            quoteView.$el.addClass('is-loading');
            quote.apiUpdate().then(function(response){
                quoteView.model.setDetailMode(false);
                quoteView.$el.removeClass('is-loading');
                quoteView.render();

            });
        },
        setInit: function () {
            var self = this;
            self.handleDialogOpen();
        },
        render: function () {
            var self = this;
            self.setInit();
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
              if (userInQuestion){
                quote.set('userFullName', userInQuestion.firstName+' '+userInQuestion.lastName);
              } else {
                quote.set('userFullName', "N/A");
              }
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
        closeQuoteDetail: function(){
          this.model.setDetailMode(false);
          window.views.currentPane.render();
        },
        cancelQuote: function(){
          window.confDialogView.handleDialogOpen("Are you sure you want to cancel this quote request?");
        },
        toggleViewAllQuotes: function (e) {
          this._quotesGridView.model.setPage(1);
            if (e.currentTarget.checked){
              this.model.set('viewingAllQuotes', true);
              this._quotesGridView.model.filterBy(ALL_QUOTES_FILTER);
            } else {
              this.model.set('viewingAllQuotes', false);
              this._quotesGridView.model.filterBy(USER_QUOTES_FILTER);
            }
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            if (this._detailQuote) {
                this._detailQuote.stopListening();
            }
            var detailQuoteView = new DetailQuoteView({
                model: self.model.get('quote')
            });

            this._detailQuote = detailQuoteView;

            var confDialogView = new ConfirmationDialogView({
                el: self.el.find('.mz-b2baccount-confirmation-modal'),
                model: new ConfirmationModel({})
            });

            window.confDialogView = confDialogView;

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
            window.console.log("submit order");
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
        templateName: 'modules/b2b-account/quotes/quote-table'
    });
    var MozuGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'quotes',
        filter: ALL_QUOTES_FILTER,
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
                displayName: 'Status',
                displayTemplate: function(value){
                      value = value || 'N/A';
                      return '<span class="mz-status ' + value.toLowerCase() + '">' + value + '</span>';
                }
            },
            {
               index: 'total',
               displayName: 'Price',
               displayTemplate: function(total){
                  // TODO: investigate sale price stuff for here?
                    return '$'+total.toFixed(2);
                  }

            }
        ],
        defaultSort: 'updateDate asc',
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
