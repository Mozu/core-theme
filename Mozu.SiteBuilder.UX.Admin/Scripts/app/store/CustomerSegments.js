/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.CustomerSegments', {
    requires: ['Taco.model.CustomerSegment'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.CustomerSegment',
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