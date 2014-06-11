/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Order', {
    requires: ['Taco.model.Return', 'Taco.model.ShippingMethod', 'Taco.store.ShippingMethods', 'Taco.model.OrderItem'],
    
    extend: 'Taco.core.data.Model',
    /**********************************************************    
    *   
    *
    *
    ***************************************************************/
    behaviors: {
        read: 73,
        create: 74,
        update: 75,
        destroy: 76,
        fulfill: 77,
        cancel: 78,
        applypayment: 79
    },
    
    requiredStores: [

        'Taco.store.ShippingMethods',
        'Taco.store.Channels',
        'Taco.store.Attributes'
    ],
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        
        {
            "name": "isDraft",
            "type": "boolean",
            "defaultValue": false
        },

        {
            "name": "hasDraft",
            "type": "boolean",
            "defaultValue": false
        },

        {
            name: 'tenantId',
            type: 'int'
        },

        {
            name: 'orderType',
            type: 'string'
        },

        {
            name: 'channelCode',
            type: 'string'
        },
        
        {
            name: 'channelName',
            type: 'string',
            persist:false,
            convert: function (val, record) {
                var channelCode = record.get("channelCode"),
                    store = Taco.core.data.StoreManager.getOrCreate('Taco.store.Channels'),
                    channelRecord = store.getById(channelCode),
                    name = "";
                
                if (channelRecord) {
                    name = channelRecord.get("name");
                }
                return name;
            }
        },
        {
            name: 'siteId',
            type: 'int',
            "useNull": true
        }, {
            name:"siteName",
            type:"string",
            convert: function (value, record) {
                var siteId = record.get('siteId'),
                    siteName = "";
                
                if (siteId) {
                    var site = Taco.app.context.findSite(siteId);
                    siteName = site.name;
                } 
                return siteName;
            }
        },

        {
            "name": "authorizationInfo",
            "type": "auto"
        },
        {
            "name": "orderSummary",
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
            dateFormat: 'c'
        },
        {
            "name": "updateDate",
            "type": "date",
            "useNull": true,
            dateFormat: 'c'
        },
        {
            "name": "customerId",
            "type": "int",
            "useNull": true
        },
        {
            "name": "billingContact",
            "type": "auto",
            "defaultValue": {}
        },
        {
            "name": "fulfillmentContact",
            "type": "auto",
            "defaultValue": {}
        },
        {
            "name": "ipAddress",
            "type": "string",
            "useNull": true
        },
        {
            name: 'attributes',
            type: 'auto',
            defaultValue: []
        }, 
        {
            "name": "items",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "orderDiscounts",
            "type": "auto",
            "default": []
        },
        {
            "name": "activeDiscountDescription",
            "type": "string",
            "useNull": true
        },
        
        {
            "name": "activeShippingDiscount",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingDiscounts",
            "type": "auto",
            "default": []
        },
        {
            "name": "shippingSubtotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingTotal",
            "type": "float",
            "useNull": true
        },
        /* sum cost of all products (no discounts applied) */
        {
            "name": "subtotal",
            "type": "float",
            "useNull": true
        },
        /* sum cost of all products with line-item discounts applied */
        {
            "name": "discountedSubtotal",
            "type": "float"
        },
        /* sum of all discounts */
        {
            "name": "discountTotal",
            "type": "float",
            "useNull": true
        },
        /* subtotal of order with discounts applied */
        {
            "name": "discountedTotal",
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
            "name": "handlingTotal",
            "type": "float",
            "useNull": true
        },

        

        {
            "name": "orderAdjustment",
            "type": "object",
            "defaultValue": {
                "amount":0,
                "description":"",
                "internalComment":""
            }        
        },

        // a helper member used to seperatly control whether the shipping adjustment is negative or positive;
        {
            "name": "orderAdjustmentIsNegative",
            "type": "boolean",
            "persist": false,
            "convert": function (value, record) {                
                // if set explicitly use the value
                if (Ext.isBoolean(value)) {
                    return value
                }

                // get the value from the field;
                var adj = record.get("orderAdjustment");
                if (adj && adj.amount && adj.amount > 0) {
                    return false
                }
                return true
            }
        },
        
        {
            "name": "shippingAdjustment",
            "type": "object",
            "defaultValue": {
                "amount": 0,
                "description": "",
                "internalComment": ""
            }
        },

        // a helper member used to seperatly control whether the shipping adjustment is negative or positive;
        {
            "name": "shippingAdjustmentIsNegative",
            "type": "boolean",
            "persist": false,
            "convert": function (value, record) {
                // if set explicitly use the value
                if (Ext.isBoolean(value)) {
                    return value
                }
                var adj = record.get("shippingAdjustment");
                if (adj && adj.amount && adj.amount > 0) {
                    return false
                }
                return true
            }
        },



        // deprecated?
        {
            "name": "adjustmentDescription",
            "type": "string",
            "useNull": true
        },
        
        // deprecated?
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
            "name": "returnStatus",
            "type": "string",
            "useNull": true,
            defaultValue:null
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
        

        // the total number of items that will be fulfilled via direct ship
        {
            "name": "totalDirectShipItems",
            "type": "int",
            "useNull": false,
            convert: function (v, record) {
                var itemsNotShipped = record.get("itemsNotShipped") || 0;
                var itemsShipped = record.get("itemsShipped")|| 0;
                return itemsNotShipped + itemsShipped
            }
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
            "name": "fulfillmentStatus",
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
            "type": "auto",
            "default": []
        },
        {
            "name": "lastValidationDate",
            "type": "date",
            "useNull": true,
            dateFormat: 'c'
        },
        {
            "name": "expirationDate",
            "type": "date",
            "useNull": true,
            dateFormat: 'c'
        },
        
        {
            "name": "payments",
            "type": "auto",
            "useNull": true,
            "defaultValue": []
        }, {
            "name": "unpackagedItems",
            "type": "array",
            "defaultValue": []
        },

        {
            "name": "packages",
            "type": "array",
            convert: function (v, record) {
                if (!Ext.isArray(v)) {
                    v = [];
                }
                return v;
            }
        },

        // array of items that are pending in the pickup Instore pickup section and have not been added to a pickup yet;
        {
            "name": "unpickedupItems",
            "type": "array",
            "defaultValue": []
        },
        
        // like a package but for people that can't wait a few days for direct ship. 
        {
            "name": "pickups",
            "type": "array"
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
                    if (packages[i].status == "NotFulfilled") {
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
                    if (packages[i].status == "Fulfilled") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        },
        

        // NEW FIELD

        // the total number of items that will be fulfilled via in store pickup
        {
            "name": "totalPickupItems",
            "type": "int",
            "useNull": false,
            convert: function (v, record) {
                var itemsNotPickedup = record.get("itemsNotPickedup") || 0;
                var itemsPickedup = record.get("itemsPickedup") || 0;
                return itemsNotPickedup + itemsPickedup;
            }
        },
        
        // NEW FIELD
        {
            "name": "itemsNotPickedup",
            defaultValue: 0,
            "type": "int",
            "useNull": false
        },
        
        // NEW FIELD
        {
            "name": "itemsPickedup",
            defaultValue: 0,
            "type": "int",
            "useNull": false
        },
        
        // NEW FIELD
        {
            "name": "instorePackages",
            "type": "array",
            persist: false,
            convert: function (v, record) {


                var packages = record.get("pickups");
                var retVal = [];

                for (var i = 0; i < packages.length; i++) {
                    if (packages[i].status == "Fulfilled") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        },
        
        // helper field. ui iterates on unshipped packages in multiple places
        {
            "name": "pendingPickups",
            "type": "array",
            persist: false,
            convert: function (v, record) {
                var packages = record.get("pickups");
                var retVal = [];

                for (var i = 0; i < packages.length; i++) {
                    if (packages[i].status == "NotFulfilled") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        },
        

        // helper field. ui iterates on shipped packages in multiple places
        {
            "name": "pickedupPackages",
            "type": "array",
            persist: false,
            convert: function (v, record) {
                var packages = record.get("pickups");
                var retVal = [];

                for (var i = 0; i < packages.length; i++) {
                    if (packages[i].status == "Fulfilled") {
                        retVal.push(packages[i]);
                    }
                }
                return retVal;
            }
        },

        {
            "name": "shippingMethodName",
            "type": "string",
            persist: false
        },
        {
            "name": "shippingMethodCode",
            "type": "string",
            persist: false
        },
        {
            "name": "validationResults",
            "type": "any",
            persist: false
        },
        {
            "name": "fraudScore",
            "type": "int",
            persist: false,
            "useNull": true
        }
    ],
    
    reload: function (config) {
        var me = this,
            config = config || {},
            modifiedNames = [],
            loadConfig = Ext.applyIf(
             {
                 bypassCache: true,
                 success: function (record) {




                     if (record.getId() == me.getId()) {
                         me.beginEdit();
                         modifiedNames = me.copyFrom(record);

                         me.associations.each(function (association) {
                             var reader = association.getReader();
                             if (reader) {
                                 association.read(me, reader, me.get(association.name));
                             }
                         });

                         me.endEdit(false, modifiedNames);
                         me.commit(false, modifiedNames);
                     }

                     if (config.success) {
                         Ext.callback(config.success, config.scope, arguments);
                     }
                     me.fireEvent("reload", me);
                 }
             },
             config
            );




        //tbd: remove this


        this.self.load(me.getId(), loadConfig);
    },
    getAttributes: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ExtensibleAttributeValue',
            associationKey: 'attributes',
            foreignProperty: 'account'
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

    associations: [      
        // Note:  (simeon) I have intentially not created models for package, shipment, unpackagedItems and packagedItems
        // the entire order ui needs to be replaced with every change of order entity and its associated entities due to the display of order status in just about every component.
        // by treating this sub entity data as json and arrays, it avoids extjs auto creating of stores for each associated sub entity;
        // for shipping and its related views, the data is passed to the view which sets up its own stores as needed;

        {
            type: 'hasMany',
            model: 'Taco.model.OrderItem',
            name: "items",
            reader: 'json'
        },
        {
            type: 'hasOne',
            model: 'Taco.model.Contact',
            name: 'billingContact',
            reader: 'json'
        },
        {
            type: 'hasOne',
            model: 'Taco.model.Contact',
            name: 'fulfillmentContact',
            reader: 'json'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.OrderPayment',
            name: 'payments',
            reader:'json'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.Return',
            primaryKey: 'id',
            foreignKey: 'originalOrderId',
            autoLoad: false,
            storeConfig: {
                remoteFilter:true
            },
            name: 'getReturnsStore'
        },
        
        {
            type: 'hasOne',
            model: 'Taco.model.OrderShippingDiscount',
            name: 'activeShippingDiscount'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.OrderShippingDiscount',
            name: 'shippingDiscounts',
            reader:"json"
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
    





    /*
     ****************************************************
     *   Begin order payment service interaction methods
     ****************************************************
     */


//     onAjaxSuccess: function(callback, response) {
//        var me = this,
//            reader = me.getProxy().getReader(),
//            results = reader.read(response),
//            newRecord = results && results.records ? results.records[0] : null;
//
//
//        // set all the new data
//        me.set(newRecord.data);
//
//        // for each of the associations, set all their new data
//        me.items().loadData(me.get('items'));
//        me.items().each(function(item) {
//            item.discounts().loadData(item.get('discounts'));
//            item.shippingDiscounts().loadData(item.get('shippingDiscounts'));
//        });
//
//        me.payments().loadData(me.get('payments'));
//        me.payments().each(function(payment) {
//            payment.interactions().loadData(payment.get('interactions'));
//        });
//        me.shippingDiscounts().loadData(me.get('shippingDiscounts'));
//
//        // commit the changes.
//        me.commit();
//
//        if (callback) {
//            callback(response);
//        }
//     },
//
//     onAjaxFailure: function(callback, response) {
//        var me = this,
//            json = Ext.decode(response.responseText, true);
//        if (callback) {
//            callback(response);
//        }
//     },


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
    
    getShippingMethods:function () {
        if (!this.shippingMethods) {
            this.shippingMethods = Ext.create('Ext.data.Store', {
                model: 'Taco.model.ShippingMethod',
                proxy: {
                    type: 'ajax',
                    url: '/admin/app/order/shipping/runtimemethods?orderId='+ this.getId(),
                    reader: {
                        type: 'json',
                        root: 'items',
                        successProperty: 'success'
                    }
                }
            });
        }
        return this.shippingMethods;
    },

    capturePayment: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/capture',
            method: "POST"            
        });

        
        config.errorMsg = config.errorMsg || "Error capturing payment";
        this.addErrorHandling(config);
        

        Ext.Ajax.request(config);
    },

    authorize: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/authorize',
            method: 'POST'        
        });

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || "Error authorizing";
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },

    authAndCapture: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/authAndCapture',
            method: 'POST'
        });

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || "Error completing authorize and capture payment";
        this.addErrorHandling(config);

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
        
        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || "Error adding payment";
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },
    
    setBillingInfo: function(config) {
        Ext.apply(config, {
            url: '/admin/app/order/setbillinginfo',
            method: 'POST'
        });

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || "Error setting billing information;";
        this.addErrorHandling(config);

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

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || "Error voiding transaction;";
        this.addErrorHandling(config);

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

        config.errorMsg = config.errorMsg || "Error requesting check";
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },

    /**
     * ensures that a date property is formatted correctly if it exists
     */
    ensureDate: function(config, propertyName)
    {
        var d;

        if (config && config[propertyName])
        {
            try {
                d = new Date( config[propertyName] );
                config[propertyName] = Ext.Date.format(d, 'c');
            }
            catch(e) {
                delete config[propertyName];
            }
        }
    },

    capturePaymentManual: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/capture',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error capturing manual payment";
        me.addErrorHandling(config);

        me.ensureDate(config, 'interactionDate');
        Ext.Ajax.request(config);
    },

    voidPaymentManual: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/void',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error voiding manual payment";
        me.addErrorHandling(config);

        me.ensureDate(config, 'interactionDate');
        Ext.Ajax.request(config);
    },

    creditPaymentManual: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/credit',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error crediting manual payment";
        me.addErrorHandling(config);

        me.ensureDate(config, 'interactionDate');
        Ext.Ajax.request(config);
    },

    rollbackTransaction: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/rollback',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error rolling back transaction;";
        me.addErrorHandling(config);

        Ext.Ajax.request(config);
    },

    addManualPayment: function (config) {
        var me = this;
        Ext.apply(config, {
            url: '/admin/app/order/payment/manual/create',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error adding manual payment";
        me.addErrorHandling(config);

        me.ensureDate(config, 'interactionDate');
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
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error issuing credit";
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },

    applyCheck: function (config) {

        Ext.applyIf(config, {
            url: '/admin/app/order/payment/applycheck',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error applying check";
        this.addErrorHandling(config);


        Ext.Ajax.request(config);
    },

    declineCheck: function (config) {

        Ext.applyIf(config, {
            url: '/admin/app/order/payment/declinecheck',
            method: "POST"
        });

        config.errorMsg = config.errorMsg || "Error declining check";
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },




    /*
     ****************************************************
     *   End order payment service interaction methods
     ****************************************************
     */



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
    





































    /*
    ***************************
    *  BEGIN PICKUP END POINT   
    *****************************
    */


    /**
     * service call to create a pickup
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
    createPickup: function (config) {
        var me = this;
        
        config.errorMsg = "Error creating pickup";
        me.addErrorHandling(config);
        
        Ext.apply(config, {
            url: '/admin/app/order/fulfillment/pickup/create',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /**
     * service call to delete a pickup
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
    deletePickup: function (config) {
        var me = this;
        config.errorMsg = "Error deleting pickup";

        me.addErrorHandling(config);
        
        Ext.apply(config, {
            url: '/admin/app/order/fulfillment/pickup/delete',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /**
     * service call to move items into a pickup
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
    movePickupItems: function (config) {
        var me = this;
        config.errorMsg = "Error moving pickup items";

        me.addErrorHandling(config);

        Ext.apply(config, {
            url: '/admin/app/order/fulfillment/pickup/moveitems',
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
    markPickupFulfilled: function (config) {
        var me = this;
        config.errorMsg = "Error marking pickup fulfilled";

        me.addErrorHandling(config);

        Ext.apply(config, {
            url: '/admin/app/order/fulfillment/pickup/markfulfilled',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /**
     * service call to mark a package as ready
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
    markPickupReady: function (config) {
        var me = this;
        config.errorMsg = "Error marking pickup ready";

        me.addErrorHandling(config);

        Ext.apply(config, {
            url: '/admin/app/order/shipping/pickup/markready',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },


    /*
    ***************************
    * END PICKUP END POINT   
    *****************************
    */






















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
    * service call to change the packagomg type
    * @param {Object} config  A configuration object     
    * config object:
    * 
       {
           jsonData: [{
               ... package entity ...
           }],
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
    changePackagingType: function (config) {
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

        config.errorMsg = config.errorMsg || "Error changing tracking number";
        this.addErrorHandling(config);

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
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/items/remove',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to edit an order item. specificallly edit of quantity
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
    editOrderItemQuantity: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/items/editquantity',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    /**
     * service call to edit the fulfillmentmethod and fulfillmentlocationcode of an order item.
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",
                orderItems: [
                    {
                        ... order item entity you want to edit  ...
                        This will typically contain modified fulfillmentmethod or fulfillmentlocationcode
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
    editOrderItemFulfillment: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/items/editfulfillment',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    /**
     * service call to edit an order item. specificallly edit of quantity
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
    editOrderItemPrice: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/items/editprice',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to edit an order item. specificallly edit of fulfillmentMethod
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                orderItems: [
                    {
                        ... order item entity you want to edit  ...
                        This will typically contain modified fulfillment method
                    }
                ]
            },
            success: function (response) {
                // success handlin,g here
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
    editOrderItemFulfillmentMethod: function (config) {
        var me = this;

        config.errorMsg = config.errorMsg || "Error changing fulfillment method";

        me.addErrorHandling(config);
       
        Ext.apply(config, {
            url: '/admin/app/order/items/editfulfillmentmethod',
            params: { 'draft': me.get('isDraft') },
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
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/items/add',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
//    addOrderItem: function (orderItems, config) {
//        var me = this,
//            isDraft = me.get('isDraft'), 
//            baseUrl = '/admin/app/order/items/add',
//            url = isDraft ? baseUrl + "?draft=true" : baseUrl,
//            data = {
//                orderId: me.getId(),
//                orderItems: orderItems
//            };
//
//        if (!config)
//            config = {};
//
//        Ext.Ajax.request({
//            url: url,
//            method: 'POST',
//            jsonData: data,
//            success: Ext.Function.pass(me.onAjaxSuccess, config.success),
//            failure: Ext.Function.pass(me.onAjaxFailure, config.failure),
//            scope: me
//        });
//    },
    
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
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/addcoupon',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to suppress an order discount. This will cause the service to look for other discounts to fall back to. If another discount exists, it will come back as active and the suppressed discount will be inactive;
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                orderItemId: "98475",  // optional orderItemId when suppressing order item. not sent when suppressing order level discounts
                discountIds: ["987654"]
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
    suppressDiscount: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/suppressdiscount',
            params: { 'draft': me.get('isDraft') },
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to activate a previously suppressed order discount;
     * @param {Object} config  A configuration object     
     * config object:
     * 
        {
            jsonData: {
                orderId: "987654321",                
                orderItemId: "98475",  // optional orderItemId when suppressing order item. not sent when suppressing order level discounts
                discountIds: ["987654"]
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
    activateDiscount: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/activatediscount',
            params: { 'draft': me.get('isDraft') },
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
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/order/adjustment',
            params: { 'draft': me.get('isDraft') },
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
            url: '/admin/app/order/commitdraft',
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
            url: '/admin/app/order/deletedraft',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },
    
    /**
     * service call to accept an order.
     * you need to accept an order that is in 'PendingReview' state.
     */
    acceptOrder: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/accept',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    /**
    * service call to cancel an order.
    * @param {Object} config  A configuration object
    * config object:
    * 
       {
           jsonData: {
               orderIds: ["987654321"]
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
    cancelOrder: function (config) {
        Ext.apply(config, {
            url: '/admin/app/order/cancel',
            method: "POST"
        });

        Ext.Ajax.request(config);
    },

    saveAttributes: function (config) {

        Ext.applyIf(config, {
            url: '/admin/app/order/attributes/update',
            method: "POST",
            jsonData: {
                orderId: this.getId(),
                attributes: this.get('attributes')
            }
        });
        Ext.Ajax.request(config);
    }
}, function () {

    // console.log(arguments, "orderz", Taco.model.Order);
   
});
