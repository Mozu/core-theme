/**
 * @class Taco.model.SiteShipSetting
 */
Ext.define('Taco.model.SiteShipSetting', {
    extend: 'Taco.core.data.Model',

    fields: [
        { name: "refreshShipping", type: "boolean" },
        { name: "refreshTax", type: "boolean" }
    ],

    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/shippingSettings/read'
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