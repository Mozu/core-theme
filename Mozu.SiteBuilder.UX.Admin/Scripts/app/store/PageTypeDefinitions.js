/**
 * @class Taco.store.Orders
 */

Ext.define('Taco.store.PageTypeDefinitions', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.PageTypeDefinition',
    pageSize: 200,
    remoteSort: false,
    remoteFilter: false,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});
