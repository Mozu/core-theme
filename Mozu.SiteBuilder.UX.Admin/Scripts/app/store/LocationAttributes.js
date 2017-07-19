/**
* @class Taco.store.LocationAttributes
* The Location Attributes Store
*/

Ext.define('Taco.store.LocationAttributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationAttribute',
    pageSize: 200,
    remoteSort: true,
    storeManagerConfig: {
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: true
    }
});