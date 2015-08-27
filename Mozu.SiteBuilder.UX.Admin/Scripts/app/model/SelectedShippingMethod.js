/**
 * @class Taco.model.SelectedShippingMethod
 */
Ext.define('Taco.model.SelectedShippingMethod', {
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
            read: '/admin/app/discount/selectedshippingmethods/read'
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