/**
 * @class Taco.model.CheckoutSettings
 */
Ext.define('Taco.model.CheckoutSettings', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "id", type: "string" },
        { name: "customerCheckoutType", type: "string" },
        { name: "externalPaymentWorkflows", type: "any", defaultValue: {} },
        { name: "gateway", type: "any", defaultValue: {} },
        { name: "payByMail", type: "boolean" },
        {
            name: "paymentProcessingFlowType", type: "string" ,
            serialize : function (v, r) {
                if (v) {
                    v = v.replace(/,/gi, '');
                }
                return v;
            }

        },
        {
            name: "supportedCards",
            type: "auto",
            convert: function (v, record) {
                v = record.raw.gateway.supportedCards;
                if (v && !Ext.isArray(v)) {
                    return [v];
                }
                return v;
            }
        }/*,
        { name: "gatewayDefinitionId", type: "string" },
        { name: "credentialsSet", type: "boolean" },
        
        { name: "paypalExpress", type: "boolean" },
        { name: "credentials", type: "any" ,defaultValue: {} },
        
        */
    ],

    //set: function (fieldName, newValue) {
    //    if (fieldName == "supportedCards" && newValue && !Ext.isArray(newValue)) {
    //        newValue = [newValue];
    //    }
    //    this.callParent(fieldName, newValue);
    //},

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