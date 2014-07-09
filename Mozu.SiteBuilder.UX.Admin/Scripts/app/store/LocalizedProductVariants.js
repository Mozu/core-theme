/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.LocalizedProductVariants', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.LocalizedProductVariant',
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
                read: '/admin/app/localization/attributes/read',
                update: '/admin/app/localization/attributes/edit'
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
