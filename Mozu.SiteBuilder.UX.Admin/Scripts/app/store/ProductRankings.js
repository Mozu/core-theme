/**
 * @class Taco.store.ProductRankings
 */

    Ext.define('Taco.store.ProductRankings', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ProductRanking',
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
