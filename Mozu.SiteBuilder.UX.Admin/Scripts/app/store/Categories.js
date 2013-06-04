/**
* @class Taco.store.Categories
* @author Jason Cochran
* The Categories store
*/


Ext.define('Taco.store.Categories', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Category',
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }

});
