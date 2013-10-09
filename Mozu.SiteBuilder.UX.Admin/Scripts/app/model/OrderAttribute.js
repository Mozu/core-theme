/**
 * @class Taco.model.CustomerAttribute
 */
Ext.define('Taco.model.OrderAttribute', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    idProperty: 'code',
    fields: [{
            name: 'code',
            type: 'int'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'required',
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
            //create: '/admin/app/discount/create',
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