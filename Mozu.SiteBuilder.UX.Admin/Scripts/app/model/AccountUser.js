/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.AccountUser', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id',       type: 'string' },
        //{ name: 'roleId',   type: 'int'    },
        { name: 'roles', type: 'auto' },
        {
            name: 'roleIds',
            type: 'auto',
            convert:function (value, record) {
                return Ext.Array.pluck(record.raw.roles || [], 'id');
            }
        },
        {
            name: 'activity', type: 'string', convert: function (value, record) {
                var date = new Date(value);
                if (date instanceof Date && !isNaN(date.valueOf())) {
                    return 'Last Login ' + date.toLocaleString();
                }
                return value;
            }
        },
        { name: 'type',     type: 'string' },
        { name: 'email',    type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/account/users/list',
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
