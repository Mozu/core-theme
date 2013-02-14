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
        remoteFilter: true,
        
        publishAll: function (cb) {
            var me = this;
            Ext.Ajax.request({
                url: '/admin/app/cmspublishing/publishall',
                method: "POST",
                success: function (response) {
                    me.load();
                    if (cb) cb(response);
                },
                failure: function (response) {
                    console.log("Error publishing general settings!", response);
                }
            });
        }
    });
