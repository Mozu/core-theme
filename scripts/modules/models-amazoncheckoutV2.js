define([
    "modules/jquery-mozu",
    "underscore",
    "modules/backbone-mozu",
    "modules/api",
    "hyprlivecontext",
    "hyprlive"
],function ($, _, Backbone, api, HyprLiveContext, Hypr) {

    var AwsCheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'checkout',
            awsData: null,
            handlesMessages: true,
            defaults: {
                overrideItemDestinations: false
            },
            initialize: function (data) {
                var self = this;
                _.bindAll(this, "submit");

            },
            setShippingDestination: function(awsDestination) {
                var me = this;

                me.addUpdateDestination(awsDestination).then(function(result){
                     {
                        var destination = result.data;
                        var itemsWithoutDestination = _.filter(me.get('items'), function(item){
                            return !item.destinationId && item.fulfillmentMethod != "Pickup";
                        });

                        if (itemsWithoutDestination.length > 0) {
                            var items =  _.map(itemsWithoutDestination, function(item){
                                return item.id;
                            });
                            var itemDestinations = [{destinationId: destination.id, itemIds: items}];
                            me.apiUpdateCheckoutItemDestinationBulk({id: me.get('id'), postdata: itemDestinations}).then(function(result){
                                  me.applyShippingMethods();
                            });
                        } else
                                me.applyShippingMethods();
                    }
                });
            },
            addUpdateDestination: function(awsDestination) {
                var me = this;
                if (awsDestination.id) {
                    awsDestination.checkoutId = me.get('id');
                    awsDestination.destinationId = awsDestination.id;
                    return me.apiModel.updateShippingDestination(awsDestination);
                } else {
                    return me.apiModel.addShippingDestination(awsDestination);
                }
            },
            applyShippingMethods: function() {
                var me = this;
                if (!me.get("requiresFulfillmentInfo")) {
                    me.applyBilling();
                } else {
                me.apiModel.getShippingMethods().then(
                    function (methods) {

                        if (methods.length === 0) {
                            me.onCheckoutError(Hypr.getLabel("awsNoShippingOptions"));
                        }
                        
                        var shippingMethods = [];

                        _.each(methods, function(method) {
                            var existing = _.findWhere(window.order.get('groupings'), {'id' : method.groupingId });
                            var shippingRate = null;

                            if (existing)
                                shippingRate = _.findWhere(method.shippingRates, {'shippingMethodCode': existing.shippingMethodCode});

                            if (!shippingRate)
                                 shippingRate = _.min(method.shippingRates, function (rate){ return rate.price;});

                            shippingMethods.push({groupingId: method.groupingId, shippingRate: shippingRate});
                        });

                        me.apiModel.setShippingMethods({id: me.get('id'), postdata:shippingMethods}).then(function(result) {
                            me.applyBilling();
                        });
                    });
                }
            },
            applyBilling: function() {
                var me = this;
                //me.isLoading (true);

                return api.all.apply(api,_.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== "StoreCredit" && payment.paymentType !== "GiftCard";
                }), function(payment) {
                    return me.apiModel.voidPayment(payment.id);
                })).then(function() {
                    return me.apiModel.get();
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
                var awsDestination = me.getAwsDestination();
                var user = require.mozuData('user');
                 var billingInfo = {
                    "newBillingInfo" : 
                    {   
                        "paymentType": "PayWithAmazon",
                        "paymentWorkflow": "PayWithAmazon",
                        "card" : null,
                        "billingContact" : {
                            "email": (user.email !== "" ? user.email : awsDestination.email)
                        },
                        "orderId" : me.id,
                        "isSameBillingShippingAddress" : false,
                        data : {
                            "awsData" : awsDestination.data
                        }
                    },
                    "externalTransactionId" : awsDestination.data.awsReferenceId
                };

                me.apiModel.createPayment(billingInfo).then( function() {
                    me.trigger('awscheckoutcomplete', me.id);
                    me.isLoading(false);
               }, function(err) {
                    me.isLoading(false);
               });
            },
            getAwsDestination: function() {
                var destinations = this.get("destinations");
                var awsDestination = _.find(destinations, function(destination) { return destination.data && destination.data.awsReferenceId;});
                return awsDestination;
            },
            submit: function() {
                var me = this;
                me.isLoading(true);
                
                var awsDestination = me.getAwsDestination();
                var user = require.mozuData('user');

                if (user && user.email) 
                    awsDestination.destinationContact= {email: user.email}; 
                else 
                    awsDestination.destinationContact = null;

                
                if (me.get('overrideItemDestinations')) {
                    me.apiModel.unsetAllShippingDestinations().then(function(result){
                        me.setShippingDestination(awsDestination);
                    });    
                } else
                    me.setShippingDestination(awsDestination);
                
            },
             onCheckoutError: function (msg) {
                var me = this,
                    errorHandled = false,
                    error = {};
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