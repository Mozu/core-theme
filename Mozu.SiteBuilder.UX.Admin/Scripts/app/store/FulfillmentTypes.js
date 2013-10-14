/**
 * @class Taco.store.FulfillmentTypes
 */

Ext.define('Taco.store.FulfillmentTypes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.FulfillmentType',
    remoteFilter: false,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});