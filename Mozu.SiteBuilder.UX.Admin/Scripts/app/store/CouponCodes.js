/**
 * @class Taco.store.CouponCodes
 */

    Ext.define('Taco.store.CouponCodes', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CouponCode',
        remoteFilter: true,
        pageSize: 100,
        //storeManagerConfig: {
        //    single:true,
        //    clearFilters: true,
        //    contextLevel: 's',
        //    clearSort: false,
        //    autoLoad: false
        //},
        remoteSort: true,
        sorters: [{
            property: 'createDate',
            direction:"DESC"
        }]
    });
