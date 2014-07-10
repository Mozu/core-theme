/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.LocalizedProductProperties', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.LocalizedProductProperty',
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
