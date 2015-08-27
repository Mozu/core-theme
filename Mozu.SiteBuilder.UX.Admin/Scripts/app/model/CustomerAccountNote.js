/**
 * @class Taco.model.CustomerAccountNote
 */
Ext.define('Taco.model.CustomerAccountNote', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "int"
    }, {
        "name": "content",
        "type": "string"
    }, {
        "name": "createdBy",
        "type": "string"
    }, {
        "name": "createdOn",
        "type": "date",
        "dateFormat": "c"
    }],
    idProperty: 'id',
    
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customers/notes/list',
            create: '/admin/app/customers/notes/create'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});
