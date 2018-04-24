/**
 * @class Taco.model.PaymentGateways
 */
Ext.define('Taco.model.PaymentGateway', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "id", type: "string" },
        { name: "gatewayDefinitionId", type: "string" },
        { name: "credentials", type: "auto" },
        { name: "name", type: "string" },
        { name: "gatewayDefinitionName", type: "string" },
        { name: "gatewayDefinition", type: "auto "},
        { name: "credentialsSet", type: "boolean" }
    ],

    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/checkoutsettings/gateways/read',
            create: '/admin/app/checkoutsettings/gateways/create',
            update: '/admin/app/checkoutsettings/gateways/update',
            destroy: '/admin/app/checkoutsettings/gateways/delete'
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