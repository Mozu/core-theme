/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*
* ??ORPHAN?? -- This store has a different name than its file, a different doc comment than its name, and I don't think anyone uses it...
* 
*/


    Ext.define('Taco.store.States', {
        extend: 'Ext.data.Store',
        fields: ['value', 'code'],
        pageSize: 100,
        remoteSort: false,
        remoteFilter: false,
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/Reference/states/list'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            }   
        },
        storeManagerConfig: {
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        }
    });