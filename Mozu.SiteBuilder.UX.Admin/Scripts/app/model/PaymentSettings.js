/**
 * @class Taco.model.PaymentSettings
 */
Ext.define('Taco.model.PaymentSettings', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "jobSettings", type: "auto" },
      ],

    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/checkoutsettings/paymentSettings'
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