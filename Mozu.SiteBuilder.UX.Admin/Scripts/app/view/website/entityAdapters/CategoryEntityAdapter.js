/**
 * @class Taco.view.website.entityAdapters.CategoryEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [

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


        me.record = store.getById(key);        


        if (me.record === null) {
            me.isLoading = true;

            if (store.isLoading()) {
                store.on('load', function () {
                    me.isLoading = false;
                    me.record = store.getById(key);
                    me.set(me.record);
                    
                }, me, { single: true });
            } else {
                Ext.log({ msg: 'unknonw cat id ' + key, level: 'warn' });
                
            }
        } else {
            this.set(this.record);
        }

        this.fetchCmsPageDoc();


    },

    set: function (record, add) {
        this.isLoading = false;
        if (record.$className == this.modelName) {
            this.record = record;
        } else {
            this.cmsPageDoc = record;
        }
        if (this.record && this.cmsPageDoc) {
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
            Taco.model.Entity.load({ listFQN: pageReq.listFQN, id: pageReq.id }, {
                success: function (doc) {
                    me.set(doc);
                }
            });
        } else {
            cmsDoc = Ext.create('Taco.model.Entity', {
                entityType:'cms',
                documentTypeFQN: pageReq.documentTypeFQN,
                name: pageReq.path,
                listFQN: pageReq.listFQN
            });
            me.set(cmsDoc);
        }
    },

    addSaveTasks: function (tasks) {
        this.callParent(arguments);
        if (this.get().getFacetSets()) {
            tasks.add({
                store: this.get().getFacetSets(),
                dependencyFilter: function (task) {
                    return !!task.updateForm;
                }
            });
        }
      

      
    },

    isDirty: function () {
        if (this.record && this.record.facetSetStore) {
            return this.record.facetSetStore.isDirty();
        }

        return false;
    },

    getPageSettings: function () {


        var me = this,
            ret = this.callParent(arguments);
        
        return ret.concat(
        [
            Ext.create('Taco.view.website.settings.facets.Facets', {
                record: me.get()
            }),
            Ext.create('Taco.view.website.settings.CatalogSeo', {
                record: me.get()
            })
        ]);


    }
});