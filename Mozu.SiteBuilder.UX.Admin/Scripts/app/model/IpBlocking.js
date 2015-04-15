
Ext.define('Taco.model.IpBlocking', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            name: 'isEnabled',
            type: 'boolean',
            usenull: false
        },
        {
            name: 'downloadDate',
            type: 'date'
        },
        {
            name: 'ipAddress',
            type: 'string'
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/ipblocking/read',
            update: '/admin/app/ipblocking/update'
        },
        reader: {
            type: 'json',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});