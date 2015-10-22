/**
 * @class Taco.view.website.entityAdapters.BaseEntityAdapter
 */
Ext.define('Taco.view.website.entityAdapters.BaseEntityAdapter', {
    extend: 'Ext.util.Observable',
    requires: [],
    showNameEditor: true,
    allowedActions: {
        copy: false,
        preview: false,
        destroy: false,
        more: false
    },
    constructor: function() {
        this.callParent(arguments);
        this.manager.entitypeTypeHandler = this;
        this.load();
        this.mon(this.manager, 'activecardchanged', this.onManagerActiveItemChange, this);
    },
    onManagerActiveItemChange: function(manager, activeItem) {
        if (activeItem.itemId === 'pageEditor' && this.webPageNeedsRefresh) {
            this.webPageNeedsRefresh = false;
            this.manager.reloadPage();
        }
    },
    getDocument: function() {
        return this.get();
    },
    getPageSettings: function() {

        var me = this,
            doc = this.getDocument(),
            customerEditor,
            ret = [];
        
        this.manager.pageSettings.removeAll();
            
        if (!customerEditor) {
            customerEditor = me.manager.entityEditors.findEditor(doc);
        }
        if (customerEditor) {
            me.dynamicFormContainer = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
                editor: customerEditor,
                record: doc,
                showNameEditor: me.showNameEditor
            });
            ret.push(me.dynamicFormContainer);
        } else {
            var form = Ext.create('Taco.core.ux.form.Form', {
                record: doc
            });
            ret.push(form);
        }

        if (doc && doc.data && doc.data.listSupportsADR) {
            var ADRitems = [{
                xtype: 'panel',
                collapsible: 'true',
                ui: 'subform',
                title: 'Active Date Range',
                itemId: 'activeDateRangePanel',
                layout: {
                    type: 'vbox',
                    align : 'stretch'
                },
                items: [{
                    xtype: 'mz-input-date',
                    name: 'document.startDate',
                    fieldLabel: 'Start Date',
                    value: doc.get('startDate')
                }, {
                    xtype: 'mz-input-date',
                    name: 'document.endDate',
                    fieldLabel: 'End Date',
                    value : doc.get('endDate')
                }]
            }];

            ADRitems.forEach(function(adrInput) {
                if (me && me.dynamicFormContainer && me.dynamicFormContainer.dynamicForm) {
                    me.dynamicFormContainer.dynamicForm.add(adrInput);
                }
            });
        }

        return ret;
    },
    deleteRecord: function() {
        var me = this,
            record = this.get();
        if (me.fireEvent('destroy', record) !== false) {
            if (record) {
                record.destroy({
                    callback: function() {
                        me.fireEvent('destroy', record);
                    }
                });
            }
        }
    },
    getId: function() {
        if (this.record) {
            return this.record.getLoadParams();
        }
        if (!this.pageContext.cmsContext.page.listFQN || !this.pageContext.cmsContext.page.id) {
            return undefined;
        }
        return {
            listFQN: this.pageContext.cmsContext.page.listFQN,
            id: this.pageContext.cmsContext.page.id
        };
    },
    get: function() {
        return this.record;
    },
    getSaveTask: function() {
        var me = this,
            tasks = Ext.create('Taco.core.ux.form.Tasks'),
            properties = [],
            document,
            source;
        if (me.editor) {
            me.editor.dirtyStateCheck();
            if (me.editor.isDirty()) {
                if (me.getDocument()) {
                    me.getDocument().setDirty();
                } 
                if ((me.pageContext.editMode || "").toLowerCase() === 'template') {
                    source = me.pageContext.cmsContext.template;
                } else if ((me.pageContext.editMode || "").toLowerCase() === 'site') {
                    source = me.pageContext.cmsContext.site;
                } else {
                    source = me.pageContext.cmsContext.page;
                }
                document = me.getDocument();
                if (document) {
                    properties = Ext.clone(document.get('properties'));
                    properties.dropzones = properties.dropzones || [];
                }
                Ext.each(me.editor.persistanceData(), function(zone) {
                    var existing = Ext.Array.findBy(properties.dropzones, function (x) {
                        //adding tollerance for older docs that had the wrong case on the id addtribute.
                        return (x.id || x.Id ||  '').toLowerCase() === (zone.id || zone.Id || '').toLowerCase();
                    });
                    if (existing) {
                        Ext.Array.remove(properties.dropzones, existing);
                    }
                    zone.source = source;
                    properties.dropzones.push(zone);
                });
                if (document) {
                    document.set('properties', Ext.clone(properties));
                } else {
                    tasks.add({
                        fn: function(t) {
                            Ext.Ajax.request({
                                url: '/admin/app/cmsdocument/widgetdata/update',
                                method: 'post',
                                jsonData: {
                                    zones: properties.dropzones,
                                    source: source
                                },
                                success: function() {
                                    t.callback();
                                }
                            });
                        }
                    });
                }
                tasks.on('complete', function(endTasks) {
                    if (Ext.isEmpty(endTasks.errors)) {
                        this.editor.resetDirtyState();
                    }
                }, this);
            }
        }
        tasks.on('complete', function() {
            me.webPageNeedsRefresh = true;
            me.fireEvent('savesuccess', me);
        });
        this.addSaveTasks(tasks);
        return tasks;
    },
    publish: function() {
        if (!this.pageContext || !this.pageContext.cmsContext) {
            return;
        }
        var store = Ext.create('Taco.store.CmsDocumentDrafts');
        Ext.Object.each(this.pageContext.cmsContext, function(key, value) {
            if (value.id) {
                var doc = store.add({
                    id: value.id
                })[0];
                doc.set('isPublished', true);
            }
        }, this);
        store.sync({
            success: function() {
                this.manager.setPublishable(false);
            },
            scope: this
        });
    },
    isDirty: function() {
        return false;
    },
    isHidden: function() {
        return false;
    },
    load: function() {
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
            success: function(record) {
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
    set: function(record, add) {
        this.isLoading = false;
        this.record = record;
        if (add) {
            this.getStore().add(this.record);
        }
        this.setPubState();
        if (this.record) {
            this.mon(this.record, 'aftercommit', this.setPubState, this);
        }
        this.fireEvent('load', record);
    },
    setPubState: function() {
        if (this.getDocument() && this.getDocument().get('publishState') === 'draft') {
            this.manager.showHideButtons(['isPublishable'], true);
            this.manager.setPublishable(true);
            this.manager.updateDraftIcon(this.getDocument());
        }
        if (!this.pageContext || !this.pageContext.cmsContext) {
            return;
        }
        Ext.Object.each(this.pageContext.cmsContext, function(key, value) {
            if (value && value.publishState === 'draft') {
                this.manager.setPublishable(true);
                this.manager.updateDraftIcon(this.getDocument());
            }
        }, this);
    },
    addSaveTasks: function(tasks) {
        this.manager.pageSettings.addSaveTasks(tasks);
        if (this.dynamicFormContainer) {
            tasks.add([{
                updateRecord: this.get(),
                updateForm: this.dynamicFormContainer
            }, {
                saveRecord: this.get()
            }]);
        }
    },
    getStore: Ext.emptyFn,
    setHidden: Ext.emptyFn,
    unload: Ext.emptyFn
});
