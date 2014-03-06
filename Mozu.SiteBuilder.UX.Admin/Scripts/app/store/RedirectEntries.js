Ext.define('Taco.store.RedirectEntries', {
    requires: ['Taco.model.RedirectEntry'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.RedirectEntry',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    autoLoad:false
});
