/**
* @class Taco.model.ShippingClass
* @author Jason Cochran
*/

Ext.define('Taco.model.ShippingClass', {
    extend: 'Taco.core.data.Model',
    fields: [{
        name: 'shippingClassId',
        type: 'int',
        isHidden: true
    }, {
        name: 'internalName',
        type: 'string',
        isHidden: true
    }],

    idProperty: 'shippingClassId',
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/class/read',
            create: '/admin/app/shipping/class/create',
            update: '/admin/app/shipping/class/edit',
            destroy: '/admin/app/shipping/class/delete'
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