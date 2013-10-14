/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.LocationType', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            "name": "id",
            "type": "int"
        }, {
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
            //read: '/admin/app/locationType/list',
            read: '/admin/Scripts/app/mocks/locationTypes.json',
            create: '/admin/app/locationType/create',
            update: '/admin/app/locationType/edit',
            destroy: '/admin/app/locationType/delete'
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