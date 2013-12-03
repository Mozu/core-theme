/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.EmailTemplateEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires:['Taco.view.website.settings.EmailTemplate'],
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

    getSaveTask: function () {
        return this.callParent(arguments);
    },
    getPageSettings: function () {
        var me = this;

        return [
            Ext.create('Taco.view.website.settings.EmailTemplate', {
                record: me.get()
            })
        ];
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
