/**
* @class Taco.model.InventoryProduct
* @author Jimmy Sanford
* A product or product variation with manageable inventory.
*/


Ext.define('Taco.model.InventoryProduct', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.core.data.AjaxProxy'],
    fields: [{
        "name": "inventoryHandling",
        "type": "int",
        "useNull": true,
        persist:false
    }, {
        "name": "stockOnHand",
        "type": "int",
        "useNull": true,
        persist:true
    }, {
        "name": "stockOnHandAdjustment",
        "type": "any",
        "useNull": true
    }, {
        "name": "productCode",
        "type": "string",
        "useNull": true
    }, {
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
        "useNull": true
    }],
    idProperty: 'productCode',
    getContextualValue:function(fieldName) {
        return this.get(fieldName);
    },
    proxy: {
        type: 'ajax',
        api: {
           // read: '/admin/Scripts/app/mocks/InventoryProducts.json'
            read: '/admin/app/inventoryProduct/list',
            update: '/admin/app/inventoryProduct/edit'
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
    }
});