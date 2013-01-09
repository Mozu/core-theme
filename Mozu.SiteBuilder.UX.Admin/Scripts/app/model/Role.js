/**
 * @class Taco.model.Role
 */

Ext.define('Taco.model.Role', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Behavior'],
    fields: [
        { name: 'id',   type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'isEditable', type: 'boolean'}
    ],

    idProperty: 'id',

  

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/roles',
            create: '/admin/app/account/roles/create',
            update: '/admin/app/account/roles/edit',
            destroy: '/admin/app/account/roles/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});