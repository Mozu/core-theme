/**
 * @class Taco.store.RuntimePriceLists
 */
Ext.define('Taco.store.RuntimePriceLists', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.RuntimePriceList',
    remoteFilter: false,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    },
    remoteSort: false,
    sortInfo: {
        field: 'name',
        direction: 'asc' || 'desc'
    }
});
