/**
 * @class Taco.model.LocalizedAttributeContent
 */
Ext.define('Taco.model.LocalizedAttributeContent', {
    //requires: ['Taco.model.AttributeValue'],
    extend: 'Taco.core.data.Model',
    fields: [{
            name: 'description',
            type: 'string',
            useNull: true
        }, {
            name: 'locale',
            type: 'string',
            useNull: true
        }, {
            name: 'exists',
            type: 'bool',
            useNull: true,
            defaultValue: false
        }, {
            name: 'name',
            type: 'string',
            useNull: true
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
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            update: '/admin/app/localizedcontent/attributes/edit/',
            appendId: true
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});