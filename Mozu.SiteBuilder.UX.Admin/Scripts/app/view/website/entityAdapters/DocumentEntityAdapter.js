/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',

    modelName: 'Taco.model.CmsDocument',

    allowedActions: {
        copy: true,
        preview: true,
        destroy: true,
        publishPage: true
    },

    constructor: function () {
        this.callParent(arguments);
    },

    getId: function () {
        return this.pageContext.cmsContext.page.collection + "_" + this.pageContext.cmsContext.page.id;
    },

    getPageSettings: function () {
       var me = this;

       return [
           Ext.create('Taco.view.website.settings.General', {
               record: me.get()
           })
       ];
    },

    getSaveTask: function () {
        return this.callParent(arguments);
    },

    getStore: function () {
        return this.editor.cmsDocs;
    },

    load:function () {
        var me = this;

        if (!this.getId()) {
            return;
        }

        Taco.model.CmsDocument.load(this.getId(), {
            scope: this,
            success: function (record, operation) {
                this.set(record);
            }
        });
     
    },

    publish: Ext.emptyFn
});
