define([
    "modules/jquery-mozu",
    "underscore",
    "modules/backbone-mozu",
    "modules/api",
    "hyprlivecontext",
    "hyprlive"
],function ($, _, Backbone, api, HyprLiveContext, Hypr) {

    var AwsCheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'order',
            handlesMessages: true,
            initialize: function (data) {
                var self = this;
                _.bindAll(this, "submit");

            },
            applyShippingMethods: function(existingShippingMethodCode) {
                var me = this;
                me.isLoading( true);
                me.apiModel.getShippingMethods().then(
                    function (methods) {

                        if (methods.length === 0) {
                            me.onCheckoutError(Hypr.getLabel("awsNoShippingOptions"));
                        }
                        
                        var shippingMethod = "";
                        if (existingShippingMethodCode)
                            shippingMethod = _.findWhere(methods, {shippingMethodCode: existingShippingMethodCode});
                        
                        if (!shippingMethod || !shippingMethod.shippingMethodCode)
                            shippingMethod =_.min(methods, function(method){return method.price;});
                        
                        var fulfillmentInfo = me.get("fulfillmentInfo");
                        fulfillmentInfo.shippingMethodCode = shippingMethod.shippingMethodCode;
                        fulfillmentInfo.shippingMethodName = shippingMethod.shippingMethodName;
                        me.apiModel.update({ fulfillmentInfo: fulfillmentInfo}).then(
                            function() {
                                me.isLoading (false);
                                me.set("fulfillmentInfo", fulfillmentInfo);
                                me.applyBilling();
                            });
                    });
            },
            applyBilling: function() {
                var me = this;
                me.isLoading (true);
                var currentPayment = me.apiModel.getCurrentPayment();
                //var amountRemainingForPayment = me.get("amountRemainingForPayment");
                if (currentPayment) {
                    // must first void the current payment because it will no longer be the right price
                    return me.apiVoidPayment(currentPayment.id).then(function() {
                        me.applyPayment();
                    });
                } else {
                    return me.applyPayment();
                }
            },
            applyPayment: function() {
                var me = this;
                if (me.get("amountRemainingForPayment") === 0) {
                    me.trigger('awscheckoutcomplete', me.id);
                    return;
                }
                 var billingInfo = {
                    "newBillingInfo" : 
                    {   "paymentType": "PayWithAmazon",
                        "paymentWorkflow": "PayWithAmazon",
                        
                        "billingContact" : {
                            "email": me.get("fulfillmentInfo").fulfillmentContact.email
                        },
                        "orderId" : me.id,
                        "isSameBillingShippingAddress" : false
                    },
                    "externalTransactionId" : me.get("fulfillmentInfo").data.awsReferenceId
                };

                me.apiCreatePayment(billingInfo).then( function() {
                    me.trigger('awscheckoutcomplete', me.id);
                    //me.isLoading(false);
               }, function(err) {
                    me.isLoading(false);
               });
            },
            submit: function() {
                var me = this;
                me.isLoading(true);
                var fulfillmentInfo = me.get("fulfillmentInfo"),
                    existingShippingMethodCode = fulfillmentInfo.shippingMethodCode;
                me.apiUpdateShippingInfo( {data: fulfillmentInfo}).then(function(result) {
                    me.set("fulfillmentInfo",result.data);
                    me.isLoading(false);
                    if (me.apiModel.data.requiresFulfillmentInfo)
                        me.applyShippingMethods(existingShippingMethodCode);
                    else
                        me.applyBilling();
                });
            },
             onCheckoutError: function (msg) {
                var me = this,
                    errorHandled = false;
                me.isLoading(false);
                error = {
                        items: [
                            {
                                message: msg || Hypr.getLabel('unknownError')
                            }
                        ]
                    };
                this.trigger('error', error);
                throw error;
            }
        });

    return {
            AwsCheckoutPage: AwsCheckoutPage
        };
});