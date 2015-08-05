/**
 * @class Taco.store.CouponSetGrid
 */

    Ext.define('Taco.store.CouponSetGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CouponSet',
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
            direction: 'asc' || 'desc'
        }
    });
