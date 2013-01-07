/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.AccountUser', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id',       type: 'string' },
        { name: 'roleId',   type: 'int'    },
        { name: 'role',     type: 'string' },
        { name: 'activity', type: 'string' },
        { name: 'type',     type: 'string' },
        { name: 'email',    type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/account/users/list'
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
