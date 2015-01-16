/**
 * @class Taco.store.DiscountGrid
 */

    Ext.define('Taco.store.DiscountGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Discount',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: false,
            contextLevel: 's',
            clearSort: false,
            autoLoad: true
        },        
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' | 'desc'
        }
    });
