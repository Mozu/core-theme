Ext.define('Taco.model.SiteBuilderSearchItem', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: 'id',
            type: 'string',
            useNull: true
        }, 
        {
            name: 'url',
            type: 'string',
            useNull: true
        }, 
        {
            name: 'name',
            type: 'string',
            useNull: true
        },
        {
            name: 'isCategory',
            type: 'boolean',
            useNull: true,
            defaultValue: false
        },
        {
            name: 'isDocument',
            type: 'boolean',
            useNull: true,
            defaultValue: false
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/entities/sitebuilder/search'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
})