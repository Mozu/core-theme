/**
 * @class Taco.store.Channels
 */

Ext.define('Taco.store.Channels', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Channel',
    remoteFilter: false,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});