/**
 * @class Taco.model.UspsConfiguration
 */

/*
// queued up to be deprecated on 1/9/2014 by simeon due to no used;


Ext.define('Taco.model.UspsConfiguration', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'uspsConfigurationId', type: 'int' },
        { name: 'uspsUserId', type: 'string' },
        { name: 'shippingMethods', type: 'auto' }
    ],
    idProperty: 'uspsConfigurationId',
    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/shipping/uspsconfig/create',
            read: '/admin/app/shipping/uspsconfig/read',
            update: '/admin/app/shipping/uspsconfig/edit'
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

*/