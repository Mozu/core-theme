define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'modules/models-cart',
        'modules/cart-monitor',
        'hyprlivecontext',
        'hyprlive',
        'modules/preserve-element-through-render',
        'modules/modal-dialog'
      ], function (api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, modalDialog) {


    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        initialize: function () {
            this.pickerDialog = this.initializeStorePickerDialog();
            var me = this;

            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.listenTo(this, 'addedNewItem', function(){
              console.log("listened!");
              me.render();
            }, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });

            this.listenTo(this.model.get('items'), 'quantityupdatefailed', this.onQuantityUpdateFailed, this);

            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var pageContext = require.mozuData('pagecontext');
            if (visaCheckoutSettings.isEnabled) {
                window.onVisaCheckoutReady = initVisaCheckout;
                require([pageContext.visaCheckoutJavaScriptSdkUrl], initVisaCheckout);
            }

            this.validateFulfillmentMethods();

        },
        render: function() {
          console.log("GOT CALLED");
          var preserveList = [];
          preserveList.push('.v-button');
          this.model.get('items').forEach(function(item){
            preserveList.push('#fulfillmentLocationName-'+item.id);
          });

            preserveElement(this, preserveList, function() {
                Backbone.MozuView.prototype.render.call(this);
            });
             this.validateFulfillmentMethods();
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
        removeItem: function(e) {
            if(require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
                return false;
            }
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.removeItem(id);
            return false;
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
            var cartModelItems = window.cartView.cartView.model.get("items");
            cartModelItems.forEach(function(item){
              if (item.attributes.fulfillmentMethod == "Ship"){
                $('input[type=radio]#shipping-radio-'+item.attributes.id).prop('checked', 'checked');
                $('#pickup-option-links-'+item.attributes.id).css('display', 'none');
                $('#fulfillmentLocationName-'+item.attributes.id).css('display', 'none');

              } else if (item.attributes.fulfillmentMethod == "Pickup"){
                $('input[type=radio]#pickup-radio-'+item.attributes.id).prop('checked', 'checked');
                $('#fulfillmentLocationName-'+item.attributes.id).css('display', 'inline');
                $('#fulfillmentLocationName-'+item.attributes.id).html(': <strong>'+item.attributes.fulfillmentLocationName+'</strong>');
                $('#pickup-option-links-'+item.attributes.id).css('display', '');
              }
            });

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
          /*
          Parent function for switching from ship to pickup from within cart
          or choosing a new pickup location from within cart. Runs a set of api
          calls using the cartItemId and that item's product code to get
          necessary inventory information and display a dialog containing that
          information.
          */
          var me = this;

          var listOfLocations = [];

          me.getInventoryData(cartItemId, productCode).then(function(inv){
            inv.items.forEach(function(invItem, i){
                me.handleInventoryData(invItem).then(function(handled){
                  listOfLocations.push(handled);
                  if (i==inv.items.length-1){
                    //We're in the midst of asynchrony, but we want this dialog
                    //to go ahead and open right away if we're at the end of the
                    //for loop. If we put the following code outside of the for loop,
                    //it may run before the for loop is complete.
                    var $bodyElement = $('#mz-location-selector').find('.modal-body');
                    me.pickerDialog.setBody(me.makeLocationPickerBody(listOfLocations, inv.items, cartItemId));
                    me.pickerDialog.show();

                  }
                });
              });
            });

        },
        getInventoryData: function(id, productCode){
          //Gets basic inventory data based on product code.
          return window.cartView.cartView.model.get('items').get(id).get('product').apiGetInventory({
            productCode: productCode
          });
        },
        handleInventoryData: function(invItem){
          //Uses limited inventory location from product to get inventory names.
            return api.get('location', invItem.locationCode);
        },
        changeFulfillmentMethod: function(e){
          //Called when a radio button is clicked.

          var me = this;
          var cartModel = require.mozuData('cart');
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
                $('#fulfillmentLocationName-'+cartItemId).css("display", "none");
                $('#pickup-option-links-'+cartItemId).css("display", "none");
                cartItem.set('fulfillmentMethod', value);
                cartItem.set('fulfillmentLocationName', '');
                cartItem.set('fulfillmentLocationCode', '');
                // cartItem.apiUpdate().then(me.validateFulfillmentMethods());
                cartItem.apiUpdate();


              } else if (value=="Pickup"){
                $('#fulfillmentLocationName-'+cartItemId).css("display", "inline");
                $('#pickup-option-links-'+cartItemId).css("display", "");
                  //first we get the correct product code for this item.
                  //If the product is a variation, we want to pass that when searching for inventory.
                  var productCode = cartItem.apiModel.data.product.variationProductCode || cartItem.apiModel.data.product.productCode;
                  this.pickStore(productCode, cartItemId);
              }

        },
        makeLocationPickerBody: function(locationList, locationInventoryInfo, cartItemId){
          /*
          Uses a list of locations to build HTML to stick into the
          location picker. cartItemId is added as an attribute to each select
          button so that it can be used to assign the new pickup location to the
          right cart item.

          locationList should be a list of fulfillment locations with complete
          location data (what we need is the name). locationInventoryInfo will
          contain stock levels for the current product(cartItemId) by location code.
          */
          var me = this;

          var body = "";
          locationList.forEach(function(location){
            //We find the inventory data that matches the location we're focusing on.
            var matchedInventory = locationInventoryInfo.filter(function(locationInventory){
              return locationInventory.locationCode == location.data.code;
            });
            //matchedInventory should be a list of one item.

            var stockLevel = matchedInventory[0].stockAvailable;
            var allowsBackorder = location.data.allowFulfillmentWithNoStock;

            var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex" });
            var leftSideDiv = $('<div>', {"style": "flex:1"});
            var rightSideDiv = $('<div>', {"style": "flex:1"});
            leftSideDiv.append('<h4 style="margin: 6.25px 0 6.25px">'+location.data.name+'</h4>');
            //If there is enough stock or the store allows backorder,
            //we'll let the user click the select button.
            //Even if these two conditions are met, the user could still be
            //halted upon trying to proceed to checkout if
            //the product isn't configured to allow for backorder.

          var address = location.data.address;

          leftSideDiv.append($('<div>'+address.address1+'</div>'));
          if(address.address2){leftSideDiv.append($('<div>'+address.address2+'</div>'));}
          if(address.address3){leftSideDiv.append($('<div>'+address.address3+'</div>'));}
          if(address.address4){leftSideDiv.append($('<div>'+address.address4+'</div>'));}
          leftSideDiv.append($('<div>'+address.cityOrTown+', '+address.stateOrProvince+' '+address.postalOrZipCode+'</div>'));
            var $selectButton;
            if (stockLevel>0 || allowsBackorder){
                leftSideDiv.append("<p class='mz-locationselect-available'>Product Available</p>");
                var buttonData = {
                  locationCode: location.data.code,
                  locationName: location.data.name,
                  cartItemId: cartItemId
                };
                  //TODO
                  //labels
                $selectButton = $("<button>", {"type": "button", "class": "mz-button mz-store-select-button", "style": "margin:25% 0 0 25%", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
                $selectButton.text("Select Store");
                rightSideDiv.append($selectButton);


              } else {
                leftSideDiv.append("<p class='mz-locationselect-unavailable'>Out of Stock</p>");
                $selectButton = $("<button>", {"type": "button", "class": "mz-button is-disabled mz-store-select-button", "aria-hidden": "true", "disabled":"disabled", "style": "margin:25% 0 0 25%"});
                $selectButton.text("Select Store");
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
          cartItem.set('fulfillmentMethod', 'Pickup');
          cartItem.set('fulfillmentLocationName', storeSelectData.locationName);
          cartItem.set('fulfillmentLocationCode', storeSelectData.locationCode);
          // cartItem.apiUpdate().then(me.validateFulfillmentMethods());
          cartItem.apiUpdate();


          $('#fulfillmentLocationName-'+storeSelectData.cartItemId).css("display", "inline");
          $('#fulfillmentLocationName-'+storeSelectData.cartItemId).html(": <strong>"+cartItem.get('fulfillmentLocationName')+"</strong>");
          $('#pickup-option-links-'+storeSelectData.cartItemId).css("display", "");


        },
        splitHandler: function(e){



          var me = this;
          console.log("spleet");


          // make new cart item
          // add it to cart

          var cartItemId = $(e.currentTarget).data('mz-cart-item');
          var cartItem = this.model.get("items").get(cartItemId);
          var cartModel = require.mozuData('cart');

          //new item attribute gathering
          var productCode = cartItem.apiModel.data.product.productCode;
          var variationProductCode = cartItem.apiModel.data.product.variationProductCode || "";
          var options = cartItem.apiModel.data.product.options;
          var quantity = 1;

          var newItem = {
            "product":{
              "productCode":productCode,
              "variationProductCode":variationProductCode,
              "options":options
            },
              "quantity":quantity,
              "fulfillmentLocationCode":"",
              "fulfillmentMethod":"Pickup"
            };

          this.model.apiAddProduct(newItem).then(function(e){
            var newCartItem = new CartModels.CartItem(e.data);
            //Adding here is what allows cart to render?
            me.model.get('items').add(newCartItem);
            console.log(newCartItem);
            me.trigger('addedNewItem');

          });


        },
        validateFulfillmentMethods: function(){
          console.log("validate got called");
          console.log(this.model.get('items'));

          this.model.get('items').forEach(function(item){
            var fulfillmentTypesSupported = item.apiModel.data.product.fulfillmentTypesSupported;

            var $shipRadio = $('#shipping-radio-'+item.id);
            var $pickupRadio = $('#pickup-radio-'+item.id);

            if (!fulfillmentTypesSupported.includes("DirectShip")){
              $shipRadio.attr('disabled', 'disabled');
              var $shipUnavailableMessage = $shipRadio.parent().find('.fulfillment-unavailable-message');
              $shipUnavailableMessage.html(Hypr.getLabel("inStoreOnly"));
            }

            if (!fulfillmentTypesSupported.includes("InStorePickup")){
              $pickupRadio.attr('disabled', 'disabled');
              var $pickupUnavailableMessage = $pickupRadio.parent().find('.fulfillment-unavailable-message');
              $pickupUnavailableMessage.html(Hypr.getLabel("unavailableForThisItem"));
            }


            if (item.get('fulfillmentMethod')=="Pickup"){
              console.log(item.attributes.fulfillmentLocationName);
              $('#fulfillmentLocationName-'+item.id).html(': <strong>'+item.attributes.fulfillmentLocationName+'</strong>');
            } else {
                $('#fulfillmentLocationName-'+item.id).html('');
            }

          });


          //get current fulfillment method
          //if pickup, list pickup location name
          //if not, clear it


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





    /* begin visa checkout */
    function initVisaCheckout (model, subtotal) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            subtotal = model.get('subtotal');
            delay = 0;

            if (!window.V) {
                //console.warn( 'visa checkout has not been initilized properly');
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

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(window.V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                subtotal: "" + subtotal
            }
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
    });

});
