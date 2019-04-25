/**
 * @class Taco.store.ImageGroup
 */
Ext.define('Taco.store.ImageGroup', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.ImageGroup',
    remoteFilter: false,
    createOnly: true,
    pageSize: 50,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    },
    remoteSort: false,
    sortInfo: {
        field: 'groupName',
        direction: 'asc' || 'desc'
    }
});
