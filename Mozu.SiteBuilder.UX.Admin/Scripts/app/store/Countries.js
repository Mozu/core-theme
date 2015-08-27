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
        model: 'Taco.model.Country',
        pageSize: 800,
        remoteSort: false,
        remoteFilter: false,
        sorters: ['name'],
        autoLoad: true,
        contextLevel:'t',
        storeManagerConfig: {
            createOnly: true,
            autoLoad: true
        }
       
    });