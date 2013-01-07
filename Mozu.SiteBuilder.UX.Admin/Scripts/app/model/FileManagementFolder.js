/**
* @class Taco.model.FileManagementFolder
* @author no one
* The CategoryFileManagementFile model
*/

Ext.define('Taco.model.FileManagementFolder', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields:
  [
    {
        "name": "id",
        "type": "string",
        "useNull": true
    },
     {
         "name": "parentId",
         "type": "string",
         "useNull": true
     },
    {
        "name": "name",
        "type": "string",
        "useNull": true
    }
  ],
    idProperty: 'id',
        hasMany: [
            {
                model: 'Taco.model.FileManagementFolder',
                name: 'items'
            }
        ],

    validations: [

        { type: 'length', name: 'name', min: 3, max: 20 },
        { type: 'presence', name: 'name' }
    ],


    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/fileMangment/folder/list',
            create: '/admin/app/fileMangment/folder/create',
            update: '/admin/app/fileMangment/folder/edit',
            destroy: '/admin/app/fileMangment/folder/delete'
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