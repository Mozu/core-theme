/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Return', {
    extend: 'Taco.core.data.Model',
    requires:['Taco.model.ReturnItem'],
   
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "availableActions",
            "type": "auto",
            "useNull": true,
            defaultValue: []

        },
        {
            "name": "returnNumber",
            "type": "int",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "originalOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "returnOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "status",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "items",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "notes",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        },
         {
             "name": "rmaDeadline",
             "type": "datetime",
             "useNull": true,
             defaultValue: null
         },
         {
             "name": "type",
             "type": "string",
             "useNull": true,
             defaultValue: null
         },
         {
             "name": "payments",
             "type": "auto",
             "useNull": true,
             defaultValue: null
         },
         {
             "name": "totalLossAmount",
             "type": "number",
             "useNull": true,
             defaultValue: null
         }
    ],
    
    getItems: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ReturnItem',
            associationKey: 'items',
            foreignProperty: 'return'
        });
    },
   
    
    
    /*
    getPayments: function () {
        
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.OrderPayment',
            associationKey: 'payments',
            foreignProperty: 'order'
        });
    },
    */

    //associations: [
    //    // Note:  (simeon) I have intentially not created models for package, shipment, unpackagedItems and packagedItems
    //    // the entire order ui needs to be replaced with every change of order entity and its associated entities due to the display of order status in just about every component.
    //    // by treating this sub entity data as json and arrays, it avoids extjs auto creating of stores for each associated sub entity;
    //    // for shipping and its related views, the data is passed to the view which sets up its own stores as needed;

    //    {
    //        type: 'hasMany',
    //        model: 'Taco.model.OrderItem',
    //        name: "items",
    //        reader: 'json'
    //    },
    //    {
    //        type: 'hasOne',
    //        model: 'Taco.model.Contact',
    //        name: 'billingContact',
    //        reader: 'json'
    //    },
    //    {
    //        type: 'hasOne',
    //        model: 'Taco.model.Contact',
    //        name: 'shippingContact',
    //        reader: 'json'
    //    },
    //    {
    //        type: 'hasMany',
    //        model: 'Taco.model.OrderPayment',
    //        name: 'payments',
    //        reader: 'json'
    //    },
    //    {
    //        type: 'hasOne',
    //        model: 'Taco.model.OrderShippingDiscount',
    //        name: 'activeShippingDiscount'
    //    },
    //    {
    //        type: 'hasMany',
    //        model: 'Taco.model.OrderShippingDiscount',
    //        name: 'shippingDiscounts'
    //    }
    //],

    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/Scripts/app/mocks/orders.json',
            read: '/admin/app/return/list',
            create: '/admin/app/return/create',
            update: '/admin/app/return/edit'
        },
        reader: {
            type: 'json',
            //getResponseData: function (response) {
            //    // this is a temporary hack to get the proxy to use defaultValue for members that don't exist in the response
            //    var data = Ext.decode(response.responseText);
            //    if (data.items[0]) {
            //        data.items[0].packages = data.items[0].packages || [];
            //        data.items[0].unpackagedItems = data.items[0].unpackagedItems || undefined;
            //    }
            //    return this.readRecords(data);
            //},
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },
    


    /*
     ****************************************************
     *   Begin order payment service interaction methods
     ****************************************************
     */



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
    

    performAction: function (action, config) {
        var me = this;
        if (config.success) {
            config.success2 = config.success;
            config.scope2 = config.scope;
        }
        if (config.failure) {
            config.failure2 = config.failure;
            config.scope2 = config.scope;
        }
        Ext.applyIf(config, {
            jsonData : {
                actionName: action,
                returnIds:[this.getId()]
            },
            success: function(response){
                var json = Ext.decode(response.responseText, true);
                if (json.items && json.items.length) {
                    me.set(json.items[0]);
                    me.commit();
                }
                if (config.success2) {
                    config.success2.apply(config.scope2 || me, arguments);
                }
                
            },
            failure:function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;
                if (config.failure2) {
                    config.failure2.apply(config.scope2 || me, [response, options, json]);
                } else {
                    msg = json && json.Message ? json.Message : 'Error performing action:  ' + action;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            },
            url: '/admin/app/return/action',
            method: "POST"
            
        });

        Ext.Ajax.request(config);
    },
    


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
    requestCheck: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/requestcheck',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    capturePaymentManual: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/capture',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    voidPaymentManual: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/void',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    creditPaymentManual: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/credit',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    editTransaction: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/edittransaction',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    addManualPayment: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/create',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    /**
     * service call to add a credit on the order     
     * @param {Object} config  A configuration object     
     * config object:
        {
            jsonData: {
                orderId: "987654321",
                amount:  "100.65",
                payment:  {
                    ...payment entity members...
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

        */
    issueCredit: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/credit',
            method: "POST",
        });
        Ext.Ajax.request(config);
    },

    applyCheck: function (config) {

        Ext.applyIf(config, {
            url: '/admin/app/order/payment/applycheck',
            method: "POST",
        });
        Ext.Ajax.request(config);
    },

    

    /*
     ****************************************************
     *   Begin order shipping service interaction methods
     ****************************************************
     */

     

    /**
     * service call to create a package
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                package: {
                   ... package entity ...
                    
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
    },
    



    /*
     ****************************************************
     *   Begin order detail service interaction methods
     ****************************************************
     */
    



    /**
     * service call to remove an order item
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                orderItemIds: ["987654"]
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
    removeOrderItem: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/orderitem/remove',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to edit an order item. specificallly edit of quantity and price
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                orderItems: [
                    {
                        ... order item entity you want to edit  ...
                        This will typically contain modified quantity or price
                    }
                ]
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
            },s
            scope: this
        }

     *
     */
    editOrderItem: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/orderitem/update',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    

    /**
     * service call to add order items
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",
                orderItems: [
                    // When the product requires configuration
                    {   ...configurationData...  },
                    
                    // When product doesn't require configuration the package contains productCode and quantity
                    {
                        productCode: "asdf",
                        quantity: 1
                    }
                ]
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
    addOrderItem: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/items/add',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to add coupon to the order
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {   
                orderId: "987654321",                
                coupons: ["987654"]
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
    addOrderCoupon: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/addordercoupon',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to suppress an order coupon. This will cause the service to look for other coupons to fall back to. If another coupon exists, it will come back as active and the suppress coupon will be inactive;
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                coupons: ["987654"]
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
    suppressOrderCoupon: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/suppressordercoupon',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to update an order adjustment. A $ amount to reduce the total of the order
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {   
                // include one or both adjustment types.
                orderId: "987654321",
                orderAdjustment: {
                    amount: 0.00,
                    description: "",
                    internalComment: ""
                },

                // include one or both adjustment types.
                shippingAdjustment: {
                    amount: 0.00,
                    description: "",
                    internalComment: ""
                }
            },
            success: function (response) {
                // success handling here
              so   var json = Ext.decode(response.responseText, true);
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
    updateOrderAdjustment: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/updateorderadjustment',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    

    /**
     * service call to apply the draft order on top of the actual order.
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321"
            },
            success: function (response) {
                // success handling here
              so   var json = Ext.decode(response.responseText, true);
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
    saveDraftOrder: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/savedraftorder',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
    * service call to remove(delete) the draft order.
    * @param {Object} config  A configuration object
    * config object:
    * 
       {
           jsonData: {
               orderId: "987654321"
           },
           success: function (response) {
               // success handling here
             so   var json = Ext.decode(response.responseText, true);
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
    removeDraftOrder: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/removedraftorder',
            method: "POST"
        });

        Ext.Ajax.request(config);
    }
});