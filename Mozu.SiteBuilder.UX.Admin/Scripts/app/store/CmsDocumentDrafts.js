/**
* @class Taco.store.CmsDocumentDrafts
* @author Foster Hersey
* The CmsDocuments store
* Hint: It's a CmsDocument with unpublished changes.
*/


    Ext.define('Taco.store.CmsDocumentDrafts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CmsDocumentDraft',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            createOnly:true,
            autoLoad: true
        },
        
        publishAll: function (listFQN, cb) {
            var me  = this,
                url = me.getProxy().api.publishAll;

            if (typeof type === "function") {
                cb = type;
                type = null;
            }

            Ext.Ajax.request({
                url: url,
                method: "POST",
                jsonData: listFQN ? { listFQN: listFQN } : '',
                // jsonData: {foo: 'foo'},
                success: function (response) {
                    me.reload();
                    if (cb) cb(response);
                },
                failure: function (response) {
                    console.log("Error publishing drafts!", response);
                }
            });
        },

        discardAll: function(cb) {
            var me  = this,
                url = me.getProxy().api.discardAll;

            Ext.Ajax.request({
                url: url,
                method: "POST",
                success: function (response) {
                    me.reload();
                    if (cb) cb(response);
                },
                failure: function (response) {
                    console.log("Error discarding drafts!", response);
                }
            });
        }
    });
