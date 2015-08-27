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
            name: 'code',
            type: 'string'
        },
        {
            name: 'documentTypes',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'entityLists',
            type: 'auto',
            defaultValue: []
        },
         {
             name: 'documentLists',
             type: 'auto',
             defaultValue: []
         },
        {
            name: 'priority',
            type: 'float',
            useNumm:false,
            defaultValue: 0
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