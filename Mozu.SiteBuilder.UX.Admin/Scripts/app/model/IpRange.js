/**
 * @class Taco.model.IpRange
 */

/*
// deprecated: (simeon k. 10/31/2013)

Ext.define('Taco.model.IpRange', {
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'start',
        type: 'string'
    }, {
        name: 'end',
        type: 'string'
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/generalsetting/ipranges/read',
            create: '/admin/app/generalsettings/ipranges/create',
            update: '/admin/app/generalsettings/ipranges/update'
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

*/