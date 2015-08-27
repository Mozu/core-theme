/**
 * @class Taco.model.ShopperNotes
 */
Ext.define('Taco.model.ShopperNotes', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "comments",
        "type": "string",
        "useNull": true
    }, {
        "name": "giftMessage",
        "type": "string",
        "useNull": true
    }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/shoppernotes/list',
            create: '/admin/app/order/shoppernotes/create',
            update: '/admin/app/order/shoppernotes/edit',
            destroy: '/admin/app/order/shoppernotes/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});