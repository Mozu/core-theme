/**
 * @class Taco.store.LocalizedAttributes
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
                read: '/admin/app/localizedcontent/attributes/read',
                update: '/admin/app/localizedcontent/attributes/edit'
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
