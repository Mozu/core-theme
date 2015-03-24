/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.Discounts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Discount',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' || 'desc'
        }
    });
