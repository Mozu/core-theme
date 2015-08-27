/**
 * @class Taco.model.SiteShippingSettings
 */

Ext.define('Taco.model.ShippingCarrierSetting', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'settings', type: 'auto', defaultValue: {} },
        { name: 'rates', type: 'auto', defaultValue: [] },
        { name: 'isConfigured', type: 'boolean' },
        { name: 'enabled', type: 'boolean' ,defaultvalue:false},
        { name: 'configuredCountries', type:'auto', defaultValue: [] }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/carrierSettings/read',
            update: '/admin/app/shipping/carrierSettings/edit'
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