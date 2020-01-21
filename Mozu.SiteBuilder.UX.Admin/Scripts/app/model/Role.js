/**
 * @class Taco.model.Role
 * The Roles model
 */

Ext.define('Taco.model.Role', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.model.Behavior',
        'Taco.model.Owner',
        'Taco.model.Resource',
        'Taco.model.Tag'
    ],
    behaviors: {
        read: 37,
        create: 38,
        update: 39,
        destroy: 40
    },
    fields: [
        { name: 'id', type: 'int', nullable: true },
        { name: 'name', type: 'string' },
        { name: 'isEditable', type: 'boolean' },
        {
            'name': 'owners',
            'type': 'hasMany',
            'model': 'Taco.model.Owner',
            'reader': 'json'
        },
        {
            'name': 'resources',
            'type': 'hasMany',
            'model': 'Taco.model.Resource',
            'reader': 'json'
        },
        {
            'name': 'tags',
            'type': 'hasMany',
            'model': 'Taco.model.Tag',
            'reader': 'json'
        }
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
