/**
* @class Taco.model.BundledProduct
* The Bundled Product model
*/

Ext.define('Taco.model.BundledProduct', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [
        {
            // this is a helper field for triggering a persistance when the order of the grid items gets changed. this value is not persisted;
            name: 'index',
            type: 'int'
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "price",
            "type": "float",
            "useNull": true
        },
        {
            "name": "salePrice",
            "type": "float",
            "useNull": true
        },
        {
            "name": "packageWeight",
            "type": "float",
            "useNull": true
        },
        {
            "name": "packageLength",
            "type": "float",
            "useNull": true
        },
        {
            "name": "packageWidth",
            "type": "float",
            "useNull": true
        },
        {
            "name": "packageHeight",
            "type": "float",
            "useNull": true
        },
        {
            "name": "quantity",
            "type": "int",
            defaultValue: 1
        },
        {
            "name": "lineId",
            "type": "int",
            defaultValue: 1
        },
        {
            "name": "fulfillmentStatus",
            "type": "string",
            "useNull": true
        },
        {
            name: "fulfillmentTypesSupported",
            type: "auto",
            defaultValue: ['DirectShip']
        },
        {
            name: "stock",
            type: "auto",
            defaultValue: []
        }
    ],
    idProperty: 'productCode',
    proxy: {
        type: 'memory'
    }
});