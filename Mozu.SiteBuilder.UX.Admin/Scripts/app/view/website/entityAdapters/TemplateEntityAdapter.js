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

  

  

    getId: function () {
        if (this.record) {
            return this.record.getLoadParams();
        }
        if (!this.pageContext.cmsContext.template.documentListName || !this.pageContext.cmsContext.template.id) {
            return undefined;
        }
        return { documentListName: this.pageContext.cmsContext.template.documentListName, id: this.pageContext.cmsContext.template.id };
    },



  
    load:function () {
        var me = this,
          cmsDoc,
          templReq = me.pageContext.cmsContext.template;

        if (templReq.id) {
            Taco.model.Entity.load({ documentListName: templReq.documentListName, id: templReq.id }, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.Entity', {
                documentType: templReq.documentType,
                name: templReq.path,
                entityType:'cms',
                documentListName: templReq.documentListName
            });
            me.set(cmsDoc);
        }
    }
    

   
    

});
