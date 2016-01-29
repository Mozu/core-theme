/**
 * @class Taco.store.PriceListEntries
 */
    Ext.define('Taco.store.PriceListEntries', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.PriceListEntry',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'm',
            clearSort: true,
            autoLoad: false
        },
        remoteSort: true,
        sortInfo: {
            field: 'productCode',
            direction: 'asc' || 'desc'
        }
    });
