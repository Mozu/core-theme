/**
* @class Taco.store.CustomerAttributes
* @author Bradley Friemel
* The Customer Attributes Store
*/

Ext.define('Taco.store.OrderAttributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.OrderAttribute',
    pageSize: 200,
    remoteSort: true,
    storeManagerConfig: {
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: true
    }
});