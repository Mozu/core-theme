
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
            name: 'checked',
            type: 'boolean',
            useNull: true,
            defaultValue:null
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
            read: '/admin/app/rolebehaviors/read',
            update: '/admin/app/rolebehaviors/edit'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
})