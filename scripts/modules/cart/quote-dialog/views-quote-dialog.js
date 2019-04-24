define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore', 'hyprlivecontext', 'modules/views-modal-dialog', 'modules/api', 'modules/models-quote', 'modules/views-location', 'modules/models-location', 'modules/models-discount', "modules/views-productimages", "modules/dropdown"], function (Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, Api, QuoteModels, LocationViews, LocationModels, Discount, ProductImageViews, Dropdown) {

  var QuoteEditModel = Backbone.MozuModel.extend({
      relations: {
          quote: QuoteModels.Quote
      },
      defaults: {
          b2bAccountId: require.mozuData('user').accountId
      },
      saveQuote: function(){
          var quote = this.get('quote');
          window.console.log('save quote');

          // return quote.apiCreate().then(function(response){
          // });
      },
      setQuote: function(quote){
          this.get('quote').clear();
          this.set('quote', quote);
      },
      getBehaviorIds: function () {
          return require.mozuData('user').behaviors || [];
      }
  });

  var QuoteEditForm = Backbone.MozuView.extend({
      templateName: "modules/cart/quote-modal/quote-form",
      // defaults: {
      //     'user.isActive': true,
      //     'user.roleId': "3"
      // },
      autoUpdate: [
          'user.firstName',
          'user.lastName',
          'user.emailAddress',
          'user.isActive'
      ],
      chooseUserRole: function(e){
          var roleId = $(e.currentTarget).prop('value');
          this.model.get('user').set('roleId', roleId);
      }
  });

  var QuoteModalView = ModalDialogView.extend({
      templateName: "modules/cart/quote-modal/quote-modal",
      handleDialogOpen: function () {
          this.model.trigger('dialogOpen');
          this.bootstrapInstance.show();
      },
      handleDialogCancel: function () {
          var self = this;
          this.bootstrapInstance.hide();
      },
      handleDialogSave: function () {
          var self = this;
          if (self._quoteForm ) {
              self._quoteForm.model.saveQuote();
          }
          this.bootstrapInstance.hide();
      },
      setInit: function () {
          var self = this;
          self.loadQuoteFormView(self.model);
          self.handleDialogOpen();
      },
      loadQuoteFormView: function (quote) {
          var self = this;
          quote = quote || new QuoteModels.Quote({});
          var quoteForm = new QuoteEditForm({
              el: self.$el.find('.mz-quote-modal-content'),
              model: new QuoteEditModel({
                  quote: quote
              })
          });
          self._quoteForm = quoteForm;
          quoteForm.render();
      },
      render: function () {
          var self = this;
          self.setInit();
      }
  });



  return QuoteModalView;
});
