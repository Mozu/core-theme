/**
 * @class Taco.model.Facet
 */
Ext.define('Taco.model.Facet', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'categoryId', type: 'int' },
        { name: 'facetType', type: 'string' },
        { name: 'order', type: 'int' },
        { name: 'isHidden', type: 'boolean' },
        { name: 'validity', type: 'auto'},
        { name: 'rangeQueries', type: 'auto', defaultValue: [] }
    ],
    proxy: {
        type: 'ajaxproxy',
        // api: {
        //     create: '/admin/app/Test/testCreate',
        //     read: '/admin/Scripts/app/mocks/attributes.json',
        //     update: '/admin/app/Test/testUpdate',
        //     destroy: '/admin/app/Test/testDestroy'
        // },
        api: {
            create: '/admin/app/facet/create',
            read: '/admin/app/facet/read',
            update: '/admin/app/facet/update',
            destroy: '/admin/app/facet/destroy'
        },
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
