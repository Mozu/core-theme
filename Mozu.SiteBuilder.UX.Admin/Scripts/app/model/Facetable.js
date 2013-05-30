/**
 * @class Taco.model.Facetable
 */
Ext.define('Taco.model.Facetable', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'facetType', type: 'string' },
        { name: 'isRangeQueryable', type: 'int' }
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
            create: '/admin/Scripts/app/mocks/facetables.json',
            read: '/admin/Scripts/app/mocks/facetables.json',
            update: '/admin/Scripts/app/mocks/facetables.json',
            destroy: '/admin/Scripts/app/mocks/facetables.json'
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
