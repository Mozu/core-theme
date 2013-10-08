/**
 * @class Taco.model.PaymentAndCheckout
 */
Ext.define('Taco.model.PaymentAndCheckout', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "id", type: "string" },
        { name: "paymentServiceMerchantId", type: "string" },
        {
            name: "supportedCards",
            type: "auto",
            convert: function(v, record) {
                if (v && !Ext.isArray(v)) {
                    return [v];
                }
                return v;
            }
        },
        { name: "gatewayDefinitionId", type: "string" },
        { name: "credentialsSet", type: "boolean" },
        { name: "payByMail", type: "boolean" },
        { name: "paypalExpress", type: "boolean" },
        { name: "credentials", type: "any" ,defaultValue: {} },
        { name: "customerCheckoutType", type: "string" },
        { name: "paymentProcessingFlowType", type: "string" } 
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