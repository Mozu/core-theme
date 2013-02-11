/**
* @class Taco.store.CmsDocumentsStore
* @author Foster Hersey
* The CmsDocuments store
* Hint: It's a CmsDocument with unpublished changes.
*/


    Ext.define('Taco.store.CmsDocumentsDirty', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CmsDocumentDirty',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true
    });
