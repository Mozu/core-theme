/**
 * @class Taco.store.CouponSets
 */

    Ext.define('Taco.store.CouponSets', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CouponSet',
        remoteFilter: true,
        pageSize: 100,
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
