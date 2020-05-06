/**
 * @class Taco.model.InventoryExportJob
 */
Ext.define('Taco.model.InventoryExportJob', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "id", type: "string" },
        
    ],

    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/inventorySettings/read',
            create: '/admin/app/inventorySettings/create',
            update: '/admin/app/inventorySettings/update',
            destroy: '/admin/app/inventorySettings/delete'
        },

        mockApi: {
            //read: '/admin/Scripts/app/mocks/PaymentAndCheckout.json'
        },

        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },

        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});