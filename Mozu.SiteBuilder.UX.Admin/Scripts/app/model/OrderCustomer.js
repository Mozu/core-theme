/**
 * @class Taco.model.OrderCustomer
 */
Ext.define('Taco.model.OrderCustomer', {
    extend: 'Taco.core.data.Model',
    requires: ['Ext.data.association.BelongsTo'],

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "firstName",
            "type": "string"
        },
        {
            "name": "lastName",
            "type": "string"
        },
        {
            "name": "customerSince",
            "type": "date",
            "useNull": true
        },
        {
            "name": "totalOrders",
            "type": "int"
        },
        {
            "name": "totalSpent",
            "type": "float",
            "defaultValue": 0
        },
        {
            "name": "groups",
            "type": "auto",
            "defaultValue": []
        }

    ],

    associations: [
        {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ]
});
