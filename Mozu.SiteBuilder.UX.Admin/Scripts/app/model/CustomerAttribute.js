/**
 * @class Taco.model.CustomerAttribute
 */
Ext.define('Taco.model.CustomerAttribute', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    idProperty: 'code',
    fields: [{
            name: 'attributecode',
            type: 'string'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'isrequired',
            type: 'bool'
        },
        {
            name: 'displaygroup',
            type: 'string'
        }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/Scripts/app/mocks/CustomerAttributes.json',
            //read: '/admin/app/discount/list',
            //create: '/admin/app/Customerattribute/create',
            //update: '/admin/app/discount/edit',
            //destroy: '/admin/app/discount/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});