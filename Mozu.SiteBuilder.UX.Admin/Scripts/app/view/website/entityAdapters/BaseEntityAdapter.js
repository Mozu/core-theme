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
    },

    deleteRecord: function () {
        var me = this,
            model = this.get();

        if (me.fireEvent('destroy', model) != false) {
            if (model) {
                model.destroy({
                    callback: function () {
                        me.fireEvent('destroy', model);
                    }
                });
            }
        }
    },

    get: function () {
        return this.model;
    },

    getSaveTask: function () {
        var me = this,
            tasks = Ext.create('Taco.core.ux.form.Tasks'),
            zoneData = [],
            source,
            json;
        //hack travis to fix.
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
                if (!Ext.isEmpty(zone.rows)) {
                    //todo: check pc for edit type... page/vs template
                    zone.source = source;
                    zoneData.push(zone);
                }
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
        var me = this,
            key = this.getId(),
            modelFactory = Ext.ModelManager.getModel(this.modelName),
            store = this.getStore();

        me.model = store.getById(key);
        if (me.model === null) {
            me.isLoading = true;
            modelFactory.load(key, {
                success: function (record) {
                    me.set(record, true);
                }
            });
        } else {
            this.set(this.model);
        }
    },

    set: function (model, add) {
        this.isLoading = false;
        this.model = model;
        if (add) {
            this.getStore().add(this.model);
        }
        this.fireEvent('load', model);
    },

    addSaveTasks: function (tasks) {
        this.manager.pageSettings.addSaveTasks(tasks);
    },
    getId: Ext.emptyFn,
    getStore: Ext.emptyFn,
    setHidden: Ext.emptyFn,
    unload: Ext.emptyFn
});