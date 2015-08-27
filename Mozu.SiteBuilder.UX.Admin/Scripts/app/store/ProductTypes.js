/**
* @class Taco.store.ProductTypes
* @author Thomas Phipps
* The ProductOptions store
*/

Ext.define('Taco.store.ProductTypes', {
    requires:['Taco.model.ProductType'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.ProductType',
    pageSize: 20,
    buffered: false,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    storeManagerConfig: {
        contextLevel:'mc',
        autoLoad: true
    }
});