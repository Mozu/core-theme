/**
 * @class Taco.store.CouponSets
 */

    Ext.define('Taco.store.SearchTuningRules', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.SearchTuningRule',
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
