/**
* @class Taco.store.CustomerAttributes
* @author Bradley Friemel
* The Customer Attributes Store
*/

Ext.define('Taco.store.CustomerAttributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CustomerAttribute',
    pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
           
            clearSort: true,
            autoLoad: true
        }
});