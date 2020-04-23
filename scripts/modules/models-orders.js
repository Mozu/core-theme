define([
    "modules/api",
    'underscore',
    "modules/backbone-mozu",
    "hyprlive",
    "modules/models-product",
    "modules/models-returns",
    "modules/models-shipments"
], function(api, _, Backbone, Hypr, ProductModels, ReturnModels, ShipmentModels) {

    var OrderItem = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            helpers: ['uniqueProductCode'],
            uniqueProductCode: function() {
                //Takes into account product variation code
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            toJSON: function() {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (j.parent) {
                    j.parent = j.parent.toJSON();
                }
                return j;
            }
        }),

        OrderItemsList = Backbone.Collection.extend({
            model: OrderItem
        }),
        
        ReturnableItem = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            helpers: ['uniqueProductCode'],
            initialize: function() {
                var duplicate = this.checkForDuplicate();
                if (duplicate)
                    this.handleDuplicate(duplicate);
            },
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
            },
            handleDuplicate: function(duplicate) {
                var self = this;
                if (duplicate) {
                    self.set('quantityReturnable', self.get('quantityReturnable') + duplicate.get('quantityReturnable'));
                    self.collection.remove(duplicate);
                }
            },
            uniqueProductCode: function() {
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            getOrderItem: function() {
                var self = this;
                var productCode = self.uniqueProductCode();

                var orderItem = self.collection.parent.get('items').find(function(item) {
                    return item.get('lineId') === self.get('orderLineId');
                });
                return orderItem;
            },
            startReturn: function() {
                var rmas = this.collection.parent.get('rma');
                rmas.get('items').add(this);
                rmas.set({
                    originalOrderId: this.collection.parent.get('id'),
                    returnType: 'Refund'
                });

            },
            cancelReturn: function() {
                var rmas = this.collection.parent.get('rma');
                    rmas.get('items').remove(this);
            }
        }),

        ReturnableItems = Backbone.Collection.extend({
            model: ReturnableItem
        }),

        Order = Backbone.MozuModel.extend({
            mozuType: 'order',
            relations: {
                items: OrderItemsList,
                shipments: ShipmentModels.ShipmentCollection,
                returnableItems: ReturnableItems,
                rma: ReturnModels.RMA
            },
            handlesMessages: true,
            helpers: ['getReturnableItems', 'hasFulfilledShipments'],
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
                return hasfulfilledPackage;
            },
            getReturnableItems: function() {
                var filteredReturnItems = this.get('returnableItems').filter(function(item) {
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
            /**
             * Fetches a list of order items and thier returnable states
             * 
             * [setNonShippedItems]
             * @return {[Array]}
             */
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
                var self = this,
                    returnItems = [],
                    parentBundles = [];

                var shipmentGroups = _.groupBy(returnableItems, function(item) {
                    return item.orderLineId;
                });

                self.get('returnableItems').reset(null);
                // First, group the returnable items by OrderItem.LineId
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
            finishReturn: function() {
                var self = this,
                    op, rma, validationObj;
                rma = this.get('rma');
                validationObj = false;
                if (validationObj) {
                    Object.keys(validationObj).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj[key]
                        });
                    }, this);

                    return false;
                }
                this.isLoading(true);
                rma.toJSON();
                rma.syncApiModel();
                op = rma.apiCreate();
                if (op) return op;
            },
            getShipments: function() {
                return this.get('shipments').getMoreShipmentItems();
            },
            initShipmentItems: function(){
                return this.get('shipments').initShipmentItems();
            }
        }),
        OrderCollection = Backbone.MozuPagedCollection.extend({
            mozuType: 'orders',
            defaults: {
                pageSize: 5,
                page: 0,
                startIndex: -1
            },
            relations: {
                items: Backbone.Collection.extend({
                    model: Order
                })
            }
        });

    return {
        OrderItem: OrderItem,
        Order: Order,
        OrderCollection: OrderCollection
    };

});