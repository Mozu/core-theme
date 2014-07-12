/**
 * @class Taco.model.LocalizedAttribute
 */
Ext.define('Taco.model.LocalizedAttribute', {
    requires: ['Taco.model.LocalizedAttributeContent'],
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
            name: 'localizedContent',
            type: 'auto',
            defaultValue: {}
        }
        //, {
        //    name: 'localizedValues',
        //    type: 'auto',
        //    defaultValue: []
        //}
    ],
    idProperty: 'attributeFQN',
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
        idParam: 'attributeFQN',
        api: {
            read: '/admin/app/localizedcontent/attributes/read',
            //update: '/admin/app/localizedcontent/attributes/edit'
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