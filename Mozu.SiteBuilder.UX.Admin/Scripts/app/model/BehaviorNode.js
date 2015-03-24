
Ext.define('Taco.model.BehaviorNode', {
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'string',
            useNull: true
        }, {
            name: 'name',
            type: 'string',
            useNull: true
        },
        {
            name: 'categoryId',
            type: 'string',
            useNull: true
        }, {
            name: 'categoryName',
            type: 'string',
            useNull: true
        }],

    proxy: {
        type: 'ajaxproxy',
        forTreeStore: true,
        api: {
            read: '/admin/app/rolebehaviors/nodes/read'
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