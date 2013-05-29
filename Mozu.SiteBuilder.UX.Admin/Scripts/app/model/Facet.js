/**
 * @class Taco.model.Facet
 */
Ext.define('Taco.model.Facet', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'categoryId', type: 'int' },
        { name: 'facetType', type: 'string' },
        { name: 'order', type: 'int' },
        { name: 'isHidden', type: 'boolean' },
        { name: 'isValid', type: 'boolean' },
        { name: 'validityReason', type: 'string' },
        { name: 'rangeQueries', type: 'auto', defaultValue: [] }
    ],
    proxy: {
        type: 'ajaxproxy',
        //api: {
        //    create: '/admin/app/facet/create',
        //    read: '/admin/app/facet/read',
        //    update: '/admin/app/facet/update',
        //    destroy: '/admin/app/facet/destroy'
        //},
        api: {
            create: '/admin/Scripts/app/mocks/facets.json',
            read: '/admin/Scripts/app/mocks/facets.json',
            update: '/admin/Scripts/app/mocks/facets.json',
            destroy: '/admin/Scripts/app/mocks/facets.json'
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
