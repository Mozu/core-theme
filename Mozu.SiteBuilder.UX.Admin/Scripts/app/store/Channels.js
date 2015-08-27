/**
 * @class Taco.store.Channels
 */

Ext.define('Taco.store.Channels', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Channel',
    remoteFilter: false,
    remoteSort: false,
    pageSize: 1000,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});