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
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        }
    });
