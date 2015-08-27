/**
 * @class Taco.model.InternationalShippingRate
 */
Ext.define('Taco.model.InternationalShippingRate', {
    extend: 'Taco.core.data.Model',
    idProperty: 'shippingRateId',
    fields: [{
        name: 'shippingRateId',
        type: 'int',
        isHidden: true
    }, {
        name: 'content',
        type: 'auto',
        isHidden: true
    }, {
        name: 'flatPerItemShippingRate',
        type: 'auto',
        isHidden: true
    }, {
        name: 'isActive',
        type: 'boolean',
        isHidden: true
    }, {
        name: 'isInternational',
        type: 'boolean',
        isHidden: true
    }, {
        name: 'regions',
        type: 'auto',
        isHidden: true
    }, {
        name: 'shippingClassId',
        type: 'int',
        isHidden: true
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/shipping/internationalrates/read',
            create: '/admin/app/shipping/rate/create',
            update: '/admin/app/shipping/rate/edit',
            destroy: '/admin/app/shipping/rate/delete'
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