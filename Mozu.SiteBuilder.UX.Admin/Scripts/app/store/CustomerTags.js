/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.CustomerTags', {
    requires: ['Taco.model.KeyValuePair'],
    extend: 'Ext.data.Store',
    model:'Taco.model.KeyValuePair',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,
    
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/customer/groups/list',
            create: '/admin/app/customer/groups/create'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true,
        createOnly:false
    }
});