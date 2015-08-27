/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.TargetRule', {
    extend: 'Taco.core.data.Model',
    idProperty:"code",
    fields: [
        {
            "name": "code",
            "type": "string"
        }, {
            "name": "domain",
            "type": "string"
        }, {
            "name": "description",
            "type": "string"
        }, {
            "name": "expression",
            "type": "string"
        }
    ],

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/shipping/rules/read',
            create: '/admin/app/shipping/rules/create',
            update: '/admin/app/shipping/rules/edit',
            destroy: '/admin/app/shipping/rules/delete'
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
