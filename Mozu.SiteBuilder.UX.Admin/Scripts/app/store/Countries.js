/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*
* ??ORPHAN?? -- This store has a different name than its file, a different doc comment than its name, and I don't think anyone uses it...
* 
*/


    Ext.define('Taco.store.Countries', {
        extend: 'Ext.data.Store',
        fields: ['name', 'code'],
        pageSize: 800,
        remoteSort: false,
        remoteFilter: false,
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/Reference/countries/list'
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