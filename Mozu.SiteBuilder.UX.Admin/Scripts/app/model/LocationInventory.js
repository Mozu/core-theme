/**
* @class Taco.model.LocationInventory
*/

Ext.define('Taco.model.LocationInventory', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.core.data.AjaxProxy'],
    fields: [{
        "name": "id",
        "type": "string",
        "convert": function(value, record) {
            return record.get("locationCode") + "." + record.get("productCode");
        },
        defaultValue: "",
        "persist": false
    }, {
        "name": "inventoryHandling",
        "type": "int",
        "useNull": true,
        persist:false
    }, {
        "name": "locationCode",
        "type": "string",
        "useNull": true,
        persist: true
    }, {
            "name": "locationName",
            "type": "string",
            "useNull": true,
            persist: false
        }, {
        "name": "stockAvailable",
        "defaultValue": 0,
        "type": "int",
        "useNull": true,
            persist: false
    }, {
        "name": "stockReserved",
        "defaultValue": 0,
        "type": "int",
        "useNull": true,
        persist: false,
        "convert": function (value, record) {
            if (record.raw) {
                return (record.raw.stockOnHand - record.raw.stockAvailable) + record.raw.stockOnBackOrder;
            }
            return 0;

        }
    }, {
        "name": "stockOnHand",
        "defaultValue": 0,
        "type": "int",
        "useNull": true,
         persist: true
    }, {
        "name": "productCode",
        "type": "string",
        "useNull": true,
        "persist": true
    }, {
        name: 'adjustmentType',
        type: "string",
        defaultValue: "Absolute",
        useNull: true
    }, {
        name: 'adjustmentValue',
        type: "int",
        defaultValue: "0",
        useNull: true
    }, 

    // is this still relevant?
    {
        "name": "parentProductCode",
        "type": "string",
        "useNull": true
    }, {
        "name": "optionValues",
        "type": "string",
        "useNull": true,
        persist:false
    }, {
        "name": "productImages",
        "type": "auto",
        "useNull": true,
        persist:false
    }, {
        "name": "productName",
        "type": "string",
        "useNull": true,
        "persist":false
    },
    {
        "name": "stockOnBackOrder",
        "type": "int",
        "useNull": true,
        "persist": false
    },
    {
        "name": "auditInfo",
        "type": "auto",
        "useNull": true,
        "persist": false
    }

    ],
    
    idProperty: 'id',
    
    getContextualValue:function(fieldName) {
        return this.get(fieldName);
    },

    proxy: {
        type: 'ajax',
        api: {
            //read: '/admin/Scripts/app/mocks/InventoryProducts.json',
            read: '/admin/app/LocationInventory/list',
            create: '/admin/app/LocationInventory/create',
            update: '/admin/app/LocationInventory/edit',
            destroy: '/admin/app/LocationInventory/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        },
         mockApi: {
            read: '/admin/Scripts/app/mocks/InventoryProducts.json'
        }
    },
    
    statics: {
        

        removeInventory: function (config) {
            var me = this,
                // array or a single record;
                records = config.records,
                store = config.store,
                requestConfig = {
                    success: function (response) {
                        
                    },
                    failure: function (response) {
                        
                    }
                };

            
            if (!records) { return }
            
            Ext.apply(requestConfig, config);

            var msg = 'Are you sure you want to remove this inventory item?';
            if (Ext.isArray(records) && records.length > 1) {
                msg = 'Are you sure you want to remove these inventory items?';
            }

            Ext.MessageBox.show({
                title: 'Remove Inventory',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: msg,
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        store.remove(records);
                        store.sync(requestConfig);
                    }
                }
            });
        }
    }
});