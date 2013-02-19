/**
* @class Taco.store.Attributes
* @author Travis Johnson
* The Attributes Store
*/

Ext.define('Taco.store.Attributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true
});