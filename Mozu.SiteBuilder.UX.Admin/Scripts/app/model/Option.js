/**
 * @class Taco.model.Option
 * @author Jason Cochran
 * The Option model
 */


Ext.define('Taco.model.Option', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.OptionValue'],
    fields: [{
        "name": "id",
        "type": "int",
        "useNull": true
    },
    {
        "name": "internalName",
        "type": "string",
        "useNull": true
    },
    {
        "name": "isMultiValue",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "isRequired",
        "type": "boolean",
        "useNull": true
    },

    {
        "name": "inputType",
        "type": "string",
        "useNull": true
    },
    {
        "name": "maxLength",
        "type": "int",
        "useNull": true
    },
    {
        "name": "minLength",
        "type": "int",
        "useNull": true
    },
    {
        "name": "description",
        "type": "string",
        "useNull": true
    },
    {
        "name": "name",
        "type": "string",
        "useNull": true
    },
    {
        name:"productCount",
        type: "int",
        "useNull": true,
        defaultValue:0
    },
    {
        name: "isConfigurable",
        type: "boolean",
        defaultValue: false
    }],
    idProperty: 'id',
    hasMany: {
        model: 'Taco.model.OptionValue',
        name: 'optionValues',
        primaryKey: 'id',
        // filterProperty: 'attributeId',
        foreignKey: 'option_id',
        autoLoad: true
        //,associationKey: 'values'
    },
    validations: [
        { type: 'presence', name: 'internalName' },
        { type: 'length', name: 'internalName', min: 3 },
        { type: 'presence', name: 'name' },
        { type: 'length', name: 'name', min: 3 },
        { type: 'exclusion', name: 'inputType', list: ['NotSpecified'] }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/Scripts/Taco/mocks/categories.json',
            read: '/admin/app/options/list',
            create: '/admin/app/options/create',
            update: '/admin/app/options/edit',
            destroy: '/admin/app/options/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
});