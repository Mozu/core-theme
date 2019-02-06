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

    var QuickOrderView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quick-order/quick-order',
        autoUpdate: [ 'pickerItemQuantity' ],
        additionalEvents: {
            "change [data-mz-value='quantity']": "onQuantityChange"
        },
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
        addItemToOrder: function(event){
          var self = this;
          var product = self.model.get('selectedProduct');

          if (product.options) {
            if (!(product instanceof ProductModels.Product)) {
                if (product.toJSON)
                    product = product.toJSON();
                product = new ProductModels.Product(product);
              }

              this.stopListening();
              this.listenTo(product, "configurationComplete", function (){
                  self.finalizeAddItemToOrder(product);
                  window.quickOrderModalView.handleDialogClose();
                  self.render();
              });
              window.quickOrderModalView.loadAddProductView(product);
              window.quickOrderModalView.handleDialogOpen();
              return;
          }
          self.finalizeAddItemToOrder(product);
          self.render();
        },
        finalizeAddItemToOrder: function(product, quantity){
          var self = this;
          if (product.toJSON)
              product = product.toJSON();

          this.model.addItemToOrder(product, self.model.get('pickerItemQuantity'));
          self.model.unset('selectedProduct');
          $('.mz-b2b-quickorder .mz-searchbox-input.tt-input').val('');
          $('.mz-b2b-quickorder #pickerItemQuantity').val(1);
        },
        removeItem: function(e){
          var self = this;
          var index = $(e.currentTarget).data('mz-index') - 1;
          self.model.removeItemFromOrder(index);
          self.render();
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                index = $qField.data('mz-index') - 1,
                item = this.model.get("items").at(index);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                this.model.updateItemTotal(item);
                this.render();
            }
        },400),
        addAllItemsToCart: function(){
          var self = this;
          var cart = CartModels.Cart.fromCurrent();
          var items = this.model.get('items').toJSON();
          var products = [];

          _.each(items, function(item) {
              var isItemDigital = _.contains(item.product.fulfillmentTypesSupported, "Digital");

              products.push({
                  quantity : item.quantity,
                  data: item.data,
                  fulfillmentMethod : (!isItemDigital ? "Ship" : "Digital"),
                  product: {
                      productCode : item.product.productCode,
                      variationProductCode : item.product.variationProductCode,
                      bundledProducts : item.product.bundledProducts,
                      options : item.product.options || []
                  }
              });
          });
              this.$el.addClass('is-loading');
              cart.apiModel.addBulkProducts({ postdata: products, throwErrorOnInvalidItems: true}).then(function(response){
                  window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/cart";
              }, function (error) {
                  if (error.items) {
                      self.handleError(error);
                      self.$el.removeClass('is-loading');
                      self.render();
                  }
          });
        },
        handleError: function(error){
          var self = this;
          self.clearErrors();
          _.each(error.items, function(error){
              var errorProp = _.find(error.additionalErrorData, function(errorData){
                  return errorData.name === "Property";
              });
              var erroredItem = self.model.get('items').find(function(modelItem){
                  return modelItem.get('productCode') == errorProp.value;
              });
              if (!erroredItem.get('errorMessages')){
                  erroredItem.set('errorMessages', []);
              }
              erroredItem.get('errorMessages').push(error.message);
          });
        },
        clearErrors: function(){
            var self = this;
            self.model.get('items').forEach(function(item){
                  if (item.get('errorMessages')){
                      item.set('errorMessages', []);
                  }
            });
        },
        clearOrder: function(){
            this.model.set('items', new Backbone.Collection([]));
            this.render();
        },
        saveQuickOrderAsList: function(){
            var self = this;
            var wishlist = new WishlistModels.WishlistModel({});
            this.$el.addClass('is-loading');
            wishlist.addWishlistItems(this.model.get('items')).then(function(res){
                var paneSwitcherModel = window.views.paneSwitcherView.model;
                var listPane = paneSwitcherModel.get('panes').find(function(pane){
                    return pane.name == 'Lists';
                });
                listPane.view.model.setWishlist(wishlist);
                listPane.view.model.setEditMode(true);
                listPane.view.model.set('editingNew', true);
                window.views.paneSwitcherView.model.setPane('Lists');
                self.$el.removeClass('is-loading');
            });
        }
    });

    var QuickOrderModel = Backbone.MozuModel.extend({
      defaults: {
          'pickerItemQuantity': 1
      },
      relations: {
          items: Backbone.Collection.extend({
              model: Backbone.MozuModel
          })
      },
      addItemToOrder: function(product, quantity){
        var self = this;
        //First we check if this product has already been added.
          var alreadyInOrder = this.get('items').find(function(item){
              return item.get('product').productCode === product.productCode;
          });

          if (alreadyInOrder){
              var sameOptionsConfig = self.compareProductOptions(alreadyInOrder.get('product'), product);
              if (!sameOptionsConfig){
                alreadyInOrder = false;
              }
          }

          if (!alreadyInOrder){
              var price = product.price.price;
              var salePrice = product.price.salePrice;
              var subtotal = quantity * price;
              var discountedTotal = salePrice ? (quantity * salePrice) : false;

              // Set some values for ease in rendering in grid
              product.name = product.content.productName;
              if (product.content.productImages.length){
                  product.imageUrl = product.content.productImages[0].imageUrl;
              }
              if (product.options){
                product.options.forEach(function(option){
                    option.name = option.attributeDetail.name;
                });
              }
              this.get('items').push({
                product: product,
                productCode: product.productCode,
                quantity: quantity,
                price: price,
                salePrice: salePrice,
                discountedTotal: discountedTotal,
                subtotal: subtotal
              });
          } else {
              // Simply increase the quantity of the product in question.
              var newQuantity = Number(alreadyInOrder.get('quantity')) + Number(quantity);
              alreadyInOrder.set('quantity', newQuantity);
              self.updateItemTotal(alreadyInOrder);
          }
      },
      compareProductOptions: function(product1, product2){
          // If the two options lists are identical, it's likely because they're both undefined.
          if (product1.options === product2.options) return true;
          // Now we'll check and see if one has options while the other doesn't.
          if ((product1.options && !product2.options) || (!product1.options && product2.options)){
              return false;
          }
          // We can skip a lot of extra work if the lengths aren't even the same.
          if (product1.options.length !== product2.options.length) return false;

          // We'll reduce the options to just their attributeFQNs and values, and then make a sorted comparison.
          var options1 = [],
              options2 = [];
          product1.options.forEach(function(option){
              options1.push({attributeFQN: option.attributeFQN, value: option.value});
          });
          product2.options.forEach(function(option){
              options2.push({attributeFQN: option.attributeFQN, value: option.value});
          });
          options1 = options1.sort();
          options2 = options2.sort();

          for (var i = 0; i<options1.length; i++){
              if (options1[i] !== options2[i]) return false;
          }
          return true;
      },
      removeItemFromOrder: function(index){
          var items = this.get('items');
          this.set('items', items.remove(items.at(index)));
      },
      updateItemTotal: function(item){
          item.set('subtotal', (item.get('quantity') * item.get('price')));
          if (item.get('discountedPrice')){
              item.set('discountedTotal', (item.get('quantity') * item.get('salePrice')));
          } else {
              item.set('discountedTotal', false);
          }
      }
    });

    return {
        'QuickOrderView': QuickOrderView,
        'QuickOrderModel': QuickOrderModel
    };
});
