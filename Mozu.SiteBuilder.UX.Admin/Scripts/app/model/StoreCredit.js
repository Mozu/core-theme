/**
 * @class Taco.model.StoreCredit
 */
Ext.define('Taco.model.StoreCredit', {
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: [{
            name: 'id',
            type: 'int'
        }, {
            name: 'code',
            type: 'string'
        }, {
            name: 'dateIssued',
            type: 'date'
        },
        {
            name: 'issuedAmount',
            type: 'string'
        },
        {
            name: 'issuedBy',
            type: 'string'
        },
        {
            name: 'expires',
            type: 'date'
        },
        {
            name: 'customerName',
            type: 'string'
        },
        {
            name: 'customerId',
            type: 'string'
        },
        {
            name: 'modifiedDate',
            type: 'date'
        },
        {
            name: 'balance',
            type: 'string'
        },
        {
            name: 'email',
            type: 'bool'
        }],

    proxy: {
        type: 'ajaxproxy',
        api: {
//            read: '/admin/Scripts/app/mocks/storecredit.json'
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
        }//,
        //writer: {
        //    allowSingle: false,
        //    type: 'json'
        //}
    }
});