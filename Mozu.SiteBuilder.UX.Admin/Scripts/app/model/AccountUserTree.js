/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.AccountUserTree', {
    extend: 'Taco.core.data.Model',
    idProperty: 'nodeId',
    fields: [
        { name: 'nodeId', type: 'string' },
        { name: 'id', type: 'string' },
        { name: 'role',   type: 'string'},
        { name: 'leaf', type: 'boolean'},
        { name: 'items', type: 'auto'},
        {
            name: 'activity', type: 'string', convert: function (value, record) {
                if (value != '' && value.indexOf('UTC') == -1) {
                    value += ' UTC';
                }
                var date = new Date(value);
                if (date instanceof Date && !isNaN(date.valueOf())) {
                    return ((record.data.type == 'user') ? 'Last Login ' : 'Invite Sent ') + date.toLocaleString();
                }
                return value;
            }
        },
        { name: 'type', type: 'string' },
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'email', type: 'string' },
        {
            name: 'status', type: 'string', convert: function (value, rec) {
                if (rec.data.leaf) {
                    return '';
                }
                if (rec.data.activity && rec.data.activity.indexOf('Last Login') > -1) {
                    return 'Active';

                }
                return 'Pending';
            }
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/Scripts/app/mocks/accountusertree.json',
            read: '/admin/app/account/users/list/tree',
            destroy: '/admin/app/account/users/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type:'json'
        }
    }
});
