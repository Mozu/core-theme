/**
 * @class Taco.model.CustomerAccount
 * a simplified CustomerAccount with its own proxy so pickers don't get all screwed up.
 */
Ext.define('Taco.model.CustomerAccountPicker', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 41,
        create: 44,
        update: 42,
        destroy: 43
    },
    requires: [
        'Taco.model.Contact',
        'Taco.model.Order',
        'Taco.store.Orders',
        'Taco.store.StoreCredits',
        'Taco.model.CustomerSegment'
    ],
    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'userId',
            type: 'string'
        }, {
            name: 'firstName',
            type: 'string'
        }, {
            name: 'firstNameSafe',
            type: 'string',
            convert: function (value, record) {
                return Ext.util.Format.htmlEncode(record.get('firstName'));
            }
        }, {
            name: 'lastName',
            type: 'string'
        }, {
            name: 'lastNameSafe',
            type: 'string',
            convert: function (value, record) {
                return Ext.util.Format.htmlEncode(record.get('lastName'));
            }
        }, {
            name: 'emailAddress',
            type: 'string'
        }, {
            name: 'emailAddressSafe',
            type: 'string',
            convert: function (value, record) {
                return Ext.util.Format.htmlEncode(record.get('emailAddress'));
            }
        }, {
            name: 'segments',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'segmentIds',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'userName',
            type: 'string'
        }, {
            name: 'companyOrOrganization',
            type: 'string'
        }, {
            name: 'acceptsMarketing',
            type: 'boolean'
        }, {
            name: 'isAnonymous',
            type: 'boolean',
            defaultValue: true
        }, {
            name: 'groups',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'contacts',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'attributes',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'totalSpent',
            type: 'float',
            defaultValue: 0
        }, {
            name: 'visitCount',
            type: 'int',
            defaultValue: 0
        }, {
            name: 'orderCount',
            type: 'int',
            defaultValue: 0
        }, {
            name: 'lastOrderDate',
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'createDate',
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'taxExempt',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'taxId',
            type: 'string'
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/list',
            create: '/admin/app/customer/create',
            update: '/admin/app/customer/edit',
            destroy: '/admin/app/customer/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'

        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});