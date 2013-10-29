/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.Locations', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Location',
    remoteSort: true,
    remoteFilter: true,
    pageSize: 25,
    storeManagerConfig: {
        autoLoad: true
    }
});