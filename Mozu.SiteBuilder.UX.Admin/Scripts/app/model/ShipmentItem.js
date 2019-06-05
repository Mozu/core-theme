Ext.define('Taco.model.ShipmentItem', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Ext.data.association.HasOne',
        'Ext.data.association.BelongsTo'
    ],
    fields: [
        {
            "name": "lineId",
            "type": "int",
            "useNull": false
        },
        {
            "name": "parentId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "variationProductCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "optionAttributeFQN",
            "type": "string",
            "useNull": true
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            "name": "fulfillmentLocationCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "imageUrl",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isTaxable",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "quantity",
            "type": "int",
            "useNull": true
        },
        {
            "name": "unitPrice",
            "type": "float"
        },
        {
            "name": "itemTax",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shipping",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingTax",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handling",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handlingTax",
            "type": "float",
            "useNull": true
        }, {
            "name": "duty",
            "type": "float",
            "useNull": true
        },
        {
            "name": "ShipmentDiscount",
            "type": "auto",
            "defaultValue": []
        }
    ]
});