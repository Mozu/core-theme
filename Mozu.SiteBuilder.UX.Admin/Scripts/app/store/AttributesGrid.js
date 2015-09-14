/**
* @class Taco.store.Attributes
* @author Travis Johnson
* The Attributes Store
*/

Ext.define('Taco.store.AttributesGrid', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    },
    proxy: {
        type: 'ajaxproxy',        
        api: {
            create: '/admin/app/attribute/create',
            read: '/admin/app/attribute/read',
            update: '/admin/app/attribute/update',
            destroy: '/admin/app/attribute/destroy'
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