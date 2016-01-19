/**
 * @class Taco.store.PriceLists
 */

    Ext.define('Taco.store.PriceLists', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.PriceList',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'm',
            clearSort: true,
            autoLoad: true
        },
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' || 'desc'
        }
    });
