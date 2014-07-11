/**
 * @class Taco.view.website.entityAdapters.CategoryEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.view.website.settings.CategoryDocument',
        'Taco.view.website.settings.facets.Facets',
        'Taco.view.website.settings.CatalogSeo'
    ],

    modelName: 'Taco.model.Category',

    allowedActions: {
        copy: false,
        preview: true,
        destroy: false
    },

    load: function () {
        var me = this,
            key = this.getId(),
            modelFactory = Ext.ModelManager.getModel(this.modelName),
            store = this.getStore();


        me.model = store.getById(key);        


        if (me.model === null) {
            me.isLoading = true;

            if (store.isLoading()) {
                store.on('load', function () {
                    me.isLoading = false;
                    me.model = store.getById(key);
                    me.set(me.model);
                    
                }, me, { single: true });
            } else {
                Ext.log({ msg: 'unknonw cat id ' + key, level: 'warn' });
                
            }
        } else {
            this.set(this.model);
        }

        this.fetchCmsPageDoc();


    },

    set: function (model, add) {
        this.isLoading = false;
        if (model.$className == this.modelName) {
            this.model = model;
        } else {
            this.cmsPageDoc = model;
        }
        if (this.model && this.cmsPageDoc) {
            this.fireEvent('load', this);
        }

    },
    
    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.Categories');
    },

    isHidden: function () {
        return this.get().get('isHidden');
    },

    setHidden: function (hide) {
        this.get().set('isHidden', hide);
    },

    getId: function () {
        return parseInt(this.pageContext.categoryId, 10);
    },
    getCmsPageDoc: function () {
        return this.cmsPageDoc;
    },

    fetchCmsPageDoc: function () {
        var me = this,
            cmsDoc,
            pageReq = me.pageContext.cmsContext.page;

        if (pageReq.id) {
            Taco.model.Entity.load({ documentListName: pageReq.documentListName, id: pageReq.id }, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.Entity', {
                entityType:'cms',
                documentType: pageReq.documentType,
                name: pageReq.path,
                documentListName: pageReq.documentListName
            });
            me.set(cmsDoc);
        }
    },

    addSaveTasks: function (tasks) {
        if (this.get().getFacetSets()) {
            tasks.add({
                store: this.get().getFacetSets(),
                dependencyFilter: function (task) {
                    return !!task.updateForm;
                }
            });
        }
        this.callParent(arguments);
    },

    isDirty: function () {
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
            Ext.create('Taco.view.website.settings.CategoryDocument', {
                record: me.getCmsPageDoc()
            }),
            Ext.create('Taco.view.website.settings.CatalogSeo', {
                record: me.get()
            })
        ];
    }
});