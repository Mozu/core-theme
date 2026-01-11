define([
    "modules/jquery-mozu",
    "underscore",
    "modules/backbone-mozu",
    "modules/api",
    "hyprlive",
    "modules/models-token",
    'hyprlivecontext'
],function ($, _, Backbone, api, Hypr, TokenModel,hyprlivecontext) {

    var AwsCheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'order',
            awsData: null,
            handlesMessages: true,
            tokenDetails : null,
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
                var billingContact = me.tokenDetails ? me.tokenDetails.billingContact  || {} : {};
                billingContact.email = (user.email !== "" ? user.email : me.get("fulfillmentInfo").fulfillmentContact.email);

                var billingInfo =  {
                    "newBillingInfo" :
                    {
                        "card" : null,
                        "billingContact" : billingContact,
                        "orderId" : me.id,
                        "isSameBillingShippingAddress" : false,
                        data : {
                            "awsData" : me.awsData
                        }
                    }
                };

                if (me.isLegacyCheckout()) {
                    // Legacy flow - direct payment with external transaction ID
                    billingInfo.externalTransactionId = me.awsData.checkoutSessionId;
                    billingInfo.newBillingInfo.paymentType = "PayWithAmazonV2";
                    billingInfo.newBillingInfo.paymentWorkflow = "PayWithAmazonV2";
                } else {
                    // Modern flow - token-based payment
                    billingInfo.newBillingInfo.paymentType = "token";
                    billingInfo.newBillingInfo.token = {
                        "paymentServiceTokenId": me.awsData.id,
                        "type": "PayWithAmazonV2"
                    };
                }

                me.apiModel.createPayment(billingInfo, {silent:true}).then( function() {
                    me.trigger('awscheckoutcomplete', me.id);
                    me.isLoading(false);
               }, function(err) {
                    me.isLoading(false);
               });
            },
            isLegacyCheckout: function() {
                var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayWithAmazonV2"});
                return paymentSettings && paymentSettings.namespace.toLowerCase() != "tenant" && paymentSettings.isEnabled;
            },
            submit: function() {
                var me = this;
                me.isLoading(true);
                var fulfillmentInfo = me.get("fulfillmentInfo"),
                    existingShippingMethodCode = null;

                if (me.awsData === null)
                    me.awsData = fulfillmentInfo.data;
                else
                    fulfillmentInfo.data = me.awsData;

                if (me.isLegacyCheckout()) {
                    // Legacy flow - direct order update without token API
                    var user = require.mozuData('user');
                    if (user && user.email) {
                        if (!fulfillmentInfo.fulfillmentContact)
                            fulfillmentInfo.fulfillmentContact = {};

                        fulfillmentInfo.fulfillmentContact.email = user.email;
                    }
                    else {
                        fulfillmentInfo.fulfillmentContact = null;
                    }

                    me.apiModel.updateShippingInfo(fulfillmentInfo, { silent: true }).then(function(result) {
                        me.set("fulfillmentInfo", result.data || result);
                        if (me.apiModel.data.requiresFulfillmentInfo)
                            me.applyShippingMethods(existingShippingMethodCode);
                        else
                            me.applyBilling();
                    }, function(error) {
                        me.onCheckoutError(error.message || 'Failed to update shipping info');
                    });
                } else {
                    // Modern flow - token-based checkout
                    var payWithAmazonToken = new TokenModel.Token({ 
                        type: 'PayWithAmazon',
                        token: me.awsData
                    });
                    payWithAmazonToken.apiCreate().then(function(response){
                        me.awsData.id = response.id;

                    // Get shipping and billing details from checkout session
                    // TODO: Verify that thirdPartyPaymentExecute with methodName "tokenDetails"
                    // is properly implemented in backend. This may need a custom action handler
                    // to retrieve checkout session details from Amazon Pay v2 API.
                    // If this returns errors during testing, implement a handler in PayWithAmazon service.

                    payWithAmazonToken.apiModel.thirdPartyPaymentExecute({
                        methodName: "tokenDetails",
                        cardType: "PayWithAmazonv2",
                        body: null,
                        tokenId: response.id
                    }).then(function(details) {
                        if (details.error) {
                            me.onCheckoutError(details.error.message);
                            return;
                        }
                        
                        if (!details || !details.shippingContact) {
                            me.onCheckoutError("Invalid response from Amazon Pay - missing shipping contact information");
                            return;
                        }
                        
                        me.tokenDetails = details;

                        var shipping = details.shippingContact;
                        var user = require.mozuData('user');
                        if (user && user.email)
                            shipping.email = user.email;

                        me.apiModel.updateShippingInfo({fulfillmentContact : shipping, data: me.awsData}, { silent: true }).then(function(result) {
                            me.set("fulfillmentInfo", result.data || result);
                            if (me.apiModel.data.requiresFulfillmentInfo)
                                me.applyShippingMethods(existingShippingMethodCode);
                            else
                                me.applyBilling();
                        }, function(error) {
                            me.onCheckoutError(error.message || 'Failed to update shipping info');
                        });
                    }, function(error) {
                        me.onCheckoutError(error.message || 'Failed to get token details');
                    });
                }, function(error) {
                    me.onCheckoutError(error.message || 'Failed to create Amazon Pay token');
                });
                }
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
