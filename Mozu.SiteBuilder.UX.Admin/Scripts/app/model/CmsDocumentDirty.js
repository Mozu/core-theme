/**
* @class Taco.model.CmsDocumentDirty
* @author Foster Hersey
* The CmsDocumentDirty model
* Hint: It's a CmsDocument with unpublished changes.
*/

Ext.define('Taco.model.CmsDocumentDirty', {
    extend: 'Taco.model.CmsDocument',

    fields: [
        {
            "name": "publishState",
            "type": "string",
            "useNull": false
        }
    ],

    proxy: {
        type: 'readahead',
        api: {
            read: '/admin/app/cmspublishing/listdrafts',
            update: '/admin/app/cmspublishing/update'
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
