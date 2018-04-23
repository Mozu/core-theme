define([
    'underscore'
], function (_) {

    var OMSOrderItemToOrderItem = function (source, idx) {

        var STATUS = {
            SHIPPED: 'Fulfilled',
            ASSIGNED: 'NotFulfilled',
            READY: 'NotFulfilled',
            CANCELED: 'Canceled'
        };

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
                    var discounts = [];
                    _.each(item.discounts, function (discount) {
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
                            discounts.push(ngDiscount);
                        }
                    });
                    return discounts;
                }
            }
            return [];
        }

        function getProductOptions(){
            var options = [];
            if (source.options) {
                if (source.options.length) {
                    _.each(source.options, function (value, key) { 
                        options.push({value: value});
                    });
                }
            }
            return options;
        }

        function getProductCode() {
            var partNumberSplit = source.partNumber.split(/[.-]+/);
            return partNumberSplit[0];
        }

        var mapping = {
            "id": source.externalItemID || source.orderItemID,
            //"fulfillmentLocationCode": "kibo-loc",
            //"fulfillmentMethod": "Pickup",
            "lineId": source.customData.lineID || idx,
            "product": {
                // "fulfillmentTypesSupported": [
                //     "DirectShip",
                //     "InStorePickup"
                // ],
                //"imageAlternateText": "",
                "imageUrl": source.customData.image_url,
                "options": getProductOptions(),
                // "properties": [

                // ],
                // "categories": [
                //     {
                //         "id": 1
                //     }
                // ],
                "price": {
                    "price": source.actualPrice
                },
                //"discountsRestricted": false,
                //"isTaxable": true,
                //"productType": "Keyboard",
                //"productUsage": "Standard",
                "bundledProducts": [

                ],
                "productCode": getProductCode(),
                "name": source.description,
                "variationProductCode": source.partNumber
                //"description": source.description,
                //"goodsType": "Physical",
                //"isPackagedStandAlone": false,
                //"productReservationId": 53,
                // "measurements": {
                //     "height": {
                //         "unit": "in",
                //         "value": 3
                //     },
                //     "width": {
                //         "unit": "in",
                //         "value": 8
                //     },
                //     "length": {
                //         "unit": "in",
                //         "value": 16
                //     },
                //     "weight": {
                //         "unit": "lbs",
                //         "value": 4
                //     }
                // },
                //"fulfillmentStatus": "PendingFulfillment"
            },
            "quantity": source.quantity,
            "subtotal": source.subtotal,
            //"extendedTotal": 380,
            "taxableTotal": source.subtotalTaxAmount,
            "discountTotal": source.lineDiscount,
            "discountedTotal": source.subtotal,
            "itemTaxTotal": source.actualPriceTaxAmount,
            "shippingTaxTotal": source.shipping,
            //"feeTotal": 0,
            "total": source.subtotal,
            // "unitPrice": {
            //     "extendedAmount": 190,
            //     "listAmount": 190
            // },
            "productDiscounts": getItemDiscounts("Line Item", source),
            "shippingDiscounts": getItemDiscounts("Shipping", source),

            // "auditInfo": {
            //     "updateDate": "2017-09-14T20:12:30.325Z",
            //     "createDate": "2017-09-14T20:12:30.325Z",
            //     "updateBy": "2e6828691c134a5fb5da53a05cacdb39",
            //     "createBy": "2e6828691c134a5fb5da53a05cacdb39"
            // },
            // "shippingAmountBeforeDiscountsAndAdjustments": 0,
            // "weightedOrderDiscount": 0,
            // "weightedOrderShippingDiscount": 0,
            // "weightedOrderHandlingFeeDiscount": 0
            "itemState": STATUS[source.itemState] || source.itemState
        };

        return mapping;
    };

    return OMSOrderItemToOrderItem;
});