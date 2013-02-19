/**
 * @class Taco.model.SiteShippingSettings
 */

Ext.define('Taco.model.SiteShippingSettings', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'activeRateProvider', type: 'auto' },
        { name: 'siteShippingOriginAddress', type: 'auto' },
        { name: 'siteShippingRegions', type: 'auto' },
        { name: 'siteShippingMethods', type: 'auto' },
        { name: 'siteShippingMethods', type: 'auto' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/settings/read',
            create: '/admin/app/shipping/settings/create',
            update: '/admin/app/shipping/settings/edit',
            destroy: '/admin/app/shipping/settings/delete'
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