/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.model.CmsDocument',
        'Taco.view.website.settings.General',
        'Taco.view.website.settings.DocumentSeo'
    ],
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
        if (!this.pageContext.cmsContext.page.collection || !this.pageContext.cmsContext.page.id)
            return undefined;
        return this.pageContext.cmsContext.page.collection + "_" + this.pageContext.cmsContext.page.id;
    },

    getPageSettings: function () {
        var me = this;

        return [
            Ext.create('Taco.view.website.settings.General', {
                record: me.get()
            }),
            Ext.create('Taco.view.website.settings.DocumentSeo', {
                record: me.get()
            })            
        ];
    },

    getSaveTask: function () {
        var tasks = this.callParent(arguments);
        tasks.on('complete', function () {
            if (this.pageContext.cmsContext.page.path != this.get().data.name) {
                Taco.core.StateManager.attemptNavigate('/website/page/' + this.get().data.name);
            }
        }, this, {
            delay :200
        });
        return tasks;
    },

    getStore: function () {
        return this.editor.cmsDocs;
    },

    load: function () {
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

    }
});