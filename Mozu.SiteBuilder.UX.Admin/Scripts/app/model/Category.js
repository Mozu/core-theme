/**
* @class Taco.model.Category
* @author Jason Cochran
* The Category model
*/

Ext.define('Taco.model.Category', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Product'],
    //fields: ['id', 'name', 'description', 'sequence', 'isDisplayed'],

    fields: [
        { name: 'leaf', type: 'boolean' },
        {
            "name": "id",
            "type": "int",
            "useNull": true
        }, {
            name:'expandable',
            defaultValue: true,
            persist :false
        },
        {
            name:'checked',
            defaultValue: null,
            persist: false
        },
        {
            "name": "code",
            "type": "string",
            "useNull": true
        },
        {
            "name": "slug",
            "type": "string",
            "useNull": true
        },
        {
            "name": "path",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isHidden",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "parentId",
            "type": "int",
            "useNull": true
        },
        {
            "name": "productCount",
            "type": "int",
            "useNull": true,
            persist: false
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            "name": "description",
            "type": "string",
            "useNull": true
        },
        {
            "name": "sequence",
            "type": "int",
            "useNull": true
        },
        {
            "name": "pageTitle",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaTitle",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaKeywords",
            "type": "string",
            "useNull": true
        }


    ],

    hasMany: {
            model: 'Taco.model.Product',
            name: 'products'
        },
    
    validations: [
        { type: 'length', name: 'name', min: 3 }
        
    ],

    proxy: {
        type: 'readahead',
        forTreeStore:true,
        api: {
            create: '/admin/app/category/create',
            read: '/admin/app/category/read',
            update: '/admin/app/category/update',
            destroy: '/admin/app/category/delete',
            duplicate: '/admin/app/category/duplicate'
        },
        url: '/admin/Scripts/app/mocks/categories.json',
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    },
    
    mockApi: {
        read: '/admin/Scripts/app/mocks/categories.json'
    }
});
