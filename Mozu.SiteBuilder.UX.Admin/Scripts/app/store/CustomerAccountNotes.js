/**
 * @class Taco.store.CustomerAccountNotes
 */

    Ext.define('Taco.store.CustomerAccountNotes', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CustomerAccountNote',
        pageSize: 10,
        remoteSort: false,
        remoteFilter: false
    });
