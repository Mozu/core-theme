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
                return me.applyPayment();
            },
            applyPayment: function() {
                var me = this;
                
                // FOR LOCAL TESTING: Skip API calls and trigger navigation directly
                me.trigger('awscheckoutcomplete', me.id);
                me.isLoading(false);
                return;
                
                /* COMMENTED FOR LOCAL TESTING
                if (me.get("amountRemainingForPayment") < 0) {
                    me.trigger('awscheckoutcomplete', me.id);
                    return;
                }
                var user = require.mozuData('user');
                var billingContact = me.tokenDetails ? me.tokenDetails.billingContact  || {} : {};
                billingContact.email = (user.email !== "" ? user.email : me.get("fulfillmentInfo").fulfillmentContact.email);
            applyPayment: function() {
                var me = this;
                me.trigger('awscheckoutcomplete', me.id);
                me.isLoading(false);
            },
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
            submit: function() {
                var me = this;
                me.applyBilling();
            },