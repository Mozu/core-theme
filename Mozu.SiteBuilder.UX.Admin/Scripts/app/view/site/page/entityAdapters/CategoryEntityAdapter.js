/**
 * @class Taco.view.site.page.entityAdapters.CategoryEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
    modelName:'Taco.model.Category',
	allowedActions:{copy:false,preview:true,destroy:false},
    getStore:function(){
        return this.editor.categories;
    },
	
    isHidden:function(){
        return this.get().get('isHidden');
    },
    setHidden: function (hide) {
        this.get().set('isHidden', hide);
    },
	
    getId: function() {
        return this.pageProps.pageContext.categoryId;
    },


   getCmsPageDoc:function() {
       return me.get();
       var doc,
           me = this,
           pageReq = me.pageProps.pageContext.cms.page;
       if (pageReq.Id) {
           doc = me.editor.cmsDocs.getById(pageReq.Id);
           if (!doc) {
               doc = me.editor.cmsDocs.add([pageReq.Document])[0];
           }
           return doc;
       } else {
           doc = me.editor.cmsDocs.add([{
               name: pageReq.Path,
               documentType: 'catalog_page',
               collectionName: 'catalog_pages'
           }])[0];
       }
       return doc;
   }
    ,
    getPageSettings: function () {
        var me = this;
        return [
            {
                panelCls: 'Taco.view.site.page.settings.General',
                getRecord: function() {
                    return me.get();
                }
            },
            {
                panelCls: 'Taco.view.site.page.settings.Templates',
                getRecord: function() {
                    return me.getCmsPageDoc();
                }
            }, {
                panelCls:  'Taco.view.site.page.settings.Seo',
                getRecord: function() {
                    return me.get();
                }
            }, {
                panelCls: 'Taco.view.site.page.settings.Facets',
                getRecord: function() {
                    return me.get();
                }
            }];
    }
	

//settingsPanels:[]
});