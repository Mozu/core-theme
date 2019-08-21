/**
 * @class Taco.model.CheckoutSettings
 */
Ext.define('Taco.model.CheckoutSettings', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "id", type: "string" },
        { name: "customerCheckoutType", type: "string" },
        { name: "isMultiShipToEnabled", type: "boolean" },
        { name: "externalPaymentWorkflows", type: "any", defaultValue: {} },
        { name: "cardGatewayMap", type: "any", defaultValue: {} },
        { name: "payByMail", type: "boolean" },
        {
            name: "paymentProcessingFlowType", type: "string",
            serialize: function (v, r) {
                if (v) {
                    v = v.replace(/,/gi, '');
                }
                return v;
            }
        },
        {
            name: "giftCardProcessingType", type: "string",
            serialize: function (v, r) {
                if (v) {
                    v = v.replace(/,/gi, '');
                }
                return v;
            }
        },
        { name: "purchaseOrder", type: "any", defaultValue: {} },

        { name: "thirdPartyPaymentSettings", type: "any", defaultValue: [] },
        { name: "jobSettings", type: "auto" }
    ],
    proxy: {
        type: 'ajaxproxy',

        api: {
            // read: '/admin/Scripts/app/mocks/PaymentAndCheckout.json'
            read: '/admin/app/checkoutsettings/read',
            update: '/admin/app/checkoutsettings/update'
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