/**
 * @class Taco.view.site.page.entityAdapters.DocumentEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
    modelName: 'Taco.model.CmsDocument',
    allowedActions:{copy:true,preview:true,destroy:true,publishPage:true},
    getStore: function () {
        return this.editor.cmsDocs;
    },


    getId: function () {
        return this.pageProps.pageContext.collectionId + "_" + this.pageProps.pageContext.documentId;
    },

    constructor: function () {
        this.callParent(arguments);
    },
    publish:function() {
        var model = Ext.ModelManager.create({
            "id": this.pageProps.pageContext.documentId,
            "draftType": "Page",
            "documentListName": "pages",
            "name": "test",
            "isPublished": false,
            "modificationType": "Updated",
            "lastModified": "2013-05-15T16:39:43",
            "lastPublished": "2013-05-15T16:38:26",
            "modifiedBy": "trent_boyd@volusion.com"
        }, 'Taco.model.CmsDocumentDraft');
        model.set('isPublished', true);
        model.save();
    },
    getPageSettings: function () {
        var me = this;
        return [
            {
                panelCls: 'Taco.view.site.page.settings.General',
                getRecord: function() {
                    return me.get();
                }
            },
            {
                panelCls: 'Taco.view.site.page.settings.Seo',
                getRecord: function() {
                    return me.get();
                }
            }];
    }
});