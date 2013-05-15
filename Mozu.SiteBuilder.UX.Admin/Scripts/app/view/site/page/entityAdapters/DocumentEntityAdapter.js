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