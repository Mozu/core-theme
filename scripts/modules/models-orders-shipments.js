define(["modules/api", 'underscore', "modules/backbone-mozu", "modules/models-orders", "modules/models-product", "modules/models-returns", "modules/models-shipments"], function(api, _, Backbone, OrderModels, ProductModels, ReturnModels, ShipmentModels) {

    var OrderItem = OrderModels.OrderItem.extend({}),

        ReturnableItem = Backbone.MozuModel.extend({
            checkForDuplicate: function() {
                var self = this;
                var duplicate = self.collection.find(function(item) {
                    if (self.uniqueProductCode() === item.uniqueProductCode() && self.orderLineId !== item.orderLineId) {
                        if (self.get('orderItemOptionAttributeFQN') === item.get('orderItemOptionAttributeFQN')) {
                            return true;
                        }
                    }
                    return false;
                });
                return duplicate;
            }
        }),
        

        Order = OrderModels.Order.extend({
            relations: _.extend({
                shipments: ShipmentModels.ShipmentCollection
            }),
            handlesMessages: true,
            helpers: ['getReturnableItems', 'hasFulfilledShipments', 'hasShipments', 'getShipmentTotal'],
            _nonShippedItems: {},
            initialize: function() {
                var self = this;
                var pageContext = require.mozuData('pagecontext'),
                    orderAttributeDefinitions = pageContext.storefrontOrderAttributes;
                self.set('orderAttributeDefinitions', orderAttributeDefinitions);
            },
            hasFulfilledShipments: function() {
                var self = this,
                hasfulfilledPackage = false,
                shipments = self.get('shipments').get('items');

                if(shipments) {
                    shipments.each(function(shipment) {
                        if (shipment.get('shipmentStatus') === "FULFILLED") {
                            hasfulfilledPackage = true;
                        }
                    });
                }
            },
            getReturnableItems: function() {
                var filteredReturnItems = _.filter(this.get('returnableItems'), function(item) {
                    var method = item.getOrderItem().get('fulfillmentMethod');
                    return method !== "Digital";
                });
                return _.invoke(filteredReturnItems, 'toJSON');
            },
            getInStorePickups: function() {
                var filteredItems = _.filter(this._nonShippedItems, function(item) {
                    var method = item.getOrderItem().get('fulfillmentMethod');
                    return method === "Pickup";
                });
                return _.invoke(filteredItems, 'toJSON');
            },
            getNonShippedItems: function() {
                return _.invoke(this._nonShippedItems, 'toJSON');
            },
            /**
             * Creates a list of package codes from all package types that will be used to determine shipped and nonShipped items.
             * 
             * [getCollectionOfPackageCodes]
             * @return {[Array]}
             */
            getCollectionOfPackages: function() {
                var self = this,
                    packageCodes = [],
                    groupedCodes = {
                        "productExtra": [],
                        "standardProduct": []
                    };

                var addPackageItems = function(packageItems) {
                    if (packageItems.length > 0) {
                        packageItems.each(function(thisPackage, key, list) {
                            if (thisPackage.get("status") === "Fulfilled") {
                                _.each(thisPackage.get('items').models, function(packageItem, key, list) {
                                    var quan = packageItem.get('quantity');
                                    var type = (packageItem.get('optionAttributeFQN') && packageItem.get('optionAttributeFQN') !== "") ? "productExtra" : "standardProduct";
                                    for (var i = 0; i < quan; i++) {
                                        groupedCodes[type].push(packageItem);
                                    }
                                });
                            }
                        });
                    }
                };

                addPackageItems(self.get('packages'));
                addPackageItems(self.get('pickups'));
                addPackageItems(self.get('digitalPackages'));

                return groupedCodes;
            },
            fetchReturnableItems: function() {
                var self = this,
                    op = self.apiGetReturnableItems();
                self.isLoading(true);
                return op.then(function(data) {
                    self.isLoading(false);
                    return data;
                }, function() {
                    self.isLoading(false);
                });
            },
            returnableItems: function(returnableItems) {
                var self = this;

                var shipmentGroups = _.groupBy(returnableItems, function(item) {
                    return item.orderLineId;
                });

                self.get('returnableItems').reset(null);

                _.each(shipmentGroups, function(shipmentGroup) {


                    var returnableShipments = _.filter(shipmentGroup, function(shipment){
                        return shipment.quantityReturnable > 0;
                    });

                    var returnableShipment = returnableShipments[0];


                    if (returnableShipment && returnableShipment.quantityReturnable > 0) {

                        var originalOrderItem = self.get('items').find(function(item) {
                            return item.get('lineId') === returnableShipment.orderLineId;
                        });

                        var originalShipment = self.get('shipments').get('items').find(function(item) {
                            return item.get('shipmentNumber') === returnableShipment.shipmentNumber;
                        });

                        var parentItem = JSON.parse(JSON.stringify(originalOrderItem));
                        returnableShipment.product = parentItem.product;

                        var parentShipment = JSON.parse(JSON.stringify(originalShipment));
                        returnableShipment.shipment = parentShipment;

                        self.get('returnableItems').add(returnableShipment);

                    }
                });
                return self.get('returnableItems');
            },
            clearReturn: function() {
                this._activeReturnShipmentNumber = null;
                var rmas = this.get('rma');
                rmas.clear();
            },
            getShipments: function() {
                return this.get('shipments').getMoreShipmentItems();
            },
            initShipmentItems: function(){
                return this.get('shipments').initShipmentItems();
            }
        }),
        
        OrderCollection =  OrderModels.OrderCollection.extend({
            mozuType: 'orders',
            defaults: {
                pageSize: 5
            },
            relations: {
                items: Backbone.Collection.extend({
                    model: Order
                })
            }
        });

        // So is due to helpers for inherited objects being combined with there parent object
        // backbone-mozu-model.js:591
        Order.prototype.helpers = Order.helpers;

    return {
        OrderItem: OrderItem,
        Order: Order,
        OrderCollection: OrderCollection
    };

});