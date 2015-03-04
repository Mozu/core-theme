/**
 * @class Taco.store.AccountUsersTree
 * @author Bradely Friemel
 * The Account Users Tree Store
 */
Ext.define('Taco.store.AccountUsersTree', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'Ext.data.TreeStore',
        'Taco.model.AccountUserTree'
    ],
    model: 'Taco.model.AccountUserTree',
    remoteFilter: true,
    pageSize: 9000, // <-- So much power 
    root: {
        id: '',
        expanded: true,
        path: '/',
        root: true
    }
});
