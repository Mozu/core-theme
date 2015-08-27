/**
 * @class Taco.model.CustomerGroup
 * A Taco.model.CustomerGroup is a way to 'tag' a Customer. These groups or tags have a unique ID.
 */

Ext.define('Taco.model.CustomerGroup', {
    extend: 'Taco.core.data.Model',

    fields: [{
        'name': 'id',
        'type': 'int'
    }, {
        'name': 'name',
        'type': 'string'
    }, {
        'name': 'assigned',
        'type': 'bool'
    }],

    idProperty: 'id',
    
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customers/groups/list',
            create: '/admin/app/customers/groups/create',
            update: '/admin/app/customers/groups/update',
            destroy: '/admin/app/customers/groups/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: true,
            type:'json'
        }
    }
});
