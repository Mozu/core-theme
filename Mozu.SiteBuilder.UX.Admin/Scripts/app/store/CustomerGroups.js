/**
 * @class Taco.store.CustomerGroups
 */
Ext.define('Taco.store.CustomerGroups', {
    requires: ['Taco.model.CustomerGroup'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.CustomerGroup',
    pageSize: 50,
    remoteSort: false,
    remoteFilter: false
});
