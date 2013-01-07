///**
//* @class Taco.model.CategoryTreeNode
//* @author Jason Cochran
//* The CategoryTreeNode model
//*/

//Ext.define('Taco.model.CategoryTreeNode', {
//    extend: 'Taco.core.data.Model',
//    requires: ['Taco.model.Product'],

//    fields: [
//        { name: 'id', type: 'int' },
//        { name: 'name', type: 'string' },
//        { name: 'index', type: 'int' },
//        { name: 'parentId', type: 'int' },
//        { name: 'productCount', type: 'int' },
//        { name: 'isHidden', type: 'boolean' },
//        { name: 'leaf', type: 'boolean' }
//    ],

//    hasMany: [
//        {
//            model: 'Taco.model.CategoryTreeNode',
//            name: 'items'
//        },
//        {
//            model: 'Taco.model.Product',
//            name: 'products'
//        }
//    ],

//    proxy: {
//        type: 'readahead',
//        api: {
//            create: '/admin/app/category/tree/create',
//            read: '/admin/app/category/tree/read',
//            update: '/admin/app/category/tree/update',
//            destroy: '/admin/app/category/tree/delete',
//            duplicate: '/admin/app/category/tree/duplicate'
//        },

//        reader: {
//            type: 'json',
//            root: 'items',
//            successProperty: 'success',
//            messageProperty: "message"
//        },

//        writer: {
//            allowSingle: false,
//            type: 'json'
//        }
//    }
//});
