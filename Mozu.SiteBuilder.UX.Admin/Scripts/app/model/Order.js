/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Order', {
    extend: 'Taco.core.data.Model',
    /**********************************************************
    *   missing shipping discount object
    *   missing shipping method...
    *   
    *
    *
    ***************************************************************/



    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        
        //   adding unpersisted model member to organize the authorization information into a single object for use in xtemplates;
        {
            "name": "authorizationInfo",
            "type": "auto",
            "mapping": "paymentStatus",
            "persist":false,
            convert: function (v, record) {
                var payments = record.get("payments"),
                    totalAmount = record.get("total"),
                    amountCollected = 0,
                    captureAmount= 0,
                    canCapture = false,
                    authReady = false,
                    captureData=null;
                
                

                // check if there is an authorized credit card
                if (payments && payments[0]) {
                    if (payments[0]) {

                        captureData = payments[0];

                        var auth = payments[0];
                        if (auth.paymentType == "CreditCard" && auth.id) {
                            authReady = true;
                        }
                    }

                    // calculated total amount collected
                    for (var i = 0; i < payments.length; i++) {
                        amountCollected += payments[i].amountCollected;
                    }

                    //determine amount to capture;
                    

                }
                
                captureAmount = totalAmount - amountCollected;

                if (authReady && captureAmount > 0) {
                    canCapture = true;
                }
                
                return {
                    canCapture: canCapture,
                    amountCollected: amountCollected,
                    captureAmount: captureAmount,
                    captureData: captureData,
                    paymentType: (captureData) ? captureData.paymentType : "Check"
                };
            }
        },



        {
            "name": "orderNumber",
            "type": "int",
            "useNull": true
        },
        {
            "name": "createDate",
            "type": "date",
            "useNull": true,
        },
        {
            "name": "customerId",
            "type": "int",
            "useNull": true
        },
        {
            "name": "billingContact",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "ipAddress",
            "type": "string",
            "useNull": true
        },
        {
            "name": "items",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "subTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "discountTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "discountDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "shippingCost",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "shippingDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "shippingDiscount",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "shippingDiscountDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "shippingTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "taxTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "feeTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "adjustmentDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "adjustmentTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "total",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "customerNote",
            "type": "string",
            "useNull": true
        },
        // workflow shit
        {
            "name": "orderStatus",
            "type": "string",
            "useNull": true
        },
        {
            "name": "shippingStatus",
            "type": "string",
            "useNull": true
        },
        {
            "name": "paymentStatus",
            "type": "string",
            "defaultValue": "Card Authorized",
            "useNull": true
        },
        {
            "name": "availableActions",
            "type": "auto"
        },
        // payment shit, incomplete
        {
            "name": "lastValidationDate",
            "type": "date",
            "useNull": true
        },
        {
            "name": "expirationDate",
            "type": "date",
            "useNull": true
        },
        {
            "name": "payments",
            "type": "auto",
            "useNull": true,
            convert: function (v, record) {
                return v
            },
            "defaultValue": [
            /*
                {
                "transactionDate": "March 18, 2013",
                "paymentID": "337",
                "paidAmount": "100.00",
                "creditCard": "Visa xxxx-xxxx-xxxx-1111",
                "transactionID": "00158221"
            }, {
                "transactionDate": "March 17, 2013",
                "paymentID": "336",
                "paidAmount": "129.48",
                "creditCard": "Visa xxxx-xxxx-xxxx-1111",
                "transactionID": "00158220"
            }*/
            
            ]
        }, {
            "name": "unPackagedItems",
            "type": "array",
            "defaultValue": [
                
                {
                    "productName": "product 6",
                    "productCode": "xyz123",
                    "weight": "2.3",
                    "quantity": "3"
                }, {
                    "productName": "product 7",
                    "productCode": "xyz123",
                    "weight": "2.3",
                    "quantity": "3"
                }
                

            ]
        }, {
            "name": "packages",
            "type": "array",
            "defaultValue": [
                
                {
                    "orderId":"32165987",
                    "id": "o1004-p1",
                    "status": "NotShipped",
                    "shippingMethod": "FedEx 2nd Day Air",
                    "trackingNumber": "",
                    "hasShippingLabel": false,
                    "totalWeight": "23.4",
                    "totalQuantity": "6",
                    "items": [{
                        "orderItemId": "i123",
                        "productName": "product 1",
                        "productCode": "xyz123",
                        "weight": "2.3",
                        "quantity": "3"
                    }, {
                        "productName": "product 2",
                        "orderItemId": "i123",
                        "productCode": "xyz123",
                        "weight": "2.3",
                        "quantity": "3"
                    }]
                }, {
                    "orderId": "32165987",
                    "id": "o1004-p2",
                    "status": "Shipped",
                    "shippingMethod": "FedEx 2nd Day Air",
                    "trackingNumber": "Z9876514321987654",
                    "hasShippingLabel": true,
                    "totalWeight": "23.4",
                    "totalQuantity": "6",
                    "items": [{
                        "productName": "product 1",
                        "orderItemId": "i123",
                        "productCode": "xyz123",
                        "weight": "2.3",
                        "quantity": "3"
                    }, {
                        "productName": "product 2",
                        "orderItemId": "i123",
                        "productCode": "xyz123",
                        "weight": "2.3",
                        "quantity": "3"
                    }]
                }

            ]
        }
        
    ],
    
    /*
    getPayments: function () {
        debugger;
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.OrderPayment',
            associationKey: 'payments',
            foreignProperty: 'order'
        });
    },
    */


    associations: [
      
        {
            type: 'hasMany',
            model: 'Taco.model.OrderItem',
            name: "items"
        },
        {
            type: 'hasOne',
            model: 'Taco.model.Contact',
            name: 'billingContact'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.OrderPayment',
            name: 'payments'
        }
    ],


    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/Scripts/app/mocks/orders.json',
            read: '/admin/app/order/list',
            create: '/admin/app/order/create',
            update: '/admin/app/order/edit',
            destroy: '/admin/app/order/delete'
        },
        reader: {
            type: 'json',
            getResponseData: function (response) {
                // this is a temporary hack to get the proxy to use defaultValue for members that don't exist in the response
                var data = Ext.decode(response.responseText);
                if (data.items[0]) {
                    data.items[0].packages = data.items[0].packages || undefined;
                    data.items[0].unPackagedItems = data.items[0].unPackagedItems || undefined;
                }
                return this.readRecords(data);
            },
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },

    /**
     * service call to capture payment for an order     
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",
                amount:  "100.65",
                
                ...payment entity members...


            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
            },
            failure: function (response) {
                // error handling here
            },
            scope: this
        }

     *
     */
    capturePayment: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/capture',
            method: "POST"
            /*
            // sample of what you pass in 
            success: function(response) {
                var json = Ext.decode(response.responseText,true);
                if (!json || !json.success) {
                    //error
                }
            },
            failure : Ext.emptyFn
            */
            
        });

        Ext.Ajax.request(config);
    },

    /**
     * service call to add a new authorized payment transaction for an order     
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",

                Credit Card info TBD
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
            },
            failure: function (response) {
                // error handling here
            },
            scope: this
        }

     *
     */
    addPayment: function (config) {
        Ext.apply(config, {
            /*
            url: '/admin/app/order/list',
            method: "GET",
            params: {
                id: "o1001"
            }
            */
            url: '/admin/app/order/payment/create',
            method: "POST"
            
        });
        
        Ext.Ajax.request(config);
    },
    

    /**
     * service call to void an authorized payment transaction for an order     
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",
                paymentId: "987654321"
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
            },
            failure: function (response) {
                // error handling here
            },
            scope: this
        }

     *
     */
    voidTransaction: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/void',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to set the order as paid in full. This will happen when order is paid by check     
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321"
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
            },
            failure: function (response) {
                // error handling here
            },
            scope: this
        }

     *
     */
    paymentRecieved: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/recieved',
            method: "POST"
        });

        Ext.Ajax.request(config);
    }
});
