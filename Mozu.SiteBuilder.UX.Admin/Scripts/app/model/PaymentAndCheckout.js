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
            convert: function (v, record) {
                if (v && !Ext.isArray(v)) {
                    return [v];
                }
                return v;
            }

        },
        { name:"gatewayDefinitionId", type:"string" },

        { name:"gatewayFieldVal1",  type:"string" },
        { name:"gatewayFieldVal2",  type:"string" },
        { name:"gatewayFieldVal3",  type:"string" },
        { name:"gatewayFieldVal4",  type:"string" },
        { name:"gatewayFieldVal5",  type:"string" },
        { name:"gatewayFieldVal6",  type:"string" },
        { name:"gatewayFieldVal7",  type:"string" },
        { name:"gatewayFieldVal8",  type:"string" },
        { name:"gatewayFieldVal9",  type:"string" },
        { name:"gatewayFieldVal10", type:"string" },

        { name:"gatewayFieldId1",  type:"string" },
        { name:"gatewayFieldId2",  type:"string" },
        { name:"gatewayFieldId3",  type:"string" },
        { name:"gatewayFieldId4",  type:"string" },
        { name:"gatewayFieldId5",  type:"string" },
        { name:"gatewayFieldId6",  type:"string" },
        { name:"gatewayFieldId7",  type:"string" },
        { name:"gatewayFieldId8",  type:"string" },
        { name:"gatewayFieldId9",  type:"string" },
        { name:"gatewayFieldId10", type:"string" },

        { name:"customerCheckoutType", type:"string" },
        { name:"paymentProcessingFlowType", type:"string" }
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