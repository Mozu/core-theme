/**
 * @class Taco.model.SiteShippingRegion
 */
Ext.define('Taco.model.SiteShippingRegion', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'isoCountryCode', type: 'string' }
    ],
    idProperty: 'isoCountryCode',
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/regions/read',
            create: '/admin/app/shipping/regions/edit',
            update: '/admin/app/shipping/regions/edit',
            destroy: '/admin/app/shipping/regions/delete'
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