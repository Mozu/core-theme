/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.TemplateEntityAdapter', {
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
        return this.pageContext.cmsContext.template.collection + "_" + this.pageContext.cmsContext.template.id;
    },

    getPageSettings: function () {
       var me = this;

       return [
           
       ];
    },

    getSaveTask: function () {
        return this.callParent(arguments);
    },

   
    load:function () {
        var me = this;
        return;
       
     
    },

    publish: Ext.emptyFn
});
