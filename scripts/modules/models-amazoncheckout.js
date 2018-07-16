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
            awsData: null,
            handlesMessages: true,
            initialize: function (data) {
                var self = this;
                _.bindAll(this, "submit");

            },
            applyShippingMethods: function(existingShippingMethodCode) {
                var me = this;
                //me.isLoading( true);
                me.apiModel.getShippingMethods(null, {silent:true}).then(
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
                     
                        
                        me.apiModel.update({ fulfillmentInfo: fulfillmentInfo}, {silent: true}).then(
                            function() {
                                //me.isLoading (false);
                                me.set("fulfillmentInfo", fulfillmentInfo);
                                me.applyBilling();
                            });
                    });
            },
            applyBilling: function() {
                var me = this;
                //me.isLoading (true);

                return api.all.apply(api,_.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== "StoreCredit" && payment.paymentType !== "GiftCard";
                }), function(payment) {
                    return me.apiVoidPayment(payment.id);
                })).then(function() {
                    return me.apiGet(null, { silent: true });
                }).then(function(order) {
                    return me.applyPayment();
                });
            },
            applyPayment: function() {
                var me = this;
                if (me.get("amountRemainingForPayment") < 0) {
                    me.trigger('awscheckoutcomplete', me.id);
                    return;
                }
                var user = require.mozuData('user');
                 var billingInfo = {
                    "newBillingInfo" : 
                    {   
                        "paymentType": "PayWithAmazon",
                        "paymentWorkflow": "PayWithAmazon",
                        "card" : null,
                        "billingContact" : {
                            "email": (user.email !== "" ? user.email : me.get("fulfillmentInfo").fulfillmentContact.email)
                        },
                        "orderId" : me.id,
                        "isSameBillingShippingAddress" : false,
                        data : {
                            "awsData" : me.awsData
                        }
                    },
                    "externalTransactionId" : me.awsData.awsReferenceId
                };

                me.apiModel.createPayment(billingInfo, {silent:true}).then( function() {
                    me.trigger('awscheckoutcomplete', me.id);
                    me.isLoading(false);
               }, function(err) {
                    me.isLoading(false);
               });
            },
            submit: function() {
                var me = this;
                me.isLoading(true);
                var fulfillmentInfo = me.get("fulfillmentInfo"),
                    existingShippingMethodCode = fulfillmentInfo.shippingMethodCode;

                if (me.awsData === null)
                    me.awsData = fulfillmentInfo.data;
                else 
                    fulfillmentInfo.data = me.awsData;

                   var user = require.mozuData('user');
                    if (user && user.email) {
                        if (!fulfillmentInfo.fulfillmentContact)
                            fulfillmentInfo.fulfillmentContact = {};

                        fulfillmentInfo.fulfillmentContact.email =  user.email; 
                    }
                    else {
                        fulfillmentInfo.fulfillmentContact = null;
                    }

                me.apiModel.updateShippingInfo(fulfillmentInfo, { silent: true }).then(function(result) {
                    me.set("fulfillmentInfo",result.data);
                    //me.isLoading(false);
                    if (me.apiModel.data.requiresFulfillmentInfo)
                        me.applyShippingMethods(existingShippingMethodCode);
                    else
                        me.applyBilling();
                });
            },
             onCheckoutError: function (msg) {
                var me = this,
                    errorHandled = false,
                    error = {};
                    //me.messages.add(msg || Hypr.getLabel('unknownError'));
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