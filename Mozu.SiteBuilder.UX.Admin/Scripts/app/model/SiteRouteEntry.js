/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.SiteRouteEntry', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 165,
        create: 165,
        update: 165,
        destroy: 165
    },
    fields: [
        {
            name: 'index',
            type: 'int',
            defaultValue: 1000
        },
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'template',
            type: 'string'
        },
        {
            name: 'pageType',
            type: 'string'
        },
        {
            name: 'listViewName',
            type: 'string'
        },
        {
            name: 'listName',
            type: 'string'
        },
        {
            name: 'isCanonical',
            type: 'boolean',
            defaultvalue: false
        }
    ],
    idProperty: 'name',
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/Scripts/app/mocks/discounts.json',
            read: '/admin/app/siteroutes/list',
            create: '/admin/app/siteroutes/create',
            update: '/admin/app/siteroutes/edit',
            destroy: '/admin/app/siteroutes/delete'
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