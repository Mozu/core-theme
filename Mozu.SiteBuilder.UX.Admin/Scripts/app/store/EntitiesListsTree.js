/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.EntitiesListsTree', {
        extend: 'Ext.data.TreeStore',
        pageSize: 25,
        remoteSort: false,
        remoteFilter: false,
        storeManagerConfig: {
            createOnly: true
        },
        root: {
            expanded: true,

        },
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/entities/lists/tree'
            },
            extraParams: {
                usages: 'entitymanager'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            },
            writer: {
                allowSingle: false,
                type: 'json'
            }
        }
    }
);