define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/mozu-grid/mozugrid-view', 'modules/mozu-grid/mozugrid-pagedCollection', "modules/views-paging", 'modules/editable-view', 'modules/models-customer'], function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, EditableView, CustomerModels) {
  var PaymentMethodsView = EditableView.extend({
      templateName: "modules/b2b-account/payment-information/payment-information",
      autoUpdate: [
          'editingCard.isDefaultPayMethod',
          'editingCard.paymentOrCardType',
          'editingCard.nameOnCard',
          'editingCard.cardNumberPartOrMask',
          'editingCard.expireMonth',
          'editingCard.expireYear',
          'editingCard.cvv',
          'editingCard.isCvvOptional',
          'editingCard.contactId',
          'editingContact.firstName',
          'editingContact.lastNameOrSurname',
          'editingContact.address.address1',
          'editingContact.address.address2',
          'editingContact.address.address3',
          'editingContact.address.cityOrTown',
          'editingContact.address.countryCode',
          'editingContact.address.stateOrProvince',
          'editingContact.address.postalOrZipCode',
          'editingContact.address.addressType',
          'editingContact.phoneNumbers.home',
          'editingContact.isBillingContact',
          'editingContact.isPrimaryBillingContact',
          'editingContact.isShippingContact',
          'editingContact.isPrimaryShippingContact'
      ],
      renderOnChange: [
          'editingCard.isDefaultPayMethod',
          'editingCard.contactId',
          'editingContact.address.countryCode'
      ],
      beginEditCard: function(e) {
          var self = this;
          this.model.apiGet().then(function(){
              var id = self.editing.card = e.currentTarget.getAttribute('data-mz-card');
              self.model.beginEditCard(id);
              self.render();
          });
      },
      finishEditCard: function() {
          var self = this;
          var operation = this.doModelAction('saveCard');
          if (operation) {
              operation.otherwise(function() {
                  self.editing.card = true;
              });
              this.editing.card = false;
          }
      },
      cancelEditCard: function() {
          this.editing.card = false;
          this.model.endEditCard();
          this.render();
      },
      beginDeleteCard: function(e) {
          var self = this,
              id = e.currentTarget.getAttribute('data-mz-card'),
              card = this.model.get('cards').get(id);
          if (window.confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
              this.doModelAction('deleteCard', id);
          }
      },
      render: function(){
          Backbone.MozuView.prototype.render.apply(this, arguments);
          var self = this;
          $(document).ready(function () {
              var collection = new TransactionGridCollectionModel({id: self.model.get('id')});
              var transactionsGrid = new MozuGrid({
                  el: $('.mz-b2b-transactions-grid'),
                  model: collection
              });
              transactionsGrid.render();
              return;
          });
      }
  });

  var PaymentMethodsModel = CustomerModels.EditableCustomer.extend({
      helpers: ['isLimited', 'blockCreditLimit', 'blockViewPurchaseOrders'],
      requiredBehaviors: [ 1003 ],
      isLimited: function(){
          return !this.hasRequiredBehavior();
      },
      blockCreditLimit: function(){
          return !this.hasRequiredBehavior(1007);
      },
      blockViewPurchaseOrders: function(){
          return !this.hasRequiredBehavior(1006);
      }
  });

  var TransactionGridCollectionModel = MozuGridCollection.extend({
      mozuType: 'customer',
      apiGridRead: function(){
          return this.apiGetPurchaseOrderTransactions();
      },
      requiredBehaviors: [ 1006 ],
      requireBehaviorsToRender: true,
      columns: [
          {
              index: 'transactionDate',
              displayName: 'Date',
              sortable: true,
              displayTemplate: function(value){
                  var date = new Date(value);
                  return date.toLocaleDateString();
              }
          },
          // {
          //     index: 'orderNumber',
          //     displayName: 'Order Number',
          //     sortable: true,
          //     displayTemplate: function(value){
          //         return (value === undefined || value.length < 1) ? value : 'N/A';
          //     }
          // },
          {
              index: 'transactionTypeId',
              displayName: 'Order Type',
              sortable: false
          },
          {
              index: 'purchaseOrderNumber',
              displayName: 'PO #',
              sortable: false
          },
          {
              index: 'author',
              displayName: 'Author',
              sortable: false
          },
          {
              index: 'transactionDescription',
              displayName: 'Transaction Details',
              sortable: false
          },
          {
              index: 'transactionAmount',
              displayName: 'Amount',
              sortable: true
          }
      ],
      relations: {
          items: Backbone.Collection.extend({})
      }
  });

  return {
    'PaymentInformationView': PaymentMethodsView,
    'PaymentInformationModel': PaymentMethodsModel
  };
});
