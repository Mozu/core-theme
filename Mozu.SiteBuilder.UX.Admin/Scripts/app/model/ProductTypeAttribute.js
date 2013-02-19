/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.ProductTypeAttribute', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'productTypeId', type: 'auto' },
        {name:'index', type:'int'},
        { name: 'isLocked', type: 'boolean', defaultValue:false },
        { name: 'allowMulti', type: 'boolean', defaultValue: false },
        { name: 'hidden', type: 'boolean', defaultValue: false },
        { name: 'attributeId', type: 'auto' },
        { name: 'attributeName', type: 'string', persist: false },
        { name: 'attributeInputTypes', type: 'auto', persist: false },
        { name: 'allValues', type: 'auto' , persist:false},
        { name: 'selectedValues', type: 'auto' },
        { name:'usageType', type:'string'}

    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/Test/testCreate',
            read: '/admin/Scripts/app/mocks/producttypeattributes.json',
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
