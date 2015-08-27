/**
 * @class Taco.store.Channels
 */

Ext.define('Taco.store.ChannelPicker', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Channel',
    remoteFilter: false,
    remoteSort: false,
    pageSize: 500,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});