/**
 * @class Taco.model.OrderCustomer
 */
Ext.define('Taco.model.OrderCustomer', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            name: "firstName",
            type: "string"
        },
        {
            name: "lastName",
            type: "string"
        }
    ]
});
