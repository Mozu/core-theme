/**
 * @class Taco.model.Role
 */

Ext.define('Taco.model.Role', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Behavior'],
    fields: [
        { name: 'id',   type: 'int' },
        { name: 'name', type: 'string' }
    ],

    idProperty: 'id',

    hasMany: {
        model: 'Taco.model.Behavior',
        name: 'behaviors',
        primaryKey: 'id',
        foreignKey: 'role_id',
        autoLoad: true
    },

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/account/roles/list',
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