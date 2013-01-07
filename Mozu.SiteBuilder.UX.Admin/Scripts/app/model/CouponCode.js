/**
* @class Taco.model.CouponCode
* @author Jason Cochran
*/

Ext.define('Taco.model.CouponCode', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'code', type: 'string', isHidden: true }    
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/discount/generatecoupon'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
});