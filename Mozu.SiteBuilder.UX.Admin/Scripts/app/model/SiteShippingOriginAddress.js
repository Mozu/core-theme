/**
 * @class Taco.model.SiteShippingOriginAddress
 */
Ext.define('Taco.model.SiteShippingOriginAddress', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'senderName', type: 'string' },
        { name: 'address1', type: 'string' },
        { name: 'address2', type: 'string' },
        { name: 'address3', type: 'string' },
        { name: 'cityOrTown', type: 'string' },
        { name: 'stateOrProvince', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'postalOrZipCode', type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/originaddress/read',
            create: '/admin/app/shipping/originaddress/create',
            update: '/admin/app/shipping/originaddress/edit',
            destroy: '/admin/app/shipping/originaddress/delete'
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