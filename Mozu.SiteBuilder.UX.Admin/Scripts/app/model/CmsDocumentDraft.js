/**
* @class Taco.model.CmsDocumentDraft
* @author Foster Hersey
* The CmsDocumentDraft model
* Hint: It's a CmsDocument with unpublished changes.
*/

Ext.define('Taco.model.CmsDocumentDraft', {
    extend: 'Taco.core.data.Model',
    
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "draftType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            "name": "modificationType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "lastModified",
            "type": "date",
            "useNull": true
        },
        {
            "name": "modifiedBy",
            "type": "string",
            "useNull": true
        },
        {
            "name": "lastPublished",
            "type": "date",
            "useNull": true
        }

    ],

    proxy: {
        type: 'readahead',
        api: {
            read: '/admin/app/cmspublishing/listdrafts'
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
