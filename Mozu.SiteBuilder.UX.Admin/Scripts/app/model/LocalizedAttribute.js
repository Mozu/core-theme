/**
 * @class Taco.model.LocalizedAttribute
 */
Ext.define('Taco.model.LocalizedAttribute', {
    //requires: ['Taco.model.AttributeValue'],
    extend: 'Taco.core.data.Model',
    fields: [{
            name: 'attributeFQN',
            type: 'string'
        }, {
            name: 'adminName',
            type: 'string'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'description',
            type: 'string',
            useNull: true
        }, {
            name: 'locale',
            type: 'string',
            useNull: true
        }, {
            name: 'localizedValues',
            type: 'auto',
            defaultValue: []
        }
    ],
    validations: [{
            type: 'length',
            name: 'name',
            min: 3,
            max: 100
        }, {
            type: 'presence',
            name: 'name'
        }, {
            type: 'length',
            name: 'adminName',
            min: 3,
            max: 100
        }, {
            type: 'presence',
            name: 'adminName'
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/localizeddata/attributes/read',
            update: '/admin/app/localizeddata/attributes/update'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});