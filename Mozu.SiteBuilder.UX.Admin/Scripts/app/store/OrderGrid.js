/**
 * @class Taco.store.Orders
 */

    Ext.define('Taco.store.OrderGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Order',
        pageSize: 50,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            // createOnly:false,
           autoLoad: true
        },

        sorters: [{
            property: 'submittedDate',
            direction: 'DESC'
        }]
    });