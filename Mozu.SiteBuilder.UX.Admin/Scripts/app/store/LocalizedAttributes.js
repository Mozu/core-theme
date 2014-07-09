/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.LocalizedAttributes', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.LocalizedAttribute',
        remoteFilter: false,
        remoteSort: false,
        pageSize: 50,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'mc',
            clearSort: true,
            autoLoad: true
        },
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/localizeddata/attributes/read',
                update: '/admin/app/localizeddata/attributes/edit'
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
    });
