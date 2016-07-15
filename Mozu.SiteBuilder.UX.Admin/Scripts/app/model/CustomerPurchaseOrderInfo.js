/**
 * @class Taco.model.CustomerPurchaseOrderInfo
 */
Ext.define('Taco.model.CustomerPurchaseOrderInfo', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 41,
        create: 44,
        update: 42,
        destroy: 43
    },
    requires: [],
    fields: [
        {
            name: 'accountId',
            type: 'int'
        }, {
            name: 'availableBalance',
            type: 'auto'
        }, {
            name: 'creditLimit',
            type: 'auto'
        }, {
            name: 'customerPurchaseOrderPaymentTerms',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'id',
            type: 'int'
        }, {
            name: 'isEnabled',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'isRequired',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'overdraftAllowance',
            type: 'string'
        }, {
            name: 'overdraftAllowanceType',
            type: 'auto'
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/purchaseOrder/get',
            create: '/admin/app/customer/purchaseOrder/create',
            update: '/admin/app/customer/purchaseOrder/edit',
            destroy: '/admin/app/customer/purchaseOrder/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});