/**
* @class Taco.store.ProductTypesPicker
* The productTypes store used by the productTypePicker;
* has its own proxy to avoid conflicts with other stores;
*/

Ext.define('Taco.store.AttributesPicker', {
    requires:['Taco.model.Attribute'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    pageSize: 10,
    buffered: false,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: false,
        autoLoad: true
    }
});