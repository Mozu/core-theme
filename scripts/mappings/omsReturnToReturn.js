define([
    'underscore',
    'mappings/omsReturnItemToReturnItem'
], function (_, omsReturnItemToReturnItem) {
    
    var OMSReturnToReturn = function (source){

        var STATUS = {
            OPEN: 'open',
            PROCESSING: 'Processing',
            CLOSED: 'Closed'
        };

        var externalOrderIDSplit = source.externalOrderID.split('[.-]+', 'g');

        function tenatId() {
            return externalOrderIDSplit[0];
        }

        function orderNumber() {
            var orderNum = externalOrderIDSplit[2];
            return (orderNum) ? orderNum : source.orderID;
        }

        function parentCheckoutNumber(){
            return externalOrderIDSplit[1];
        }

        function fulfillmentId() {
            return externalOrderIDSplit[3];
        }
        
        function mapReturnItems() {
            return _.map(source.items, function (item) {
                return omsReturnItemToReturnItem(item);  
            });
        }

        var mapping = {
        
            "returnNumber": source.returnID,
            "id": source.customData.ngReturnId, 
            "locationCode": source.returnLocation,
            //"originalOrderId": "08fea67b5a573404c0315461000043df",
            //"originalOrderNumber": 99,
            //"returnOrderId": "0a0bbdaa55710e4f7caa4e7d000043df",
            //"currencyCode": "USD",
            "status": STATUS[source.status],
            //"receiveStatus": "Waiting",
            //"refundStatus": "NotRequested",
            //"replaceStatus": "FullyReplaced",
            "items": mapReturnItems(),
            //"returnType": "Replace",
            "refundAmount": source.returnTotal - source.returnReductionTotal,
            
            "packages": [],
            //"productLossTotal": 280,
            //"shippingLossTotal": 4,
            //"lossTotal": 284,
            //"shippingLossTaxTotal": 0,
            //Extras
            'omsReturn' : source
        };

        //var order = Object.assign(source, mapping);
        return mapping;
    };

    return OMSReturnToReturn;
});