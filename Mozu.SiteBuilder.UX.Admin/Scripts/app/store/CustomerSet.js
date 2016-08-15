/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.CustomerSet', {
  requires: ['Taco.model.CustomerSet'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.CustomerSet',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,
    
  
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true,
        createOnly:false
    }
});