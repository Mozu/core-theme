define(["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product", "modules/models-returns"], function(api, _, Backbone, Hypr, ProductModels, ReturnModels) {

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
        OrderPackageItem = Backbone.MozuModel.extend({
            helpers: ['getProductDetails'],
            productDetails: null,
            getProductDetails: function() {
                /**
                 * Little Odd, this is used to set the value for the helper function getProductDetails
                 * Figuring out a package's product info is somewhat heavy. So in order to ensure it is only run once we do this here.
                 */
                if (!this.productDetails) {
                    this.setProductDetails();
                }
                return this.productDetails;
            },
            addOrderItemToModel: function() {
                var self = this;
                self.set('orderItem', this.getOrderItem());
            },
            getOrderItem: function() {
                var self = this;
                if (this.collection.parent) {
                    return this.collection.parent.getOrder().get('explodedItems').find(function(model) {
                        if (model.get('productCode')) {
                            return self.get('productCode') === model.get('productCode');
                        }
                        return self.get('productCode') === (model.get('product').get('variationProductCode') ? model.get('product').get('variationProductCode') : model.get('product').get('productCode'));
                    });
                }
                return null;
            },
            setProductDetails: function() {
                if (this.getOrderItem()) {
                    this.productDetails = this.getOrderItem().toJSON();
                } else {
                    this.productDetails = {};
                }
            }
        }),
        OrderPackage = Backbone.MozuModel.extend({
            relations: {
                items: Backbone.Collection.extend({
                    model: OrderPackageItem
                })
            },
            dataTypes: {
                orderId: Backbone.MozuModel.DataTypes.Int,
                selectedForReturn: Backbone.MozuModel.DataTypes.Boolean
            },
            helpers: ['formatedFulfillmentDate'],
            //To-Do: Double Check for useage
            getOrder: function() {
                return this.collection.parent;
            },
            formatedFulfillmentDate: function() {
                var shippedDate = this.get('fulfillmentDate'),
                    options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    };

                if (shippedDate) {
                    var date = new Date(shippedDate);
                    return date.toLocaleDateString("en-us", options);
                }

                return "";
            }
        }),

        OrderPackageList = Backbone.Collection.extend({
            model: OrderPackage
        }),
        OrderItemBit = Backbone.MozuModel.extend({
            relations: {
                product: ProductModels.Product
            },
            uniqueProductCode: function() {
                //Takes into account product variation code
                var self = this,
                    productCode = self.get('productCode');

                if (!productCode) {
                    productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
                }
                return productCode;
            },
            getOrderItem: function() {
                var self = this;
                if (self.get('Type') === "BundleItem" && self.get('parentLineId')) {
                    var orderItem = self.collection.getOrderItems().find(function(item) {
                        return item.get('lineId') === self.get('parentLineId');
                    });
                    return orderItem;
                }
                return this.collection.getOrderItems().find(function(item) {
                    return item.get('lineId') === self.get('lineId');
                });
            }
        }),
        ExplodedOrderItems = Backbone.Collection.extend({
            relations: {
                model: OrderItemBit
            },
            initSet: function() {
                this.mapOrderItems();
            },
            /** 
             * Groups our Exoloded Items by productCode
             *
             * [getGroupedCollection]
             * @return[array of OrderItemBit]
             */
            getGroupedCollection: function() {
                var self = this,
                    groupedBits = {
                        "productExtra": [],
                        "standardProduct": []
                    };

                var productExtras = self.filter(function(item) {
                        return item.has('optionAttributeFQN');
                    }),
                    standardProducts = self.filter(function(item) {
                        return !item.has('optionAttributeFQN');
                    }),
                    standardProductsGroup = _.groupBy(standardProducts, function(item) {
                        return item.uniqueProductCode();
                    }),
                    productExtraGroup = {};
                _.each(productExtras, function(extra, extraKey) {
                    var key = extra.uniqueProductCode() + '_' + extra.get('optionAttributeFQN');
                    var duplicateItem = _.find(productExtraGroup, function(groupedItem) {
                        return (extra.uniqueProductCode() === groupedItem[0].uniqueProductCode() && extra.get('optionAttributeFQN') === groupedItem[0].get('optionAttributeFQN'));
                    });
                    if (duplicateItem) {
                        productExtraGroup[key].add(extra);
                        return false;
                    }
                    productExtraGroup[key] = [extra];
                });

                function combineAndAddToGroupBits(type, grouping) {
                    _.each(grouping, function(group, key) {
                        var groupQuantity = 0;
                        _.each(group, function(item) {
                            groupQuantity += item.get('quantity');
                        });

                        group[0].set('quantity', groupQuantity);
                        groupedBits[type].push(group[0]);
                    });
                }

                combineAndAddToGroupBits("productExtra", productExtraGroup);
                combineAndAddToGroupBits("standardProduct", standardProductsGroup);

                return groupedBits;
            },
            getOrderItems: function() {
                return this.parent.get('items');
            },
            mapOrderItems: function() {
                var self = this;
                self.getOrderItems().each(function(item, key) {
                    var productOrderItem = JSON.parse(JSON.stringify(item));
                    self.explodeOrderItems(productOrderItem);
                });
            },
            explodeOrderItems: function(item) {
                var self = this;
                if (item && item.product.bundledProducts) {
                    if (item.product.bundledProducts.length > 0) {
                        //We do not want to include the orignal bundle in our expoled Items
                        if (item.product.productUsage !== "Bundle") {
                            self.add(new OrderItemBit(item));
                        }
                        self.explodeProductBundle(item);
                        return;
                    }
                }
                self.add(new OrderItemBit(item));
            },
            explodeProductBundle: function(item) {
                var self = this;
                var bundleItems = JSON.parse(JSON.stringify(item.product.bundledProducts));
                _.each(bundleItems, function(bundle, key) {
                    bundle.Type = "BundleItem";
                    bundle.parentProductCode = (item.product.variationProductCode) ? item.product.variationProductCode : item.product.productCode;
                    bundle.parentLineId = item.lineId;
                    bundle.parentProduct = JSON.parse(JSON.stringify(item.product));
                    bundle.quantity = bundle.quantity * item.quantity;
                    self.add(new OrderItemBit(bundle));
                });
            }
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
                var item = this.getOrderItem();
                if (item) {
                    item = item.toJSON();
                    rmas.get('items').remove(item);
                }
            }
        }),

        ReturnableItems = Backbone.Collection.extend({
            model: ReturnableItem
        }),

        Order = Backbone.MozuModel.extend({
            mozuType: 'order',
            relations: {
                items: OrderItemsList,
                explodedItems: ExplodedOrderItems,
                packages: OrderPackageList,
                pickups: OrderPackageList,
                digitalPackages: OrderPackageList,
                returnableItems: ReturnableItems,
                rma: ReturnModels.RMA
            },
            handlesMessages: true,
            helpers: ['getNonShippedItems', 'hasFulfilledPackages', 'hasFulfilledPickups', 'hasFulfilledDigital', 'getInStorePickups', 'getReturnableItems'],
            _nonShippedItems: {},
            initialize: function() {
                var self = this;
                var pageContext = require.mozuData('pagecontext'),
                    orderAttributeDefinitions = pageContext.storefrontOrderAttributes;
                self.set('orderAttributeDefinitions', orderAttributeDefinitions);
                self.get('explodedItems').initSet();

                //This is used to set the value for the helper function getNonShippedItems
                //Figuring out what items have yet to ship is somwhat heavy. So in order to ensure it is only run once we do this here.
                self.setNonShippedItems();
            },
            hasFulfilledPackages: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('packages').each(function(myPackage) {
                    if (myPackage.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
                return hasfulfilledPackage;
            },
            hasFulfilledPickups: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('pickups').each(function(myPickup) {
                    if (myPickup.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
                return hasfulfilledPackage;
            },
            hasFulfilledDigital: function() {
                var self = this,
                    hasfulfilledPackage = false;

                self.get('digitalPackages').each(function(myDigital) {
                    if (myDigital.get('status') === "Fulfilled") {
                        hasfulfilledPackage = true;
                    }
                });
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
             * Creates a list package codes from all package types to be used to determine shipped and nonShipped items.
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
             * Creates a list of nonShipped items by comparing fulfilled packages items with Order Items
             * 
             * [setNonShippedItems]
             * @return {[Array]}
             */
            setNonShippedItems: function() {
                var self = this,
                    groupedItems = [];

                if (self.get('items')) {
                    //Get collections of both packaged Codes and exploded order items
                    var packages = this.getCollectionOfPackages();
                    groupedItems = this.get('explodedItems').getGroupedCollection();

                    //Update quanity of items by comparing with packaged items
                    _.each(packages, function(type, typeKey, typeList) {
                        _.each(type, function(myPackage, key, list) {
                            _.each(groupedItems[typeKey], function(item, key) {
                                if (item.uniqueProductCode() === myPackage.get('productCode')) {
                                    if (item.get('optionAttributeFQN') && item.get('optionAttributeFQN') != myPackage.get('optionAttributeFQN')) {
                                        return false;
                                    }
                                    if (item.get('quantity') === 1) {
                                        groupedItems[typeKey].splice(key, 1);
                                        return false;
                                    }
                                    item.set('quantity', item.get('quantity') - 1);
                                    return false;
                                }
                            });
                        });
                    });

                }
                self._nonShippedItems = groupedItems.standardProduct.concat(groupedItems.productExtra);
                return;
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
             * This is primary to get product detial information and ensure Product bundles are returned as a whole
             * while product extras, within a bundle or not, are returned separately. 
             * 
             * [returnableItems]
             * @return {[Array]}
             */
            returnableItems: function(returnableItems) {
                var self = this,
                    returnItems = [],
                    parentBundles = [];

                var lineItemGroups = _.groupBy(returnableItems, function(item) {
                    return item.orderLineId;
                });

                self.get('returnableItems').reset(null);
                // First, group the returnable items by OrderItem.LineId
                _.each(lineItemGroups, function(grouping) {
                    // If an OrderItem has extras, there will be 2 entries for the parent, one with extras, one without.
                    // Find the one without extras (standalone parent) if available.
                    var returnableParents = _.filter(grouping, function(item) {
                        return !item.parentProductCode;
                    });

                    var returnableParent = returnableParents.length > 1 ?
                        _.find(returnableParents, function(item) {
                            return item.excludeProductExtras === true;
                        }) :
                        returnableParents[0];

                    var originalOrderItem = self.get('items').find(function(item) {
                        return item.get('lineId') === returnableParent.orderLineId;
                    });

                    if (returnableParent.quantityReturnable > 0) {
                        // Clone does not deep copy, each individual node must be cloned to avoid overriding of the orignal orderitem
                        var parentItem = JSON.parse(JSON.stringify(originalOrderItem));
                        returnableParent.product = parentItem.product;

                        // If we need to exclude extras, strip off bundle items with an OptionAttributeFQN and the corresponding Product.Options.
                        if (returnableParent.excludeProductExtras) {
                            var children = parentItem.product.bundledProducts;
                            var extraOptions = _.chain(children)
                                .filter(function(child) {
                                    return child.optionAttributeFQN;
                                })
                                .map(function(extra) {
                                    return extra.optionAttributeFQN;
                                })
                                .value();
                            var bundleItems = _.filter(children, function(child) {
                                return !child.optionAttributeFQN;
                            });

                            var allOptions = parentItem.product.options;
                            var nonExtraOptions = allOptions.filter(function(option) {
                                return !_.contains(extraOptions, option.attributeFQN);
                            });

                            //Add any extra properites we wish the returnableItem to have
                            returnableParent.product.bundledProducts = bundleItems;
                            returnableParent.product.options = nonExtraOptions;
                        }

                        self.get('returnableItems').add(returnableParent);

                    }

                    var childProducts = originalOrderItem.get('product').get('bundledProducts');
                    // Now process extras.
                    var returnableChildren = _.filter(grouping, function(item) {
                        return item.parentProductCode && item.orderItemOptionAttributeFQN && item.quantityReturnable > 0;
                    });
                    _.each(returnableChildren, function(returnableChild, key) {
                        var childProductMatch = _.find(childProducts, function(childProduct) {
                            var productCodeMatch = childProduct.productCode === returnableChild.productCode;
                            var optionMatch = childProduct.optionAttributeFQN === returnableChild.orderItemOptionAttributeFQN;
                            return productCodeMatch && optionMatch;
                        });

                        if (childProductMatch) {
                            var childProduct = _.clone(childProductMatch);
                            returnableChild.product = childProduct;
                            self.get('returnableItems').add(returnableChild);
                        }
                    });
                });
                return self.get('returnableItems');
            },
            clearReturn: function() {
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
            }
        }),
        OrderCollection = Backbone.MozuPagedCollection.extend({
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

    return {
        OrderItem: OrderItem,
        Order: Order,
        OrderCollection: OrderCollection,
        OrderPackage: OrderPackage
    };

});