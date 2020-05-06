/**
 * @class Taco.store.Roles
 */


    Ext.define('Taco.store.Roles', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Role',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        }
    });
