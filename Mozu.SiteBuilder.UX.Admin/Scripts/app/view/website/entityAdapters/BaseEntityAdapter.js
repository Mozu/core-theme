/**
 * @class Taco.view.website.entityAdapters.BaseEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.BaseEntityAdapter', {
    extend: 'Ext.util.Observable',
    requires: [],

    allowedActions: {
        copy: false,
        preview: false,
        destroy: false,
        more: false
    },

    constructor: function (config) {
        this.callParent(arguments);
        this.manager.entitypeTypeHandler = this;
        this.load();
        this.initPublishableState();
        this.mon(this.manager, 'activecardchanged', this.onManagerActiveItemChange, this);
    },

    onManagerActiveItemChange: function (manager, activeItem) {
        if (activeItem.itemId == 'pageEditor' && this.webPageNeedsRefresh) {
            this.webPageNeedsRefresh = false;
            this.manager.reloadPage();
        }
    },

    getDocument:function () {
        return this.get();
    },

    getPageSettings: function () {
        var me = this,
            doc = this.getDocument(),
            customerEditor,
            ret = [];

        if (!customerEditor) {
            customerEditor = me.manager.entityEditors.findEditor(doc);
        }
        if (customerEditor) {


            if (customerEditor) {
                me.dynamicFormContainer = Ext.create('Taco.view.entityManager.DynamicFormContainer', { editor: customerEditor, record: doc });
                ret.push(me.dynamicFormContainer);
            }

        }


        return ret;
    },


    deleteRecord: function () {
        var me = this,
            record = this.get();

        if (me.fireEvent('destroy', record) != false) {
            if (record) {
                record.destroy({
                    callback: function () {
                        me.fireEvent('destroy', record);
                    }
                });
            }
        }
    },
    getId: function () {
        if (this.record) {
            return this.record.getLoadParams();
        }
        if (!this.pageContext.cmsContext.page.documentListName || !this.pageContext.cmsContext.page.id) {
            return undefined;
        }
        return { documentListName: this.pageContext.cmsContext.page.documentListName, id: this.pageContext.cmsContext.page.id };
    },
    get: function () {
        return this.record;
    },

    getSaveTask: function () {
        var me = this,
            tasks = Ext.create('Taco.core.ux.form.Tasks'),
            zoneData = [],
            source,
            json;
       
        me.editor.dirtyStateCheck();
        if (me.editor.isDirty()) {
            if ((me.pageContext.editMode || "").toLowerCase() == 'template') {
                source = me.pageContext.cmsContext.template;
            } else if ((me.pageContext.editMode || "").toLowerCase() == 'site') {
                source = me.pageContext.cmsContext.site;
            } else {
                source = me.pageContext.cmsContext.page;
            }

            Ext.each(me.editor.persistanceData(), function (zone) {
               // if (!Ext.isEmpty(zone.rows)) {
                    //todo: check pc for edit type... page/vs template
                    zone.source = source;
                    zoneData.push(zone);
                //}
            });

            tasks.on('complete', function (endTasks) {
                if (Ext.isEmpty(endTasks.errors)) {
                    this.editor.resetDirtyState();
                    this.manager.setPublishable(true);
                }

            }, this);

            tasks.add({
                fn: function (t) {

                    Ext.Ajax.request({
                        url: '/admin/app/cmsdocument/widgetdata/update',
                        method: 'post',
                        jsonData: {
                            zones: zoneData,
                            source: source
                        },
                        success: function (response) {
                            t.callback();

                        }
                    });


                }
            });
        }

        tasks.on('complete', function () {
            me.webPageNeedsRefresh = true;
        });



        this.addSaveTasks(tasks);

        return tasks;
    },

    initPublishableState: function () {
        if (!this.pageContext || !this.pageContext.cmsContext) {
            return;
        }
        Ext.Object.each(this.pageContext.cmsContext, function (key, value, myself) {
            if (value && value.publishState == 'draft') {
                this.manager.setPublishable(true);
            }
        }, this);

    },

    publish: function () {
        if (!this.pageContext || !this.pageContext.cmsContext) {
            return;
        }
        var store = Ext.create('Taco.store.CmsDocumentDrafts');

        Ext.Object.each(this.pageContext.cmsContext, function (key, value, myself) {
            if (value.id) {
                var doc = store.add({ id: value.id })[0];
                doc.set('isPublished', true);
            }
        }, this);
        store.sync({
            success: function () {
                this.manager.setPublishable(false);
            },
            scope: this
        });
    },

    isDirty: function () {
        return false;
    },

    isHidden: function () {
        return false;
    },

    load: function () {
        var me = this;

        if (me.record) {
            this.set(me.record);
            return;
        }
        if (!this.getId()) {
            return;
        }

        Taco.model.Entity.load(this.getId(), {
            scope: this,
            success: function (record, operation) {
                this.set(record);
            }
        });
    },


    //load: function () {
    //    var me = this,
    //        key = this.getId(),
    //        modelFactory = Ext.ModelManager.getModel(this.modelName),
    //        store = this.getStore();
    //    if (!me.record) {
    //        me.record = store.getById(key);
    //    }
    //    if (me.record === null) {
    //        me.isLoading = true;
    //        modelFactory.load(key, {
    //            success: function (record) {
    //                me.set(record, true);
    //            }
    //        });
    //    } else {
    //        this.set(this.record);
    //    }
    //},

    set: function (record, add) {
        this.isLoading = false;
        this.record = record;
        if (add) {
            this.getStore().add(this.record);
        }
        this.fireEvent('load', record);
    },

    addSaveTasks: function (tasks) {
        this.manager.pageSettings.addSaveTasks(tasks);
        var tasks = this.callParent(arguments);
        if (this.dynamicFormContainer) {
            tasks.add([
                {
                    updateRecord: this.get(),
                    updateForm: this.dynamicFormContainer
                }, {
                    saveRecord: this.get()
                }
            ]);
        }
    },
    getId: function () {
        if (!this.pageContext.cmsContext.page || !this.pageContext.cmsContext.page.documentListName || !this.pageContext.cmsContext.page.id)
            return undefined;
        return { documentListName: this.pageContext.cmsContext.page.documentListName, id: this.pageContext.cmsContext.page.id };
    },

    getStore: Ext.emptyFn,
    setHidden: Ext.emptyFn,
    unload: Ext.emptyFn
});