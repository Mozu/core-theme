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
                    if (self.uniqueProductCode() === item.uniqueProductCode()) {
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
            /**
             * Used to create a list of returnable items from the return of apiGetReturnableItems and Order Items
             * This is primarily used to get product detial information and ensure Product bundles are returned as a whole
             * while product extras, bundle or otherwise, are returned separately. 
             * 
             * [returnableItems]
             * @return {[Array]}
             */
            combineReturnableShipments: function(shipments){
                var comboItem = JSON.parse(JSON.stringify(shipments[0]));
                // fulfillmentStatus: "FULFILLED"
                // orderItemId: "c1f962881d514952bde9ac000101054e"
                // orderLineId: 1
                // productCode: "CHICKENJEANS-1"
                // productName: "DENIM CHICKEN"
                // quantityFulfilled: 2
                // quantityOrdered: 2
                // quantityReturnable: 2
                // quantityReturned: 0

                //Not needed. Just to avoid confusion 
                delete comboItem.shipmentItemId;
                delete comboItem.shipmentNumber;
                delete comboItem .unitQuantity;

                _.each(shipments, function(item, idx){
                    if (idx) {
                        comboItem.quantityFulfilled =+ item.quantityFulfilled;
                        comboItem.quantityOrdered =+ item.quantityOrdered;
                        comboItem.quantityReturnable =+ item.quantityReturnable;
                        comboItem.quantityReturned =+ item.quantityReturned;
                    }
                });

                comboItem.originalShipments = shipments;
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
                    // If an OrderItem has extras, there will be 2 entries for the parent, one with extras, one without.
                    // Find the one without extras (standalone parent) if available.

                    // var returnableParents = _.filter(grouping, function(item) {
                    //     return !item.parentProductCode;
                    // });

                    // var returnableParent = returnableParents.length > 1 ?
                    //     _.find(returnableParents, function(item) {
                    //         return item.excludeProductExtras === true;
                    //     }) :
                    //     returnableParents[0];
                    // returnableParent = returnableParent || returnableParents[0];

                    var returnableShipments = _.filter(shipmentGroup, function(shipment){
                        return shipment.quantityReturnable > 0;
                    });

                    var returnableShipment = returnableShipments[0];

                    if(returnableShipments.length > 1) {
                        returnableShipment = combineReturnableShipments(returnableShipments);
                    }
            

                    if (returnableShipment && returnableShipment.quantityReturnable > 0) {
                        // Clone does not deep copy, each individual node must be cloned to avoid overriding of the orignal orderitem

                        var originalOrderItem = self.get('items').find(function(item) {
                            return item.get('lineId') === returnableShipment.orderLineId;
                        });

                        var parentItem = JSON.parse(JSON.stringify(originalOrderItem));
                        returnableShipment.product = parentItem.product;

                        

                        // If we need to exclude extras, strip off bundle items with an OptionAttributeFQN and the corresponding Product.Options.
                        // if (returnableParent.excludeProductExtras) {
                        //     var children = parentItem.product.bundledProducts;
                        //     var extraOptions = _.chain(children)
                        //         .filter(function(child) {
                        //             return child.optionAttributeFQN;
                        //         })
                        //         .map(function(extra) {
                        //             return extra.optionAttributeFQN;
                        //         })
                        //         .value();
                        //     var bundleItems = _.filter(children, function(child) {
                        //         return !child.optionAttributeFQN;
                        //     });

                        //     var allOptions = parentItem.product.options;
                        //     var nonExtraOptions = allOptions.filter(function(option) {
                        //         return !_.contains(extraOptions, option.attributeFQN);
                        //     });

                        //     //Add any extra properites we wish the returnableItem to have
                        //     returnableParent.product.bundledProducts = bundleItems;
                        //     returnableParent.product.options = nonExtraOptions;
                        // }

                        self.get('returnableItems').add(returnableShipment);

                    }

                    // var childProducts = originalOrderItem.get('product').get('bundledProducts');
                    // // Now process extras.
                    // var returnableChildren = _.filter(grouping, function(item) {
                    //     return item.parentProductCode && item.orderItemOptionAttributeFQN && item.quantityReturnable > 0;
                    // });
                    // _.each(returnableChildren, function(returnableChild, key) {
                    //     var childProductMatch = _.find(childProducts, function(childProduct) {
                    //         var productCodeMatch = childProduct.productCode === returnableChild.productCode;
                    //         var optionMatch = childProduct.optionAttributeFQN === returnableChild.orderItemOptionAttributeFQN;
                    //         return productCodeMatch && optionMatch;
                    //     });

                    //     if (childProductMatch) {
                    //         var childProduct = _.clone(childProductMatch);
                    //         returnableChild.product = childProduct;
                    //         self.get('returnableItems').add(returnableChild);
                    //     }
                    // });
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