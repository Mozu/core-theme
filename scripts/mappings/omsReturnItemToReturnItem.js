define([
    'underscore'
], function (_) {

    var OMSReturnItemToReturnItem = function (source) {

        var STATUS = {
            ACCEPTED: 'Accepted',
            PENDING: 'Pending',
            REJECTED: 'Rejected'
        };
           
        var mapping = {
            "id": source.returnItemID,
            "orderItemId": source.orderItemID,
            "orderLineId": source.customData.lineId,
            "product": {},
            "reasons": [
                {
                    "reason": source.reason,
                    "quantity": source.quantity
                }
            ],
            "returnType": "Replace",
            "returnNotRequired": false,
            //"quantityReceived": 0,
            // "receiveStatus": "Waiting",
            //"quantityShipped": 2,
            //"replaceStatus": "Replaced",
            //"quantityRestockable": 0,
            "refundStatus": source.status,
            "quantityReplaced": 2,
            //"notes": [ ],
            //"productLossAmount": 280,
            // "shippingLossAmount": 4,
            "bundledProducts": []
        };

        return mapping;
    };

    return OMSReturnItemToReturnItem;
});