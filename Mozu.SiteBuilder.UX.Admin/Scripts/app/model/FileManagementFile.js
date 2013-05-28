/**
* @class Taco.shared.model.FileManagementFile
* @author no one
* The CategoryFileManagementFile model
*/

Ext.define('Taco.shared.model.FileManagementFile', {
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
        "name": "name",
        "type": "string",
        "useNull": true
    }
    ,
    {
        "name": "height",
        "type": "int",
        "useNull": true
    }
     ,
    {
        "name": "width",
        "type": "int",
        "useNull": true
    }
    ,
    {
        "name": "thumbnail",
        "type": "string",
        "useNull": true,
        persist :false
    },
    {
        "name": "alt",
        "type": "string",
        "useNull": true,
        persist: false
    },
    {
        name: "dateModified",
        "type": "date",
 //       type: types.DATE, 
        "useNull": true,
        dateFormat: 'MS',
        persist: false
    },
    {
        name: "fileType",
        "type": "string",
        "useNull": true,
        persist: false
    },
    {
        name: "fileSize",
        "type": "int",
        "useNull": true,
        persist: false
    },
     {
         name: "isUploaded",
         "type": "boolean",
         "useNull": true,
         defaultValue: true
     },
      {
          name: "folderId",
          "type": "string",
          "useNull": true
      },
      {
          name: "localthumbnail",
        type: "auto",
        persist :false
      }
  ],
    idProperty: 'id',
    //    belongsTo: [
    //            {
    //                model: 'Taco.shared.model.FileManagementFolder',
    //                name: 'items'
    //            }
    //        ],

    validations: [

        { type: 'length', name: 'name', min: 3, max: 20 },
        { type: 'presence', name: 'name' }
    ],


    proxy: {
        type: 'readahead',
        unfilteredParam:'unfiltered',
        api: {
            read: '/admin/app/fileManagement/file/list',
            create: '/admin/app/fileManagement/file/create',
            update: '/admin/app/fileManagement/file/edit',
            destroy: '/admin/app/fileManagement/file/delete'
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