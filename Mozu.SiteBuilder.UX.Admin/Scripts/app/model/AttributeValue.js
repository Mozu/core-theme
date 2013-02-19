/**
 * @class Taco.model.AttributeValue
 */
Ext.define('Taco.model.AttributeValue', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'inputType', type: 'string' },
        { name: 'dataType', type: 'string' },
        { name: 'valueType', type: 'string' },
        { name: 'usageTypes', type: 'auto' },
        { name: 'min', type: 'auto' },
        { name: 'max', type: 'auto' },
        { name: 'regex', type: 'string' },
        { name: 'values', type: 'auto' }

    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/Test/testCreate',
            read: '/admin/Scripts/app/mocks/attributes.json',
            update: '/admin/app/Test/testUpdate',
            destroy: '/admin/app/Test/testDestroy'
        },
        //api: {
        //    create: '/admin/app/Attribute/create',
        //    read: '/admin/app/Attribute/read',
        //    update: '/admin/app/Attribute/update',
        //    destroy: '/admin/app/Attribute/destroy'
        //},
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});
