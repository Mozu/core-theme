/**
 * @class Taco.view.website.entityAdapters.CategoryEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires:[
        'Taco.view.website.settings.CategoryTemplates'
    ],

    modelName:'Taco.model.Category',

    allowedActions:{
        copy: false,
        preview: true,
        destroy: false
    },

    getStore:function() {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.Categories');
    },

    isHidden:function(){
        return this.get().get('isHidden');
    },

    setHidden: function (hide) {
        this.get().set('isHidden', hide);
    },

    getId: function() {
        return parseInt(this.pageContext.categoryId, 10);
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

            doc.on({
                afteredit: {
                    scope: this,
                    single: true,
                    fn: function () {
                        if (model.dirty) {
                            me.editor.cmsDocs.add(model);
                        }
                    }
                }
            });
        }

        return doc;
    },

    addSaveTasks: function (tasks) {
        if (this.get().facetSetStore) {
            tasks.add({
                key: 'facetSetStore',
                store: this.get().facetSetStore
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
            Ext.create('Taco.view.website.settings.facets.Facets', {
                record: me.get()
            }),
            Ext.create('Taco.view.website.settings.General', {
                record: me.get()
            }),
            Ext.create('Taco.view.website.settings.CategoryTemplates', {
                record: me.get()
            }),
            Ext.create('Taco.view.website.settings.Seo', {
                record: me.get()
            })
        ];

    //,
    //{
    //    panelCls: 'Taco.view.website.settings.CategoryTemplates',
    //    panelCfg:{},
    //    getRecord: function() {
    //        return me.getCmsPageDoc();
    //    }
    //}, {
    //    panelCls:  'Taco.view.website.settings.Seo',
    //    getRecord: function() {
    //        return me.get();
    //    }
    //}, {
    //    panelCls: 'Taco.view.website.settings.Facets',
    //    getRecord: function () {
    //        var fs = me.get().getFacetSets();
    //        if (!fs.pageEditor) {
    //            fs.pageEditor = me.editor;
    //            me.model.getFacetSets().on('dirtychange', me.editor.onFormStateChange, me.editor);
    //        }
    //        return me.get();
    //    }
    }
});
