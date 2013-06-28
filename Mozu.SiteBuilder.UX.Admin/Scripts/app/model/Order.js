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
        {
            name: 'tenantId',
            type: 'int'
        },
        {
            name: 'siteGroupId',
            type: 'int'
        },
        {
            name: 'siteId',
            type: 'int',
            "useNull": true
        },
        //   adding unpersisted model member to organize the authorization information into a single object for use in xtemplates;
        {
            "name": "authorizationInfo",
            "type": "auto"
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
            "default": []
        },
        {
            "name": "shippingContact",
            "type": "auto",
            "default": []
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
            "name": "subtotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "orderDiscountTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "orderDiscountDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "shippingMethodCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "shippingMethodName",
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
        {
            "name": "itemsOrdered",
            "type": "int",
            "useNull": false
        },
        {
            "name": "itemsNotShipped",
            "type": "int",
            "useNull": false
        },
        {
            "name": "itemsShipped",
            "type": "int",
            "useNull": false
        },
        // workflow 
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
        // payment , incomplete
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
                return v;
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
            "name": "unpackagedItems",

            "type": "array",
            convert: function (v, record) {
                return v;
            },
            "defaultValue": [
                /*                
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
                */
            ]
        }, {
            "name": "packages",
            "type": "array",
            convert: function (v, record) {

                if (!Ext.isArray(v)) {
                    v = [];
                }
                // adding test data;
                var shippedPackageCount = 0;
                var unShippedPackageCount = 0;


                for (var i = 0; i < shippedPackageCount; i++) {

                    v.push({
                        "orderId": "3216598",
                        "id": "o1004-p" + i,
                        "status": "Shipped",
                        "shippingMethod": "FedEx 2nd Day Air",
                        "trackingNumber": "",
                        "hasShippingLabel": false,
                        "totalWeight": "23.4",
                        "totalQuantity": "6",
                        "items": [
                            {
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
                            }
                        ]
                    });
                }

                for (var i = 0; i < unShippedPackageCount; i++) {

                    v.push({
                        "orderId": "3216598",
                        "id": "o1004-p" + i,
                        "status": "NotShipped",
                        "shippingMethod": "FedEx 2nd Day Air",
                        "trackingNumber": "",
                        "hasShippingLabel": false,
                        "totalWeight": "23.4",
                        "totalQuantity": "6",
                        "items": [
                            {
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
                            }
                        ]
                    });
                }


                return v;


            }
        },        
        // helper field. ui iterates on unshipped packages in multiple places
        {
            "name": "unShippedPackages",
            "type": "array",
            persist: false,
            convert: function (v, record) {
                var packages = record.get("packages");
                var retVal = [];

                for (var i = 0; i < packages.length; i++) {
                    if (packages[i].status == "NotShipped") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        },
        // helper field. ui iterates on shipped packages in multiple places
        {
            "name": "shippedPackages",
            "type": "array",
            persist: false,
            convert: function (v, record) {
                var packages = record.get("packages");
                var retVal = [];

                for (var i = 0; i < packages.length; i++) {
                    if (packages[i].status == "Shipped") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        }
    ],
    


    
    /*
    getPayments: function () {
        
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.OrderPayment',
            associationKey: 'payments',
            foreignProperty: 'order'
        });
    },
    */

    associations: [      
        // Note:  (simeon) I have intentially not created models for package, shipment, unpackagedItems and packagedItems
        // the entire order ui needs to be replaced with every change of order entity and its associated entities due to the display of order status in just about every component.
        // by treating this sub entity data as json and arrays, it avoids extjs auto creating of stores for each associated sub entity;
        // for shipping and its related views, the data is passed to the view which sets up its own stores as needed;

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
            type: 'hasOne',
            model: 'Taco.model.Contact',
            name: 'shippingContact'
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
                    data.items[0].packages = data.items[0].packages || [];
                    data.items[0].unpackagedItems = data.items[0].unpackagedItems || undefined;
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
    },


    /*
     *
     *
     *  Begin order shipping action methods
     *
     *
     *    
     */

     

    /**
     * service call to create a package
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                package: {
                   ... package endity ...

                    
                    items: [],
                    orderId: "02baa4864fdce01ec8d8cc0000000059"
                    
                }
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
    createPackage: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/create',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /**
     * service call to create a package
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId : "asdf",
                packageIds["654"]
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
    deletePackage: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/delete',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /**
     * service call to move items into a package
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",
                sourcePackageId : "",
                destinationPackageId : "",
                items: [{
                    ... order item entity ...
                }]
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
    movePackageItems: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/moveitems',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to mark a package as shipped
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                packageIds: ["987654"]
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
    markPackagesShipped: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/markshipped',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to change the shipping method
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                ... package entity ...
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
    changeShippingMethod: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/edit',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    /**
     * service call to change the tracking number
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                ... package entity ...
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
    changeTrackingNumber: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/shipping/package/edit',
            method: "POST"
        });

        Ext.Ajax.request(config);
    }
});