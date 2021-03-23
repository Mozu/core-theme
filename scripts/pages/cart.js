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
        'modules/cart-common-view',
        'modules/cart/discount-dialog/views-discount-dialog',
        'modules/models-discount',
        'modules/message-handler'
], function (api, Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, modalDialog, paypal , LocationModels, AmazonPay, ApplePay, CartView, DiscountModalView, Discount, MessageHandler) {

    
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
