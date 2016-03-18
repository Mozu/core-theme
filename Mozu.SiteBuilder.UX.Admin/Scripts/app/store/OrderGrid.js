/**
 * @class Taco.store.Orders
 */

    Ext.define('Taco.store.OrderGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Order',
        pageSize: 50,
        remoteSort: false,
        remoteFilter: false,
        storeManagerConfig: {
            // createOnly:false,
           autoLoad: true
        }
    });