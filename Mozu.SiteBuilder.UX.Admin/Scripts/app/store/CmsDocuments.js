/**
* @class Taco.store.CmsDocuments
* @author Thomas Phipps
* The CmsDocuments store
*/


    Ext.define('Taco.store.CmsDocuments', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CmsDocument',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true
    });
