/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.model.Entity',
        'Taco.view.customSchema.DynamicFormContainer',
        'Taco.core.ux.HtmlEditor'
    ],
    supportsPageVariations: true,
   
    addSaveTasks: function (tasks) {
        this.callParent(arguments);
        var me = this;
        var isVariation = function(){
            if(me.variationStore.originalDocument) {
                return me.variationStore.originalDocument.get('properties').variationId;
            }
            return false;
        }
        tasks.on('complete', function (data) {
            if(this.pageContext && this.pageContext.cmsContext && !isVariation() && this.pageContext.cmsContext.page.path != this.get().data.name ) {
                Taco.core.StateManager.attemptNavigate('/website/page/cms/' + this.get().data.listFQN + '/' + this.get().data.name);
            } 
        }, this, {
            delay: 200
        });
        return tasks;
    }
  
});