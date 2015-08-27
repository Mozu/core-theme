/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.ShippingCarrierSettings', {
    extend: 'Ext.data.Store',
    requires:['Taco.model.ShippingCarrierSetting'],
    model: 'Taco.model.ShippingCarrierSetting',
    pageSize: 25,
    remoteSort: false,
    remoteFilter: false,

    // when this store has an update operation, we need to get the storeManager to clear the following stores since their data is no longer valid
    invalidateCachedStores: [
        'Taco.store.ShippingMethods'
    ],
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});
