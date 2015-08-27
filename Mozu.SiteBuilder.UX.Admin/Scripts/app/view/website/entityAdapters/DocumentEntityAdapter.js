/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.model.Entity',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.core.ux.HtmlEditor'
    ],


   
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
    }

   
  
   
  
});