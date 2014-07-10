/**
 * @class Taco.model.LocalizedAttribute
 */
Ext.define('Taco.model.LocalizedProductVariant', {
    //requires: ['Taco.model.AttributeValue'],
    extend: 'Taco.core.data.Model',
    fields: [{
            name: 'id',
            type: 'auto'
        }, {
            /* numeric id of this attribute used by the service */
            name: 'attributeId',
            type: 'int'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'code',
            type: 'string',
            useNull: true
        }, {
            name: 'isOption',
            type: 'boolean'
        }, {
            name: 'isExtra',
            type: 'boolean'
        }, {
            name: 'adminName',
            type: 'string'
        }, {
            name: 'isActive',
            type: 'boolean'
        }, {
            name: 'isRequired',
            type: 'boolean'
        },
        {
            name:'isVisible',
            type:'boolean',
            defaultValue:false
        },
        {
            name: 'displayGroup',
            type: 'string',
            defaultValue: 'Admin'
        }, {
            name: 'isProperty',
            type: 'boolean'
        }, {
            name: 'rows',
            type: 'auto'
        }, {
            name: 'attributeMetadata',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'regex',
            type: 'string'
        }, {
            name: 'localizedContent',
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
        // api: {
        //     create: '/admin/app/Test/testCreate',
        //     read: '/admin/Scripts/app/mocks/attributes.json',
        //     update: '/admin/app/Test/testUpdate',
        //     destroy: '/admin/app/Test/testDestroy'
        // },
        api: {
            read: '/admin/app/localizedcontent/attributes/read',
            update: '/admin/app/localizedcontent/attributes/edit'
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