/**
 * @class Taco.store.DomesticShippingRates
 */

    Ext.define('Taco.store.DomesticShippingRates', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.DomesticShippingRate',
        autoLoad: false,
        pageSize: 100
    });