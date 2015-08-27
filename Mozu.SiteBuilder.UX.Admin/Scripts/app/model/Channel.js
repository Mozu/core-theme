/**
 * @class Taco.model.Channel
 */
Ext.define('Taco.model.Channel', {
    extend: 'Taco.core.data.Model',
    //requiredStores: [
    //    'Taco.store.Countries'
    //],
    fields: [{
        "name": "code",
        "type": "string",
        "useNull": true
    }, {
        "name": "name",
        "type": "string",
        "useNull": true
    }, {
        "name": "countryCode",
        "type": "string",
        "useNull": true
    }],
    idProperty: 'code',
    proxy: {
        type: 'ajaxproxy',
        api: {

            //read: '/admin/Scripts/app/mocks/channels.json',
            read: '/admin/app/channel/list',
            create: '/admin/app/channel/create',
            update: '/admin/app/channel/edit',
            destroy: '/admin/app/channel/delete'
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