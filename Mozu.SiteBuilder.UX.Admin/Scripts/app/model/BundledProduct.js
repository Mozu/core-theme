/**
* @class Taco.model.BundledProduct
* The Bundled Product model
*/

Ext.define('Taco.model.BundledProduct', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [
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
        }
    ],
    idProperty: 'productCode',
    proxy: {
        type: 'memory'
    }
});