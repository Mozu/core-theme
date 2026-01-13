define(["modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'hyprlivecontext',
    'modules/editable-view',
    'modules/amazonpay'],
    function ($, _, Hypr, Backbone, HyprLiveContext, EditableView, AmazonPay) {

var CheckoutStepView = EditableView.extend({
        edit: function () {
            this.model.edit();
        },
        next: function () {
            // wait for blur validation to complete
            var me = this;
            me.editing.savedCard = false;
            _.defer(function () {
                me.model.next();
            });
        },
        cancel: function(){
            this.model.cancelStep();
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            EditableView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        amazonShippingAndBilling: function() {
            var activePayments = window.order.apiModel.getActivePayments();
            var v2Payment = activePayments && _.find(activePayments, function(payment) {
                return payment.paymentType === 'PayWithAmazonV2' || 
                       (payment.paymentType === 'token' && payment.billingInfo.token && payment.billingInfo.token.type === 'PayWithAmazonV2');
            });
            
            if (v2Payment) {
                var checkoutSessionId = v2Payment.paymentType === 'PayWithAmazonV2' ? 
                    v2Payment.externalTransactionId : 
                    v2Payment.billingInfo.token.paymentServiceTokenId;
                
                // Redirect to checkout page with V2 view and session ID
                window.location = "/checkout/"+window.order.id+"?isAwsCheckout=true&view=amazon-checkout-v2&amazonCheckoutSessionId="+checkoutSessionId;
            } else {
            window.location = "/checkout/"+window.order.id+"?isAwsCheckout=true&access_token="+window.order.get("fulfillmentInfo").get("data").addressAuthorizationToken+"&view="+AmazonPay.viewName;

            }
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            EditableView.prototype.render.apply(this, arguments);
            this.resize();
        },
        toggleMultiShipMode : function() {
            this.model.toggleMultiShipMode();
            this.render();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });
    return CheckoutStepView;
});
