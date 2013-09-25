/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.Locations', {
    extend: 'Ext.data.Store',
    fields: [
        { name: 'code', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string' }
    ],
    "data": [],
    remoteFilter: false,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});