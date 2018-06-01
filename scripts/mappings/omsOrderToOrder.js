define([
    'underscore',
    'mappings/omsOrderItemToOrderItem'
], function (_, omsOrderItemToOrderItem) {

    var OMSOrderToOrder = function (source) {

        var STATUS = {
            SHIPPED: 'Fulfilled',
            FULFILLED: 'Fulfilled',
            ASSIGNED: 'NotFulfilled',
            READY: 'NotFulfilled',
            CANCELED: 'Canceled',
            CANCELLED: 'Canceled'
        };

        var SHIPMENTSTATE = {
            //Example
            //'11-500': 'Shipped'
        };


        var externalOrderIDSplit = source.externalOrderID.split(/[.-]+/);

        function tenatId() {
            var tenantNum = externalOrderIDSplit[2];
            return (tenantNum) ? parseInt(tenantNum, 10) : -1;
        }

        function orderNumber() {
            var orderNum = externalOrderIDSplit[1];
            var parsedNum = (orderNum) ? parseInt(orderNum, 10) : source.orderID;
            return (typeof parsedNum === "number") ? parsedNum : source.orderID;
        }

        function parentCheckoutNumber() {
            var checkoutNum = externalOrderIDSplit[0];
            var parsedNum = (checkoutNum) ? parseInt(checkoutNum, 10) : source.orderID;
            return (typeof parsedNum === "number") ? parsedNum : source.orderID;
        }

        function parseJSON(jsonString) {
            try {
                return JSON.parse(jsonString);
            }
            catch (error) {
            }
            return {};
        }

        function discountTotal() {
            if (source.discounts) {
                if (source.discounts.length) {
                    return _.reduce(source.discounts, function (discountTotal, discount) {
                        return discountTotal += discount.amount;
                    });
                }
            }
            return 0;
        }

        function getItemDiscounts(discountType, item) {
            if (item.discounts) {
                if (item.discounts.length) {
                    return _.reduce(item.discounts, function (discounts, discount) {
                        if (discount.type === discountType) {
                            var ngDiscount = {
                                "discount": {
                                    "couponCode": discount.code,
                                    "discount": {
                                        //"expirationDate": "DateTime",
                                        "id": discount.discountID,
                                        //"itemIds": "string",
                                        "name": discount.description
                                    },
                                    "excluded": false,
                                    "impact": discount.amount
                                },
                                "methodCode": source.shipType
                            };
                            return discounts.push(ngDiscount);
                        }
                        return discounts;
                    }, []);
                }
            }
            return [];
        }

        function getDiscounts(discountType) {
            if (source.discounts) {
                if (source.discounts.length) {
                    return _.reduce(source.discounts, function (discounts, discount) {
                        if (discount.type === discountType) {
                            var ngDiscount = {
                                "discount": {
                                    "couponCode": discount.code,
                                    "discount": {
                                        //"expirationDate": "DateTime",
                                        "id": discount.discountID,
                                        //"itemIds": "string",
                                        "name": discount.description
                                    },
                                    "excluded": false,
                                    "impact": discount.amount
                                },
                                "methodCode": source.shipType
                            };
                            return discounts.push(ngDiscount);
                        }
                        return discounts;
                    }, []);
                }
            }
            return [];
        }

        function mapOrderItems() {
            return _.map(source.items, function (item, idx) {
                return omsOrderItemToOrderItem(item, idx);
            });
        }

        function getProductCode(partNumber) {
            var partNumberSplit = partNumber.split(/[.-]+/);
            return partNumberSplit[0];
        }

        function shipmentsToPackages() {
            //map oms shipments to ng orders

            var nonShippedItems = [];
            var totalShipmentReturnableItems = 0;
            var packages = [];


            _.each(source.shipments, function (shipment, idx) {
                var myPackage = {
                    "shippingMethodCode": source.customData.shippingMethodCode,
                    "shippingMethodName": source.customData.shippingMethodName,
                    "hasLabel": false,
                    "id": shipment.shipmentID,
                    "code": "Package-" + idx,
                    "status": STATUS[shipment.shipmentStatus] || shipment.shipmentStatus,
                    "state": SHIPMENTSTATE[shipment.shipmentStateCode] || shipment.shipmentStateName,
                    "stateCode": shipment.shipmentStateCode,
                    //"status": 'Fulfilled',
                    "items": [],
                    //"fulfillmentLocationCode": "atx-whse",
                    "fulfillmentDate": shipment.createDate
                };

                if (shipment.shipmentStatus === 'SHIPPED') {
                    myPackage.fulfillmentDate = shipment.shipDate;
                    var trackingInformation = shipment.trackingInformation;
                    if (trackingInformation) {
                        if (trackingInformation.length) {
                            myPackage.tracking = [];

                            _.each(trackingInformation, function (tracking, idx) {
                                myPackage.tracking.push({
                                    trackingNumber: tracking.trackingNumber,
                                    trackingURL: tracking.trackingURL,
                                    carrierType: tracking.carrierType
                                });
                            });

                        }
                    }
                }

                _.each(shipment.items, function (shipmentItem, idx) {
                    if (shipmentItem) {
                        var packageItem = {
                            // This is actually the variation product Number and should be kept this way.
                            "productCode": shipmentItem.partNumber,
                            "quantity": shipmentItem.quantity,
                            //"fulfillmentItemType": "Physical",
                            "lineId": shipmentItem.customData.lineID || idx
                            //"optionAttributeFQN": ""
                        };

                        myPackage.items.push(packageItem);


                        // totalShipmentReturnableItems += shipmentItem.quantity;

                        // var orderProduct = _.find(shipments.items, function (item) {
                        //     return item.id === shipmentItem.customData.ngOrderItemID;
                        // });

                        // if (orderProduct) {
                        //     shipmentItem.ngOrderItemID = orderProduct.id;
                        //     shipmentItem.returnQuantity = 0;

                        //     if (orderProduct.product.productCode === shipmentItem.productCode ||
                        //         orderProduct.product.variationProductCode === shipmentItem.productCode) {
                        //         if (orderProduct.product.productUsage === properties.bundle) {
                        //             shipmentItem.notBundle = false;
                        //             shipmentItem.product = orderProduct.product;
                        //         } else {
                        //             shipmentItem.notBundle = true;
                        //             if (orderProduct.product.variationProductCode) {
                        //                 shipmentItem.productCode = orderProduct.product.variationProductCode;
                        //             }
                        //         }
                        //     } else if (shipmentItem.actualPrice === 0) {
                        //         var bundleComponents = orderProduct.product.bundledProducts;
                        //         if (bundleComponents && bundleComponents.length > 0) {
                        //             _.each(bundleComponents, function (bundleComponent) {
                        //                 if (shipmentItem.productCode === bundleComponent.productCode) {
                        //                     shipmentItem.bundleItem = true;
                        //                     shipmentItem.notBundle = true;
                        //                 }
                        //             });
                        //         }
                        //     }
                        // }

                        // var zeroPrice = (shipmentItem.actualPrice === 0);
                        // _.each(orderData[1].collection, function (omsReturn) {
                        //     if (omsReturn.shipmentID === source.shipmentID) {
                        //         var numReturnedItems = omsReturn.item.length;
                        //         for (var p = 0; p < numReturnedItems; p++) {
                        //             var returnItem = omsReturn.item[p];
                        //             if (returnItem) {
                        //                 if (shipmentItem.partNumber === returnItem.partNumber && shipmentItem.orderItemID === returnItem.orderItemID && zeroPrice === (returnItem.returnSubtotal === 0)) {
                        //                     shipments.returnSubtotal += returnItem.returnSubtotal;
                        //                     shipmentItem.returnQuantity += returnItem.quantity;
                        //                     totalShipmentReturnableItems -= returnItem.quantity;
                        //                     omsReturn.item[p] = null;
                        //                 }
                        //             }
                        //         }
                        //     }
                        // });

                        // _.each(source.items, function (orderItem) {
                        //     if (shipmentItem.orderItemID === orderItem.orderItemID) {
                        //         orderItem.quantity -= shipmentItem.quantity;
                        //     }
                        // });
                    }
                });

                if (source.deliveryMethod === 'SHIP_TO_HOME') {
                    mapping.packages.push(myPackage);
                } else if (source.deliveryMethod === 'DIGITAL') {
                    mapping.digitalPackages.push(myPackage);
                } else if (source.deliveryMethod === 'IN_STORE_PICKUP') {
                    mapping.pickups.push(myPackage);
                }
            });
        }


        var mapping = {
            "orderNumber": orderNumber(),
            //"parentCheckoutId": "0ab1d0f56c6b9ecbd8f56696000043df",
            "parentCheckoutNumber": parentCheckoutNumber(),
            //"partialOrderNumber": 1,
            //"partialOrderCount": 2,
            //"isPartialOrder": true,
            //"originalCartId": "0ab1d0f16c6b9ecbd8f56695000043df",
            //"priceListCode": "",
            //"shopperNotes": {},
            //"customerAccountId": 1013,
            //"isTaxExempt": false,
            "email": source.customer.email,
            "ipAddress": source.ipAddress,
            "status": STATUS[source.orderStatus] || source.orderStatus,
            //"type": "Online",
            //"paymentStatus": "Pending",
            //"returnStatus": "None",
            //"isEligibleForReturns": false,
            //"totalCollected": 0.0,
            //"attributes": [],
            "shippingDiscounts": parseJSON(source.customData.ShippingDiscounts),
            "handlingDiscounts": parseJSON(source.customData.HandlingDiscounts),
            // "handlingAmount": 0.0,
            // "handlingTotal": 0.0,
            // "dutyAmount": 0.0,
            //"fulfillmentStatus": "NotFulfilled",
            "submittedDate": source.orderDate,
            // "acceptedDate": "2017-09-08T14:56:48.927Z",
            // "notes": [],
            "items": mapOrderItems(),
            // ],
            // "validationResults": [],
            // "billingInfo": {},
            // "payments": [],
            // "refunds": [],
            "packages": [],
            "pickups": [],
            "digitalPackages": [

            ],
            // "shipments": [

            // ],
            // "isDraft": false,
            // "hasDraft": false,
            // "isImport": false,
            // "couponCodes": [

            // ],
            // "invalidCoupons": [

            // ],
            // "amountAvailableForRefund": 0.0,
            // "amountRemainingForPayment": 0.0,
            // "amountRefunded": 0.0,
            "id": source.orderID,
            // "tenantId": 17375,
            // "siteId": 21444,
            // "channelCode": "1234",
            // "currencyCode": "USD",
            // "customerInteractionType": "Unknown",
            // "fulfillmentInfo": {},
            "orderDiscounts": parseJSON(source.customData.OrderDiscounts),

            // ],
            "subtotal": source.subtotal,
            "discountedSubtotal": source.subtotal,
            "discountTotal": discountTotal(),
            "discountedTotal": 570.0,
            // "shippingTotal": 6.0,
            "shippingSubTotal": source.estimatedShipping,
            "shippingTaxTotal": source.tax.shippingTax,
            //"handlingTaxTotal": source.tax.,
            "itemTaxTotal": source.tax.orderTax,
            "taxTotal": source.tax.totalTax,
            // "feeTotal": 0.0,
            "total": source.total,
            // "lineItemSubtotalWithOrderAdjustments": 570.00,
            // "shippingAmountBeforeDiscountsAndAdjustments": 6.00,
            // "changeMessages": [],
            // "extendedProperties": [],
            // "auditInfo": {},
            // //Extra Info
            'omsOrder': source
        };

        shipmentsToPackages();

        //var order = Object.assign(source, mapping);
        return mapping;
    };

    return OMSOrderToOrder;
});