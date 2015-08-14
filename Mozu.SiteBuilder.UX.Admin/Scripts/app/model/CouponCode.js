/**
* @class Taco.model.CouponCode
* @author Jason Cochran
*/

Ext.define('Taco.model.CouponCode', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'couponSetCode', type: 'string' },
        { name: 'couponCode', type: 'string' },
        { name: 'canBeDeleted', type: 'boolean' },
        { name: 'createDate', type: 'date' },
        { name: 'updateDate', type: 'date' },
        { name: 'createBy', type: 'string' },
        { name: 'updateBy', type: 'string' },
        { name: 'redemptionCount', type: 'int' }
    ],
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    idProperty: 'couponCode',
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/couponcode/list',
            create: '/admin/app/couponcode/create',
            // no update allowed
            update: '/admin/app/couponcode/update',
            destroy: '/admin/app/couponcode/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle:false
        }
    }
});