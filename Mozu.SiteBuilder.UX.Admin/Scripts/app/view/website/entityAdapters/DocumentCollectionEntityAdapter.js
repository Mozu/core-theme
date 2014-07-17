/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentCollectionEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.model.Entity',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.core.ux.HtmlEditor'
    ],
    showNameEditor:false,

   
    addSaveTasks: function (tasks) {
        this.callParent(arguments);
        
        tasks.on('complete', function () {

            if(this.pageContext && this.pageContext.cmsContext && this.pageContext.cmsContext.page.path != this.get().data.name) {
                Taco.core.StateManager.attemptNavigate('/website/page/' + this.get().data.name);
            } 
        }, this, {
            delay: 200
        });
        return tasks;
    },
   
   
    load: function () {
        var me = this;
        this.manager.showEntityManagerGrid(this.pageContext.listName);
        this.manager.showHideButtons(['isDocumentList', 'isCreatable'], true);
        if (me.record) {
            this.set(me.record);
            return;
        }
        if (this.getId()) {
            Taco.model.Entity.load(this.getId(), {
                scope: this,
                success: function (record) {
                    this.set(record);
                }
            });
            return;
        }
        record = Ext.create('Taco.model.Entity', {
            entityType: 'cms',
            documentType: this.pageContext.cmsContext.page.documentType||"web_page",
            name: this.pageContext.cmsContext.page.path,
            documentListName: this.pageContext.cmsContext.page.documentListName
        });
        me.set(record);

    }

    
  
   
  
});