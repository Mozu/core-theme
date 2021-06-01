define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'modules/models-cart',
        'modules/cart-monitor',
        'hyprlivecontext',
        'hyprlive',
        'modules/preserve-element-through-render',
        'modules/modal-dialog',
        'modules/xpress-paypal',
        'modules/models-location',
        'modules/amazonPay',
        'modules/applepay',
        'modules/mozu-utilities',
        'modules/message-handler'
], function (api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, modalDialog, paypal, LocationModels, AmazonPay, ApplePay, MozuUtilities, MessageHandler) {

    var ThresholdMessageView = Backbone.MozuView.extend({
      templateName: 'modules/cart/cart-discount-threshold-messages'
    });

    var BackorderMessageView = Backbone.MozuView.extend({
        templateName: 'modules/cart/cart-backorder-messages'
    });

    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        initialize: function () {
            this.pickerDialog = this.initializeStorePickerDialog();

            var me = this;

            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });

            if(!AmazonPay.isEnabled) {
              AmazonPay.init(true);
          }
            this.listenTo(this.model.get('items'), 'quantityupdatefailed', this.onQuantityUpdateFailed, this);

            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var pageContext = require.mozuData('pagecontext');
            if (visaCheckoutSettings.isEnabled) {
                window.onVisaCheckoutReady = initVisaCheckout;
                require([pageContext.visaCheckoutJavaScriptSdkUrl], initVisaCheckout);
            }

            me.messageView = new ThresholdMessageView({
              el: $('#mz-discount-threshold-messages'),
              model: this.model
            });            
            me.backorderMessageView = new BackorderMessageView({
                el: $('#mz-backorder-messages'),
                model: this.model
            });
            
            //var prouctDiscounts = me.model.get('items').each(function(item){
            //    _.each(item.productDiscounts, function(prodDiscount){
            //       var discount = new Discount(prodDiscount);
            //       discount.getDiscountDetails().then(function(){

            //       })
            //    })
            //})
        },
        render: function() {
            preserveElement(this, ['.v-button', '.p-button', '#AmazonPayButton', '#applePayButton'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
            
            //Hide the InitiateQuote for B2C user and Display for all B2B users.
            var userBehaviors = require.mozuData('user').behaviors || [];
            var isB2BUser = !userBehaviors.includes(MozuUtilities.Behaviors.User_Has_Full_Access_To_Their_Account);
            this.model.set("isB2BUser", isB2BUser);
            // normally we preserveElement on the apple pay button, but we hide it if a change to the cart 
            // has lead the total price to be $0. Apple doesn't like $0 orders
            if (ApplePay && ApplePay.scriptLoaded) ApplePay.hideOrShowButton();
            // this.messageView.render();
        },
        updateQuantity: _.debounce(function (e) {
            var me = this;

            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                
                if (item.hasChanged("quantity")) {
                    var assemblyServiceItem;
                    if (item.hasAssemblyOptions()) {
                        assemblyServiceItem = me.model.get("items").find(function (cartItem) {
                            return cartItem.get("parentItemId") == item.id;
                        });
                    }

                    item.apiModel.updateQuantity(newQuantity)
                        .then(function() {
                            // if item has Assembly options then update qty of assembly service item too
                            if (assemblyServiceItem) {
                                return assemblyServiceItem.apiModel.updateQuantity(newQuantity);
                            }
                        }).then(function() {
                            me.model.fetch();
                        });
                }
            }
        },400),

  
        onQuantityUpdateFailed: function(model, oldQuantity) {
            var field = this.$('[data-mz-cart-item=' + model.get('id') + ']');
            if (field) {
                field.val(oldQuantity);
            }
            else {
                this.render();
            }
        },
        removeItem: _.debounce(function (e) {
            var me = this;
            if(require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
                return false;
            }
            var $removeButton = $(e.currentTarget);
            var id = $removeButton.data('mz-cart-item');

            var item = me.model.get("items").get(id);
            var assemblyServiceItem,
                deliveryServiceItem;
            
            // check if the item has assembly option.
            // If yes then delete assembly service item too
            if (item.hasAssemblyOptions()) {
                assemblyServiceItem = me.model.get("items").find(function (cartItem) {
                    return cartItem.get("parentItemId") == item.id;
                });
                me.model.get("items").models = me.model.get("items").filter(function(cartItem) {
                    return cartItem.id != assemblyServiceItem.id;
                });

            }

            // check if it is the only item in cart with delivery
            // If yes then delete service item too
            var otherItemsHaveDelivery = me.model.get("items").find(function (cartItem) {
                return (cartItem.get("fulfillmentMethod") == "Delivery" && cartItem.get("product").get("goodsType") == "Physical" && cartItem.id != item.id);
            });
            if (item.get("fulfillmentMethod") == "Delivery" && !otherItemsHaveDelivery) {
                deliveryServiceItem = me.model.get("items").find(function (item) {
                    return item.get("product").id == "dsp_01";
                });
                me.model.get("items").models = me.model.get("items").filter(function(cartItem) {
                    return cartItem.id != deliveryServiceItem.id;
                });
            }

            // remove parent product
            me.model.get("items").models = me.model.get("items").filter(function(cartItem) {
                return cartItem.id != item.id;
            });

            me.model.apiUpdate().then(function() {});

            _.delay(function () {
                me.backorderMessageView.render();
            }, 5000);
            
            return false;
        },0),
        updateAutoAddItem: function(e) {
            var self = this;
            var $target = $(e.currentTarget);
            var discountId = $target.data('mz-discount-id');
            var itemId = $target.data('mz-cart-item');

            window.cartView.discountModalView.updateSelectedAutoAddItem(itemId, discountId);
        },
        empty: function() {
            this.model.apiDel().then(function() {
                window.location.reload();
            });
        },
        initializeStorePickerDialog: function(){

          var me = this;

          var options = {
            elementId: "mz-location-selector",
            body: "", //to be populated by makeLocationPickerBody
            hasXButton: true,
            width: "400px",
            scroll: true,
            bodyHeight: "600px",
            backdrop: "static"
          };

          //Assures that each store select button has the right behavior
          $('#mz-location-selector').on('click', '.mz-store-select-button', function(){
            me.assignPickupLocation($(this).attr('mz-store-select-data'));
          });

          //Assures that the radio buttons reflect the accurate fulfillment method
          //if the dialog is closed before a store is picked.
          $('.modal-header').on('click', '.close', function(){
            me.render();
          });

          return modalDialog.init(options);

        },
        changeStore: _.debounce(function(e){
          //click handler for change store link.launches store picker
          var cartItemId = $(e.currentTarget).data('mz-cart-item');
          var cartItem = this.model.get("items").get(cartItemId);
          var fulfillmentMethod = cartItem.get('fulfillmentMethod');
          var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
          if(fulfillmentMethod == 'Delivery'){
            this.pickDelivery(productCode, cartItemId);
          }else{
            this.pickStore(productCode, cartItemId);
          }
        },0),
        pickStore: function(productCode, cartItemId){
          var me = this;
          var locationsCollection = new LocationModels.LocationCollection();

          locationsCollection.apiGetForProduct({productCode: productCode}).then(function(collection){
            locationsCollection.get('items').forEach(function(item){
              me.model.get('storeLocationsCache').addLocation({code: item.get('code'), name: item.get('name')});
            });
            var $bodyElement = $('#mz-location-selector').find('.modal-body');
            $bodyElement.attr('mz-cart-item', cartItemId);
            if (collection.length === 0){
              me.pickerDialog.setBody(Hypr.getLabel("noNearbyLocationsProd"));
            } else {
              me.pickerDialog.setBody(me.makeLocationPickerBody(locationsCollection, cartItemId));
            }
            me.pickerDialog.show();

          }, function(error){
            MessageHandler.saveMessage('LocationTypes', 'Error', error.message);
            MessageHandler.showMessage('LocationTypes');
          });

        },
        pickDelivery: function(productCode, cartItemId){
          var me = this;
          var locationsCollection = new LocationModels.LocationCollection();
          
          locationsCollection.apiGetForProduct({productCode: productCode,fulfillmentMethod: 'Delivery'}).then(function(collection){
            locationsCollection.get('items').forEach(function(item){
              me.model.get('storeLocationsCache').addLocation({code: item.get('code'), name: item.get('name')});
            });

            var $bodyElement = $('#mz-location-selector').find('.modal-body');
            $bodyElement.attr('mz-cart-item', cartItemId);
            if (collection.length === 0){
              me.pickerDialog.setBody(Hypr.getLabel("noNearbyLocationsProd"));
            } else {
              me.pickerDialog.setBody(me.makeLocationPickerBody(locationsCollection, cartItemId));
            }
            me.pickerDialog.show();

          }, function(error){
            MessageHandler.saveMessage('LocationTypes', 'Error', error.message);
            MessageHandler.showMessage('LocationTypes');
          });

        },
        getInventoryData: _.debounce(function(id, productCode){
          //Gets basic inventory data based on product code.
          return window.cartView.cartView.model.get('items').get(id).get('product').apiGetInventory({
            productCode: productCode
          });
        },0),

        changeFulfillmentMethod: _.debounce(function (e) {
          //Called when a radio button is clicked.

          var me = this;
          var $radioButton = $(e.currentTarget),
              cartItemId = $radioButton.data('mz-cart-item'),
              value = $radioButton.val(),
              cartItem = this.model.get("items").get(cartItemId);

              if (cartItem.get('fulfillmentMethod')==value){
                //The user clicked the radio button for the fulfillment type that
                //was already selected so we can just quit.
                return 0;
              }

              // if changing ffmt method from Delivery to STH remove delivery service item from cart if no other item has delivery on them
              // Also set assembly option to false and remove assembly service item
              var deliveryServiceItem;
              if (cartItem.get('fulfillmentMethod') == "Delivery") {
                  deliveryServiceItem = me.model.get("items").find(function (item) {
                      return item.get("product").id == "dsp_01";
                  });
              }

              var assemblyServiceItem;
              assemblyServiceItem = me.model.get("items").find(function (item) {
                  return item.get("parentItemId") == cartItem.id;
              });

              var otherItemsHaveDelivery = me.model.get("items").find(function(item) {
                return (item.get("fulfillmentMethod") == "Delivery" && item.apiModel.data.product.goodsType == "Physical" && item.id != cartItem.id);
              });

              if (value=="Ship"){
                var oldFulfillmentMethod = cartItem.get('fulfillmentMethod');
                var oldPickupLocation = cartItem.get('fulfillmentLocationName');
                var oldLocationCode = cartItem.get('fulfillmentLocationCode');

                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');

                cartItem.apiUpdate().then(function(){

                  if (cartItem.hasAssemblyOptions() && assemblyServiceItem) {
                    cartItem.get('product').get('options').models = 
                    cartItem.get('product').get('options').models.filter(function(opt) {
                      return opt.get('name') != "Assembly";
                    });
                    me.model.get("items").models = me.model.get("items").filter(function(item) {
                      return item.id != assemblyServiceItem.id;
                    });
                  }
  
                  if (oldFulfillmentMethod == "Delivery" && !otherItemsHaveDelivery) {
                    me.model.get("items").models = me.model.get("items").filter(function(item) {
                      return item.id != deliveryServiceItem.id;
                    });
                  } 
                  me.model.apiUpdate().then(function(success) {});

                }, function (error) {
                  cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
                  cartItem.set('fulfillmentLocationName', oldPickupLocation);
                  cartItem.set('fulfillmentLocationCode', oldLocationCode);
                });
              } else if (value == 'Pickup') {
                //first we get the correct product code for this item.
                //If the product is a variation, we want to pass that when searching for inventory.
                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');
                var pickupProductCode =
                  cartItem.apiModel.data.product.variationProductCode ||
                  cartItem.apiModel.data.product.productCode;
                //pickStore function makes api calls, then builds/launches modal dialog
                this.pickStore(pickupProductCode, cartItemId);
              } else if (value == 'Delivery') {
                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');
                var deliveryProductCode =
                  cartItem.apiModel.data.product.variationProductCode ||
                  cartItem.apiModel.data.product.productCode;
                this.pickDelivery(deliveryProductCode, cartItemId);
              }

        },0),
        makeLocationPickerBody: function(locationsCollection, cartItemId){
          /*
          Uses a list of locations to build HTML to to stick into the location
          picker dialog.
          locationsCollection should be a be a list of locations that includes
          a 'quanity' attribute for the cart item's stock level.
          */

          var locations = locationsCollection.toJSON();
          var body = "";

          locations.items.forEach(function(location){
            var stockLevel = location.quantity;

            //Piece together UI for a single location listing
            var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex", "data-mz-cart-item": cartItemId });
            var leftSideDiv = $('<div>', {"style": "flex:1"});
            var rightSideDiv = $('<div>', {"style": "flex:1"});
            leftSideDiv.append('<h4 style="margin: 6.25px 0 6.25px">'+location.name+'</h4>');
            /*
            The behavior of this dialog currently reflects the functionality of
            locations.hypr.live. It should be noted that we currently do not
            allow backorder on in-store pickup items, even if the product and
            location allow for it. Both that page and this dialog will need to be
            modified if this changes.
            */

            var address = location.address;

            leftSideDiv.append($('<div>'+address.address1+'</div>'));
            if(address.address2){leftSideDiv.append($('<div>'+address.address2+'</div>'));}
            if(address.address3){leftSideDiv.append($('<div>'+address.address3+'</div>'));}
            if(address.address4){leftSideDiv.append($('<div>'+address.address4+'</div>'));}
            leftSideDiv.append($('<div>'+address.cityOrTown+', '+address.stateOrProvince+' '+address.postalOrZipCode+'</div>'));
              var $selectButton;

              if (stockLevel>0){
                  leftSideDiv.append("<p class='mz-locationselect-available'>"+Hypr.getLabel("availableNow")+"</p>");
                  var buttonData = {
                    locationCode: location.code,
                    locationName: location.name,
                    cartItemId: cartItemId
                  };

                  $selectButton = $("<button>", {"type": "button", "class": "mz-button mz-store-select-button", "style": "margin:25% 0 0 25%", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
                  $selectButton.text(Hypr.getLabel("selectStore"));
                  rightSideDiv.append($selectButton);

                } else {
                  leftSideDiv.append("<p class='mz-locationselect-unavailable'>"+Hypr.getLabel("outOfStock")+"</p>");
                  $selectButton = $("<button>", {"type": "button", "class": "mz-button is-disabled mz-store-select-button", "aria-hidden": "true", "disabled":"disabled", "style": "margin:25% 0 0 25%"});
                  $selectButton.text(Hypr.getLabel("selectStore"));
                  rightSideDiv.append($selectButton);
                }

                locationSelectDiv.append(leftSideDiv);
                locationSelectDiv.append(rightSideDiv);
                body+=locationSelectDiv.prop('outerHTML');

          });

          return body;
        },
        assignPickupLocation: _.debounce(function(jsonStoreSelectData){
          //called by Select Store button from store picker dialog.
          //Makes the actual change to the item using data held by the button
          //in the store picker.

          var me = this;
          this.pickerDialog.hide();

          var storeSelectData = JSON.parse(jsonStoreSelectData);
          var cartItem = this.model.get("items").get(storeSelectData.cartItemId);
          //in case there is an error with the api call, we want to get all of the
          //current data for the cartItem before we change it so that we can
          //change it back if we need to.
          var oldFulfillmentMethod = cartItem.get('fulfillmentMethod');
          var oldPickupLocation = cartItem.get('fulfillmentLocationName');
          var oldLocationCode = cartItem.get('fulfillmentLocationCode');

          cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
          cartItem.set('fulfillmentLocationName', storeSelectData.locationName);
          cartItem.set('fulfillmentLocationCode', storeSelectData.locationCode);
          cartItem.apiUpdate().then(function(success){

              var assemblyServiceItem = me.model.get("items").find(function (item) {
                  return item.get("parentItemId") == cartItem.id;
              });
              var oldDeliveryServiceItem = me.model.get("items").find(function (item) {
                  return item.get("product").id == "dsp_01";
              });

              // If changing ffmt from Delivery to Pickup remove delivery service item from cart if no other item has delivery on them
              // Also update ffmt method of assembly service item if present
              if (cartItem.apiModel.data.product.goodsType == "Physical" && cartItem.get('fulfillmentMethod') == "Pickup") {

                var otherItemsHaveDelivery = me.model.get("items").find(function(item) {
                  return (item.get("fulfillmentMethod") == "Delivery" && item.apiModel.data.product.goodsType == "Physical");
                });

                if (!otherItemsHaveDelivery) {
                  me.model.removeItem(oldDeliveryServiceItem.id)
                    .then(function() {
                      if (cartItem.hasAssemblyOptions() && assemblyServiceItem) {
                        assemblyServiceItem.set('fulfillmentMethod', oldFulfillmentMethod);
                        return assemblyServiceItem.apiUpdate();
                      }
                    })
                    .then(function() {
                      me.model.fetch();
                    });
                } else {
                  if (cartItem.hasAssemblyOptions() && assemblyServiceItem) {
                    assemblyServiceItem.set('fulfillmentMethod', oldFulfillmentMethod);
                    assemblyServiceItem.apiUpdate()
                    .then(function() {
                      me.model.fetch();
                    });
                  }
                }
              }

              // If changing ffmt to Delivery add delivery service item to cart.
              // Since Delivery service item will be addded at order level, we should not add multiple delivery service items.
              // Hence check before adding if already present.
              // Also update ffmt method of assembly service item if present
            if (cartItem.apiModel.data.product.goodsType == "Physical" && cartItem.get('fulfillmentMethod') == "Delivery") {
              if (oldDeliveryServiceItem) {
                if (cartItem.hasAssemblyOptions() && assemblyServiceItem) {
                  assemblyServiceItem.set('fulfillmentMethod', "Delivery");
                  assemblyServiceItem.apiUpdate()
                    .then(function () {
                      me.model.fetch();
                    });
                }
              } else {
                var newDeliveryServiceItem = new CartModels.CartItemProduct({ productCode: "dsp_01" });
                newDeliveryServiceItem.apiAddToCart({
                  fulfillmentMethod: "Delivery",
                  quantity: 1
                })
                  .then(function () {
                    if (cartItem.hasAssemblyOptions() && assemblyServiceItem) {
                      assemblyServiceItem.set('fulfillmentMethod', "Delivery");
                      return assemblyServiceItem.apiUpdate();
                    }
                  })
                  .then(function () {
                    me.model.fetch();
                  });
                }
              }
          }, function(error){
            cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
            cartItem.set('fulfillmentLocationName', oldPickupLocation);
            cartItem.set('fulfillmentLocationCode', oldLocationCode);
            me.render();
          });

        },0),
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        proceedToInitiateQuote: _.debounce(function() {

         var quoteCreationFromCart = {};
         quoteCreationFromCart.cartId = this.model.get('id');
         quoteCreationFromCart.updatemode = 'ApplyToDraft';
           return this.model.apiModel.createQuoteFromCart(quoteCreationFromCart).then(function (res) {
               window.location = "/myaccount/quote/" + res.data.id + "/edit";
           }, function (error) {
               this.showMessageBar(error);
           });
      },0),
        addCoupon: function () {
            var self = this;
            this.model.addCoupon().ensure(function () {
                self.model.unset('couponCode');
                self.render();
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        },
        showMessageBar: function(error) {
          var self = this;
          self.model.set("error", error);
          self.model.syncApiModel();
          self.render();
          }
    });
    /* begin visa checkout */
    function initVisaCheckout () {
      var self =this;
      if (!window.V) {
          //window.console.warn( 'visa checkout has not been initilized properly');
          return false;
      }

      // on success, attach the encoded payment data to the window
      // then turn the cart into an order and advance to checkout
      window.V.on("payment.success", function(payment) {
          // payment here is an object, not a string. we'll stringify it later
          var $form = $('#cartform');

          _.each({
              
              digitalWalletData: JSON.stringify(payment),
              digitalWalletType: "VisaCheckout",
              id: window.cartId

          }, function(value, key) {

              $form.append($('<input />', {
                  type: 'hidden',
                  name: key,
                  value: value
              }));

          });

          $form.submit();

      });
    }

    return CartView;
});
