/**
 * @class Taco.model.PaymentGateways
 */
Ext.define('Taco.model.CarrierAccountModel', {
    extend: 'Taco.core.data.Model',
    idProperty: 'code',
    fields: [
        { name: "carrierId", type: "string" },
        { name: "code", type: "string" },
        { name: "values", type: "auto" ,defaultValue: {}},
        { name: "name", type: "string" },

    ],

    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/carriers/credentialsset/read',
            destroy: '/admin/app/carriers/credentialsset/delete'
        },

        mockApi: {
            read: '/admin/Scripts/app/mocks/PaymentAndCheckout.json'
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

