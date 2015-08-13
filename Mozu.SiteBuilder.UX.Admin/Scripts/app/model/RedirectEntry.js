/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.RedirectEntry', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 165,
        create: 165,
        update: 165,
        destroy: 165
    },
    fields: ['s', 'd',
        {
            name: 'rw',
            type: 'boolean',
            defaultValue: false
        },
    {
        name: 'q',
        type: 'boolean',
        defaultValue: false
    },
     {
         name: 't',
         type: 'boolean',
         defaultValue: false
     },
    ],
    idProperty: 's',
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/Scripts/app/mocks/discounts.json',
            read: '/admin/app/redirects/list',
            create: '/admin/app/redirects/create',
            update: '/admin/app/redirects/edit',
            destroy: '/admin/app/redirects/delete'
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