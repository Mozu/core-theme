/**
 * @class Taco.model.RuntimePriceList
 */
Ext.define('Taco.model.RuntimePriceList', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.util.Common'
    ],
    behaviors: {
        read: 239
    },
    idProperty: 'code',
    fields: [
        {
            name: 'code',
            type: 'string'
        },
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'description',
            type: 'string',
            useNull: true
        },
        {
            name: 'filteredInStorefront',
            type: 'boolean',
            defaultValue: false
        },
        {
            name: 'resolvable',
            type: 'boolean',
            defaultValue: true
        },
        {
            name: 'isSiteDefault',
            type: 'boolean',
            defaultValue: false
        },
        {
            name: 'isActive',
            type: 'boolean',
            defaultValue: true
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/priceListRuntime/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        }
    }
});
