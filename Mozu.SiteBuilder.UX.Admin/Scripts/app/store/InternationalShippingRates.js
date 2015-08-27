/**
 * @class Taco.store.InternationalShippingRates
 */

    Ext.define('Taco.store.InternationalShippingRates', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.InternationalShippingRate',
        autoLoad: false,
        pageSize: 100
    });
