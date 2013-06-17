/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.model.ShippingCarrierSettings', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Discount',
        pageSize: 25,
        remoteSort: false,
        remoteFilter: false,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
    });
