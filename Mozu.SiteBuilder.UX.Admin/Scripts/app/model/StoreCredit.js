/**
 * @class Taco.model.StoreCredit
 */
Ext.define('Taco.model.StoreCredit', {
    extend: 'Taco.core.data.Model',
    idProperty: 'code',
    fields: [{
            name: 'code',
            type: 'string'
        }, {
            name: 'activationDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'initialBalance',
            type: 'string'
        },
        {
            name: 'issuedBy',
            type: 'string'
        },
        {
            name: 'expirationDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'creditType',
            type: 'string',
            defaultValue: 'StoreCredit'
        },
        {
            name: 'customerId',
            type: 'int',
            useNull: true,
            defaultValue: null
        },
        {
            name: 'modifiedDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'currentBalance',
            type: 'string'
        },
        {
            name: 'email',
            type: 'bool'
        },
        {
            name: 'customer',
            type: []
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/credits/list',
            create: '/admin/app/customer/credits/create',
            update: '/admin/app/customer/credits/edit',
            destroy: '/admin/app/customer/credits/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});