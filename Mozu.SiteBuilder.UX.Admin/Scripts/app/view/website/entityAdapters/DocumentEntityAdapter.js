/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */
 Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
     extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
     modelName: 'Taco.model.CmsDocument',
     allowedActions:{copy:true,preview:true,destroy:true,publishPage:true},
     getStore: function () {
         return this.editor.cmsDocs;
     },

     getSaveTask: function () {
         var me = this,
             tasks = Ext.create('Taco.core.ux.form.Tasks'),
             zoneData = [];
         Ext.Array.each(me.editor.persistanceData(), function (zone) {
             if (!Ext.isEmpty(zone.rows)) {
                 zone.source = me.pageContext.cmsContext.page;
                 zoneData.push(zone);
             }
         });
         if (!Ext.isEmpty(zoneData)) {
             tasks.add({
                 key: 'widgets',
                 fn: function (t) {

                     Ext.Ajax.request({
                         url: '/admin/app/cmsdocument/widgetdata/update',
                         method: 'post',
                         jsonData: zoneData,
                         success: function (response) {
                             t.callback();

                         }
                     });


                 }
             });
         }
         return tasks;


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
                 panelCls: 'Taco.view.website.settings.General',
                 getRecord: function() {
                     return me.get();
                 }
             },
             {
                 panelCls: 'Taco.view.website.settings.Seo',
                 getRecord: function() {
                     return me.get();
                 }
             }];
     }
 });