/**
 * @class Taco.store.Channels
 */

Ext.define('Taco.store.Channels', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Channel',
    remoteFilter: true,
    remoteSort: true,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});