/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.SiteTemplateEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',

    modelName: 'Taco.model.CmsDocument',

    allowedActions: {
        copy: true,
        preview: true,
        destroy: true,
        publishPage: true
    },



    getId: function () {
        return this.pageContext.cmsContext.site.collection + "_" + this.pageContext.site.template.id;
    },

  
   
    getPageSettings: function () {
        var me = this;

        return [            
            Ext.create('Taco.view.website.settings.Template', {
                record: me.get()
            })           
        ];
    },
    load: function () {
        var me = this,
          cmsDoc,
          siteReq = me.pageContext.cmsContext.site;

        if (siteReq.id) {
            Taco.model.Entity.load({ documentListName: siteReq.documentListName, id: siteReq.id }, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.Entity', {
                documentType: siteReq.documentType,
                name: siteReq.path,
                entityType: 'cms',
                documentListName: siteReq.documentListName
            });
            me.set(cmsDoc);
        }
    }

    
});
