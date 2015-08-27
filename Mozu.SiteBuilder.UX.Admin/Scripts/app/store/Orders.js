/**
 * @class Taco.store.Orders
 */

    Ext.define('Taco.store.Orders', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Order',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            createOnly:true,
            autoLoad: true
        }
    });
