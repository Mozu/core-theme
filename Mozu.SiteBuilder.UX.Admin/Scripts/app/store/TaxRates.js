/**
 * @class Taco.store.TaxRates
 * @author Thomas Phipps
 * The Products store
 */


    Ext.define('Taco.store.TaxRates', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.TaxRate',
        pageSize: 100,
        remoteSort: false ,
        remoteFilter: false,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        }
    });
