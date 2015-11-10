/**
 * @class Taco.view.website.entityAdapters.ProductEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.ProductEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.view.website.settings.CatalogSeo'
    ],
    modelName: 'Taco.model.Product',
    showNameEditor: false,
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
            modelFactory.load(key, {
                success: function (record) {
                    me.set(record, true);
                }
            });
        } else {
            this.set(this.record);
        }

        this.fetchCmsPageDoc();


    },

    getTitle: function() {
        if (this.record) return this.record.get('productName');
    },


    getDocument: function () {
        return this.getCmsPageDoc();
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
                entityType: 'cms',
                documentTypeFQN: pageReq.documentTypeFQN,
                name: pageReq.path,
                listFQN: pageReq.listFQN,
                properties: {
                    page_type_definition: 'product'
                }
            });
            me.set(cmsDoc);
        }
    },


    getId: function () {
        return this.pageContext.productCode;
    },

    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.Products');
    },

    isHidden: function () {
        return !this.get().get('isActive');
    },

    setHidden: function (hide) {
        this.get().set('isActive', !hide);
    },


    addSaveTasks: function (tasks) {

        var record = this.get();
        this.manager.pageSettings.addSaveTasks(tasks);

        if (this.dynamicFormContainer) {
            tasks.add([
                {
                    updateRecord: this.getCmsPageDoc(),
                    updateForm: this.dynamicFormContainer
                }, {
                    saveRecord: this.getCmsPageDoc()
                }
            ]);
        }

        
        tasks.add({
            saveRecord: record,
            dependencyFilter: function (item) {
                return item.updateRecord && (item.updateRecord.modelName == 'Taco.model.ProductInCatalogInfo' || item.updateRecord.modelName == 'Taco.model.Product');
            }
        });


    },



    getCmsPageDoc: function () {
        return this.cmsPageDoc;
    },
    getPageSettings: function () {

        var ret = this.callParent(arguments);
        var me = this;

        //fix broken themes
        if (ret.length == 0) {
            me.dynamicFormContainer = Ext.create('Taco.view.entityManager.DynamicFormContainer', { editor: Ext.create("Taco.model.EntityEditor", { code: "Ext.widget({xtype: 'mz-form-productPage'});" }), record: this.getCmsPageDoc(), showNameEditor: this.showNameEditor });
            ret.push(me.dynamicFormContainer);
        }

        ret.push(
            Ext.create('Taco.view.website.settings.CatalogSeo', {
                record: me.get()
            })
        );

        return ret;


    }
});