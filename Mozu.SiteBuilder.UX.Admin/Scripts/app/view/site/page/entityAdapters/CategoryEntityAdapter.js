/**
 * @class Taco.view.site.page.entityAdapters.CategoryEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
    requires:['Taco.view.site.page.settings.CategoryTemplates'],
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
           
           doc = Taco.model.CmsDocument.create({
               name: pageReq.Path,
               documentType: 'catalog_page',
               collectionName: 'catalog_pages'
           });
           doc.on('afteredit', function(model) {
               if (model.dirty) {
                   me.editor.cmsDocs.add(model);
               }
           },this,{single :true} );
       }
       return doc;
   },
   addSaveTasks: function (tasks) {
       if (this.model.facetSetStore) {
           
           tasks.add({
               key: 'facetSetStore',
               store: this.model.facetSetStore
           });
          
       }
   },
   isDirty:function() {
       if (this.model && this.model.facetSetStore) {
           return this.model.facetSetStore.isDirty();
       }
       return false;
   },
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
                panelCls: 'Taco.view.site.page.settings.CategoryTemplates',
                panelCfg:{},
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
                getRecord: function () {
                    var fs = me.get().getFacetSets();
                    if (!fs.pageEditor) {
                        fs.pageEditor = me.editor;
                        me.model.getFacetSets().on('dirtychange', me.editor.onFormStateChange, me.editor);
                    }
                    return me.get();
                }
            }];
    }
	

//settingsPanels:[]
});