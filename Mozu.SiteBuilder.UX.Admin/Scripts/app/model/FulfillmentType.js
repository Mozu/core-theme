/**
 * @class Taco.model.FulfillmentType
 */
Ext.define('Taco.model.FulfillmentType', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            "name": "id",
            "type": "int"
        },{
            "name": "shippingRequired",
            "type": "boolean"
        },{
            "name": "code",
            "type": "string"
        }, {
            "name": "name",
            "type": "string"
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/app/fulfillmentType/list',
            read: '/admin/Scripts/app/mocks/fulfillmentTypes.json',
            create: '/admin/app/fulfillmentType/create',
            update: '/admin/app/fulfillmentType/edit',
            destroy: '/admin/app/fulfillmentType/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});