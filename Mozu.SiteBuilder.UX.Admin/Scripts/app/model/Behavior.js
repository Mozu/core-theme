
Ext.define('Taco.model.Behavior', {
    extend: 'Taco.core.data.Model',

    fields: [{
        name: 'id',
        type: 'string',
        useNull: true
    }, {
        name: 'name',
        type: 'string',
        useNull: true
    },
        {
            name: 'roleId',
            type: 'int',
            useNull: true
        }],

    proxy: {
        type: 'ajaxproxy',
        forTreeStore: true,
        api: {
            read: '/admin/app/rolebehaviors/read'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
})