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
        'modules/cart/discount-dialog/views-discount-dialog',
        'modules/models-discount',
        'modules/message-handler'
], function (api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, modalDialog, paypal, LocationModels, AmazonPay, ApplePay, DiscountModalView, Discount, MessageHandler) {

    var ThresholdMessageView = Backbone.MozuView.extend({
      templateName: 'modules/cart/cart-discount-threshold-messages'
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

            AmazonPay.init(true);
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
            // normally we preserveElement on the apple pay button, but we hide it if a change to the cart
            // has lead the total price to be $0. Apple doesn't like $0 orders
            if (ApplePay && ApplePay.scriptLoaded) ApplePay.hideOrShowButton();
            // this.messageView.render();
        },
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
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
        removeItem: _.debounce(function(e) {
            var self = this;
            if(require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
                return false;
            }
            var $removeButton = $(e.currentTarget);
            var $allRemoveButtons = $('[data-mz-action="login"]');
            var id = $removeButton.data('mz-cart-item');
            this.model.isLoading(true);
            $allRemoveButtons.addClass('is-disabled');
            this.model.removeItem(id).ensure(function(){
                  self.model.isLoading(false);
                  $allRemoveButtons.removeClass('is-disabled');
            });
            return false;
        }, 500),
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
        changeStore: function(e){
          //click handler for change store link.launches store picker
          var cartItemId = $(e.currentTarget).data('mz-cart-item');
          var cartItem = this.model.get("items").get(cartItemId);
          var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
          this.pickStore(productCode, cartItemId);
        },
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
            //error
          });

        },
        getInventoryData: function(id, productCode){
          //Gets basic inventory data based on product code.
          return window.cartView.cartView.model.get('items').get(id).get('product').apiGetInventory({
            productCode: productCode
          });
        },
        changeFulfillmentMethod: function(e){
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

              if (value=="Ship"){
                var oldFulfillmentMethod = cartItem.get('fulfillmentMethod');
                var oldPickupLocation = cartItem.get('fulfillmentLocationName');
                var oldLocationCode = cartItem.get('fulfillmentLocationCode');

                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');

                cartItem.apiUpdate().then(function(success){}, function(error){
                  cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
                  cartItem.set('fulfillmentLocationName', oldPickupLocation);
                  cartItem.set('fulfillmentLocationCode', oldLocationCode);

                });


              } else if (value=="Pickup"){
                  //first we get the correct product code for this item.
                  //If the product is a variation, we want to pass that when searching for inventory.
                  var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
                  //pickStore function makes api calls, then builds/launches modal dialog
                  this.pickStore(productCode, cartItemId);
              }

        },
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
        assignPickupLocation: function(jsonStoreSelectData){
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

          cartItem.set('fulfillmentMethod', 'Pickup');
          cartItem.set('fulfillmentLocationName', storeSelectData.locationName);
          cartItem.set('fulfillmentLocationCode', storeSelectData.locationCode);
          cartItem.apiUpdate().then(function(success){}, function(error){
            cartItem.set('fulfillmentMethod', oldFulfillmentMethod);
            cartItem.set('fulfillmentLocationName', oldPickupLocation);
            cartItem.set('fulfillmentLocationCode', oldLocationCode);
            me.render();
          });

        },
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
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
        }
    });

  function renderVisaCheckout(model) {

    var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
    var apiKey = visaCheckoutSettings.apiKey;
    var clientId = visaCheckoutSettings.clientId;

    //In case for some reason a model is not passed
    if(!model) {
      model = CartModels.Cart.fromCurrent();
    }

    function initVisa(){
      var delay = 200;
      if(window.V) {
          window.V.init({
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                subtotal: "" + model.get('subtotal')
            }});
          return;
        }
        _.delay(initVisa, delay);
    }

    initVisa();

  }
    /* begin visa checkout */
    function initVisaCheckout () {
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
              digitalWalletType: "VisaCheckout"

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
    /* end visa checkout */


    $(document).ready(function() {
        var cartModel = CartModels.Cart.fromCurrent(),
            cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                }),
                discountModalView: new DiscountModalView({
                    el: $("[mz-modal-discount-dialog]"),
                    model: cartModel.get('discountModal'),
                    messagesEl: $("[mz-modal-discount-dialog]").find('[data-mz-message-bar]')
                })

            };

        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + '/checkout/' + order.prop('id');
        });

        cartModel.on('sync', function() {
            CartMonitor.setCount(cartModel.count());
        });

        window.cartView = cartViews;

        CartMonitor.setCount(cartModel.count());

        cartViews.cartView.render();
        //if (cartModel.get('discountModal').get('discounts').length) {
            cartViews.discountModalView.render();
        //}
        renderVisaCheckout(cartModel);

        MessageHandler.showMessage("BulkAddToCart");

        paypal.loadScript();
        if (cartModel.count() > 0){
          ApplePay.init();
        }
        if (AmazonPay.isEnabled && cartModel.count() > 0)
            AmazonPay.addCheckoutButton(cartModel.id, true);
    });

});
