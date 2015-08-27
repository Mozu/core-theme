/**
* @class Taco.model.AdminUser
* @author jons mom!
*/

Ext.define('Taco.model.AdminUser', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 28,
        create: 29,
        update: 30,
        destroy: 31
    },
    fields: [
        { name: 'id', type: 'string'},
        { name: 'emailAddress', type: 'string' },
        {name:'fullName' ,convert:function (v, r) {
            return r.raw.firstName + ' ' + r.raw.lastName;
        }},
         { name: 'firstName', type: 'string' },
         { name: 'lastName', type: 'string' },
        { name: 'roles', type: 'auto', defaultValue: [] },
        { name: 'localeCode', type: 'string' },
        {
            name: 'systemData',
            persist:false
        }, {
            name: 'isActive',
            type: 'boolean',
            persist: false
        }

    ],



    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/scripts/taco/mocks/categories.json',
            read: '/admin/app/account/list',
            destroy:'/admin/app/account/logoff'

        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});