/**
 * @class Taco.model.SiteShippingSettings
 */

Ext.define('Taco.model.SiteShippingSettings', {
    requires: ['Taco.model.CustomShippingRate', 'Taco.model.Contact'],
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'activeRateProviders', type: 'auto' , defaultValue:[]},
        { name: 'siteShippingOriginAddress', type: 'auto' },
        { name: 'orderHandlingFee', type: 'float' },
        { name: 'customRate', type: 'auto' ,defaultValue: {} }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/settings/read',
            update: '/admin/app/shipping/settings/edit'
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