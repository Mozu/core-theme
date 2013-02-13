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
            read: '/admin/app/fileManagement/folder/list',
            create: '/admin/app/fileManagement/folder/create',
            update: '/admin/app/fileManagement/folder/edit',
            destroy: '/admin/app/fileManagement/folder/delete'
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