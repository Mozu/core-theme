/**
 * @class Taco.model.UspsSharedShippingMethod
 */
Ext.define('Taco.model.UspsSharedShippingMethod', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'code', type: 'string' },
        { name: 'content', type: 'auto' },
        { name: 'isInternational', type: 'boolean' },
        { name: 'sequence', type: 'int' }
    ],
    idProperty: 'code',
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/uspsglobalshared/read'
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