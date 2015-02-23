/**
* @class Taco.store.ProductTypes
* @author Thomas Phipps
* The ProductOptions store
*/

Ext.define('Taco.store.ProductTypes', {
    requires:['Taco.model.ProductType'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.ProductType',
    pageSize: 50,
    buffered: false,
    remoteSort: false,
    remoteFilter: false,
    storeManagerConfig: {
        contextLevel:'mc',
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});