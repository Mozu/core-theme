/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.TemplateEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires:['Taco.view.website.settings.Template'],
    modelName: 'Taco.model.CmsDocument',

    allowedActions: {
        copy: true,
        preview: true,
        destroy: true,
        publishPage: true
    },

  

    getId: function () {
        return this.pageContext.cmsContext.template.collection + "_" + this.pageContext.cmsContext.template.id;
    },

  
    load:function () {
        var me = this,
          cmsDoc,
          templReq = me.pageContext.cmsContext.template;

        if (templReq.id) {
            Taco.model.CmsDocument.load(templReq.collection + '_' + templReq.id, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.CmsDocument', {
                documentType: templReq.documentType,
                name: templReq.path,
                collectionName: templReq.collection
            });
            me.set(cmsDoc);
        }
    },
    

   
    

   
  
    getPageSettings: function () {
        var me = this;

        return [
            
            Ext.create('Taco.view.website.settings.Template', {
                record: me.get()
            })
           
        ];
    }
});
