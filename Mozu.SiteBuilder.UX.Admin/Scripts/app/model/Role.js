/**
 * @class Taco.model.Role
 * The Roles model
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
            create: '/admin/app/roles/create',
            update: '/admin/app/roles/update',
            destroy: '/admin/app/roles/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});