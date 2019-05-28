/**
 * @class Taco.view.website.entityAdapters.CategoryEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.CategoryEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.view.website.settings.facets.Facets',
        'Taco.view.website.settings.CatalogSeo'
    ],
    showNameEditor: false,
    modelName: 'Taco.model.Category',
    showNameEditor: false,
    allowedActions: {
        copy: false,
        preview: true,
        destroy: false
    },
    supportsPageVariations: true,
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

        this.setPubState();

        if (this.getDocument()) {
            this.mon(this.getDocument(), 'aftercommit', this.setPubState, this);
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
    getDocument: function () {
        return this.getCmsPageDoc();
    },
    getVariationTitle: function () {
        if (this.isVariation) {
            return this.cmsPageDoc.get('name');
        }
        return "";
    },
    getTitle: function () {
        return this.pageContext.title;
    },
    navigateToPageVariation: function (record) {
        var url = "",
            documentListName = record.get("listFQN"),
            currentVariation = this.variationStore.getActiveVariation(),
            catID = record.get("name").split('-') || [];

        catID = catID[catID.length - 1] || null;

        if (catID) {
            url = "/c/" + catID
        }

        if (currentVariation) {
            url += "?variationId=" + currentVariation.get("id");
        }

        this.fireEvent("navigateFrame", url, record);
    },
    fetchCmsPageDoc: function (id) {
        var me = this,
            cmsDoc,
            pageReq = me.pageContext.cmsContext.page,
            pageId = pageReq.id

        if (pageId) {

            Taco.model.Entity.load({ listFQN: pageReq.listFQN, id: pageId }, {
                success: function (doc) {

                    function variationId() {
                        var id = doc.get('properties').variationId;
                        if (id) {
                            return id;
                        }
                        return null;
                    }

                    me.isVariation = false;

                    if (me.supportsPageVariations) {
                        var variationId = variationId();
                        me.variationStore.originalDocument = doc;
                        me.variationStore.removeAll();

                        me.variationStore.loadData(me.getPageVariations());

                        var activeVariations = window.sessionStorage.getItem('activeVariations');
                        activeVariations = JSON.parse(activeVariations) || {};
                        var activeVariationId = activeVariations[doc.get('name')];

                        if (activeVariationId) {

                            var variationRecord = me.variationStore.findRecord("id", activeVariationId);

                            if (variationRecord) {
                                me.isVariation = true;
                                me.variationStore.tagActiveVariation(variationRecord);
                                me.set(variationRecord);

                                return;
                            }
                        }
                    }

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
                    page_type_definition: 'category'
                }
            });
            me.variationStore.originalDocument = cmsDoc;
            me.variationStore.removeAll();
            me.set(cmsDoc);
        }
    },

    addSaveTasks: function (tasks) {

        var me = this,
            cmsDocument = this.getCmsPageDoc();
        if (this.supportsPageVariations) {
            var propValues = {
                variation_rule: me.manager.pageRules.getValues()
            };

            if (cmsDocument.get("id") !== me.variationStore.originalDocument.get("id")) {
                cmsDocument.set(
                    "properties",
                    Object.assign(cmsDocument.get("properties"), propValues)
                );
            }
            cmsDocument.setDirty(true);
        }

        this.manager.pageSettings.addSaveTasks(tasks);

        if (this.dynamicFormContainer) {
            tasks.add([
                {
                    updateRecord: cmsDocument,
                    updateForm: this.dynamicFormContainer
                }, {
                    saveRecord: cmsDocument
                }
            ]);
        }

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


        //fix broken themes
        if (ret.length == 0) {
            me.dynamicFormContainer = Ext.create('Taco.view.customSchema.DynamicFormContainer', { editor: Ext.create("Taco.model.EntityEditor", { code: "Ext.widget({xtype: 'mz-form-categoryPage'});" }), record: this.getCmsPageDoc(), showNameEditor: this.showNameEditor });
            ret.push(me.dynamicFormContainer);
        }

        if (!this.isVariation) {
            ret = ret.concat(
                [
                    Ext.create('Taco.view.website.settings.facets.Facets', {
                        record: me.get()
                    }),
                ]);
        }


        ret = ret.concat(
            [
                Ext.create('Taco.view.website.settings.CatalogSeo', {
                    record: me.get()
                })
            ]);


        return ret;

    }
});