/**
 * @class Taco.model.TargetedShippingMethod
 */
Ext.define('Taco.model.TargetedShippingMethod', {
    extend: 'Taco.core.data.Model',
    idProperty: 'code',
    fields: [{
        name: 'code',
        type: 'string',
        isHidden: true
    }, {
        name: 'name',
        type: 'string',
        isHidden: true
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/discount/targetedshippingmethods/read'
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