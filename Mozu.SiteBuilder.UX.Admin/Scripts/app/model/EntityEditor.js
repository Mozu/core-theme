/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.EntityEditor', {
    extend: 'Taco.core.data.Model',
    idProperty: "id",
    fields: [
        {
            name: 'id'
        }, {
            name: 'body'
        }
    ],


    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/entities/editors/read'
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