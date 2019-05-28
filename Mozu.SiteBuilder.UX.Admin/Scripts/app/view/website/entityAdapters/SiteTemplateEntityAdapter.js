/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.SiteTemplateEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',

    modelName: 'Taco.model.CmsDocument',
    showNameEditor: false,
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
        if (!this.pageContext.cmsContext.site.listFQN || !this.pageContext.cmsContext.site.id) {
            return undefined;
        }
        return { listFQN: this.pageContext.cmsContext.site.listFQN, id: this.pageContext.cmsContext.site.id };
    },


    load: function () {
        var me = this,
          cmsDoc,
          templReq = me.pageContext.cmsContext.site;

        if (templReq.id) {
            Taco.model.Entity.load({ listFQN: templReq.listFQN, id: templReq.id }, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.Entity', {
                documentTypeFQN: templReq.documentTypeFQN,
                name: templReq.path,
                entityType: 'cms',
                listFQN: templReq.listFQN,
                properties: {
                    page_type_definition: templReq.path
                }
            });
            me.set(cmsDoc);
        }
    }
});
