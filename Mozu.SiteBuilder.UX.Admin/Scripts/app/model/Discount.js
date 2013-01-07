/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.Discount', {
    extend: 'Taco.core.data.Model',
    idProperty: 'discountId',
    fields: [{
        name: 'discountId',
        type: 'int'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'content',
        type: 'auto'
    }, {
        name: 'products',
        type: 'auto'
    }, {
        name: 'categories',
        type: 'auto'
    }, {
        name: 'shippingMethods',
        type: 'auto'
    }, {
        name: 'minimumOrderAmount',
        type: 'int'
    }, {
        name: 'maxRedemptionCount',
        type: 'int'
    }, {
        name: 'currentRedemptionCount',
        type: 'int'
    }, {
        name: 'requiresCoupon',
        type: 'boolean'
    }, {
        name: 'couponCode',
        type: 'string'
    }, {
        name: 'amount',
        type: 'number'
    }, {
        name: 'amountType',
        type: 'string'
    }, {
        name: 'targetType',
        type: 'string'
    }, {
        name: 'startDate',
        type: 'date'
    }, {
        name: 'endDate',
        type: 'date'
    }, {
        name: 'status',
        type: 'string'
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/Scripts/app/mocks/discounts.json',
            read: '/admin/app/discount/read',
            create: '/admin/app/discount/create',
            update: '/admin/app/discount/edit',
            destroy: '/admin/app/discount/delete'
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