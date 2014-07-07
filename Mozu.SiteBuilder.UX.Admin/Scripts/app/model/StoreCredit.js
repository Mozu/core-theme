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
            type: 'float'
        },
        {
            name: 'email',
            type: 'bool'
        },
        {
            name: 'customer',
            type: []
        },
        {
            name: 'amtToApply',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'remainderToAccount',
            type: 'boolean'
        },
        {
            name: 'currencyCode',
            type:'string'
        }
    ],

    canBeApplied: function() {
        var now = new Date().getTime();
        return this.get('expirationDate') > now && this.get('activationDate') < now && this.get('currentBalance'() > 0);
    },

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