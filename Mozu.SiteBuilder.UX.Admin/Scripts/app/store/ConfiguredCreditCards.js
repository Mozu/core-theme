/**
 * @class Taco.store.AccountUsers
 */


Ext.define('Taco.store.ConfiguredCreditCards', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.KeyValuePair',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/checkoutsettings/cards/list'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            }
        }

    });

