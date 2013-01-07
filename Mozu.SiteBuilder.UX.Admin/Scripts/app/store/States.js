/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*
* ??ORPHAN?? -- This store has a different name than its file, a different doc comment than its name, and I don't think anyone uses it...
* 
*/


    Ext.define('Taco.store.TaxRates', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.TaxRate',
        pageSize: 100,
        remoteSort: false ,
        remoteFilter: false
    });
