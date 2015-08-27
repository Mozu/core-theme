/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.ShippingMethods', {
    extend: 'Ext.data.Store',
    //requires:['Taco.model.ShippingCarrierSetting'],
    //model: 'Taco.model.ShippingCarrierSetting',
    fields: [
        {name:"id", mapping:"code"},
        "code",
        "isActive",
        "isConfigured",
        "isInternational",
        "name",
        "rateProvider",
        "sequence"
    ],
    // note setting autoLoad to true causes it to double load.
    // todo: figure out why
    //autoLoad: true,
    remoteSort: false,
    remoteFilter: false,
    pageSize: 500,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    },
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/shipping/carrierRatesWithConfigured'
        },
        reader: {                    
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        }
    }    
    
});
