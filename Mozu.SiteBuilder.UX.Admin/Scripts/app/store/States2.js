Ext.define('Taco.store.States2', {
    extend: 'Ext.data.Store',
    requires: [
        'Ext.data.Store',
        'Taco.model.State'
    ],
    model: 'Taco.model.State',
    pageSize: 800,
    remoteSort: false,
    remoteFilter: false,
    autoLoad: true
});