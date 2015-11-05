/**
 * @class Taco.view.order.Index
 */
Ext.define('Taco.view.entityManager.Index', {
    extend: 'Ext.panel.Panel',
    mixins: {
        //  editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions',
    },
    alias: 'widget.entityManager',
    requires: [
        'Taco.view.publishing.component.button.PublishButton',
        'Taco.core.ux.form.Form',
        'Taco.view.entityManager.Lists',
        'Taco.store.EntityEditors',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.core.data.StoreManager'
    ],
    title: 'Content/Entity',
    createButtonEnabled: true,
    contextConfig: {
        supportedLevels: ['t', 'm', 'c', 's']
    },
    enableNavHeader: true,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    doSave: function() {
        this.form.doSave.apply(this.form, arguments);
    },
    initComponent: function() {
        var me = this,
            metaData = Taco.core.StateManager.getCurrentState().metaData,
            qs = metaData.args[metaData.args.length - 1];

        me.additionalActions = [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'More',
            margin: '0 0 0 10',
            itemId: 'moreActionButton',
            scope: this,
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'Preview in Live Site',
                    itemId: 'previewActionButton',
                    handler: function() {
                        //scope is set to index on all action buttons by container.
                        var record = me.getCurrentEntityRecord(),
                            siteId = Taco.app.context.getContextAtLevel('s').id,
                            url = "/cms/" + record.get('listFQN') + "/" + record.get('name');
                        window.open('/_gosite/' + siteId + '?environment=live&redir=' + encodeURIComponent(url));
                    }
                }, {
                    text: 'Preview in Staging Site',
                    itemId: 'previewStagingActionButton',
                    handler: function() {
                        //scope is set to index on all action buttons by container.
                        var record = me.getCurrentEntityRecord(),
                            siteId = Taco.app.context.getContextAtLevel('s').id,
                            url = "/cms/" + record.get('listFQN') + "/" + record.get('name');
                        window.open('/_gosite/' + siteId + '?environment=staging&redir=' + encodeURIComponent(url));
                    }
                }, {
                    xtype: "menuseparator",
                    style: "border:0px;height:1px;background-color:#ccc;margin:6px 0px;"
                }, {
                    text: 'Duplicate',
                    handler: function() {
                        var copyRec = me.getCurrentEntityRecord().copy({
                            name: null,
                            id: null
                        });
                        if (copyRec.get('name')) {
                            copyRec.set('name', null);
                        }
                        copyRec.phantom = true;
                        me.loadEditor(copyRec);
                    }
                }, ]
            }
        }, 
        {
            xtype: 'publishbutton',
            itemId: 'publishActionButton',
            beforeItemId: 'saveActionButton',
            scope: this,
            handler: function() {
                var record = me.getCurrentEntityRecord();
                record.publish({
                    success: function() {
                        record.data.publishState = 'active';
                        me.showHideButtons();
                        me.showGrowl('Published', 'info', 1000);
                    }
                });
            },

            onMoveToPublish: function(record, code) {
                me.publishActionButton.setLoading(true);
                record.setPublishCode(code, function() {
                    me.showGrowl('Moved to Publish Set');
                    me.publishActionButton.setLoading(false);
                });
            },

            onRemoveFromPublishSet: function(record) {
                me.publishActionButton.setLoading(true);
                record.set('publishSetCode', '');
                record.save({
                    success: function() {
                        me.publishActionButton.setLoading(false);
                    }
                });
                me.showGrowl('Removed', 'info', 1000);
            },

            onDiscardDraft: function(record) {
                me.publishActionButton.setLoading(true);
                record.discardDraft(function() {
                    me.publishActionButton.setLoading(false);
                    me.showGrowl('Discarded', 'info', 1000);
                });
                me.lastListClicked.raw = me.lastListClicked.raw  || {};
                me.lastListClicked.raw.metaData = me.lastListClicked.raw.metaData || {};
                me.onOpenList(me.lastListClicked);
            }
        }];
        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');
        me.lists = Ext.create('Taco.view.entityManager.Lists', {
            listeners: {
                itemclick: function(tree, record) {
                    me.lastListClicked = record;
                    me.onOpenList(record);
                }
            }
        });
        me.contentContainer = Ext.widget('container', {
            flex: 1,
            layout: 'fit',
            listeners: {
                itemedit: me.onItemEdit,
                create: me.onCreate,
                savesuccess: me.saveSuccess,
                savefailure: me.saveFailure,
                render: me.showHideButtons,
                scope: this
            }
        });
        me.items = [
            me.lists,
            me.contentContainer
        ];
        if (this.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        }

        me.callParent(arguments);

        if (qs.entityType && qs.list) {
            me.on('render', function() {
                var fn = function() {
                    var listRecord;
                    Ext.Object.each(me.lists.store.tree.nodeHash, function(k, v) {
                        var md = v.raw.metaData;
                        if (md && qs.entityType === md.entityType && qs.list === md.name) {
                            listRecord = v;
                        }
                    });
                    if (listRecord) {
                        me.onOpenList(listRecord);
                        me.lastListClicked = listRecord;
                        me.lists.getSelectionModel().select(listRecord);
                    }
                };
                if (me.lists.store.isLoading()) {
                    me.mon(me.lists.store, 'load', fn, {
                        single: true
                    });
                } else {
                    fn();
                }
            });
        }
    },
    showHideButtons: function() {
        var me = this,
            header = this.getHeader(),
            record = this.getCurrentEntityRecord(),
            listMetaData = this.getListMetaData();

        this.saveActionButton = this.saveActionButton || header.down('#saveActionButton');
        this.cancelActionButton = this.cancelActionButton || header.down('#cancelActionButton');
        this.createActionButton = this.createActionButton || header.down('#createActionButton');
        this.publishActionButton = this.publishActionButton || header.down('#publishActionButton');
        this.moreActionButton = this.moreActionButton || header.down('#moreActionButton');
        this.saveActionButton.setVisible(me.form && me.form.supportsSaving);
        this.cancelActionButton.setVisible(false); //me.form);
        this.createActionButton.setVisible(me.grid);

        this.publishActionButton.addRecord(record);

        if (record && listMetaData.supportsPublishing) {
            this.publishActionButton.setVisible(true);
        } else {
            this.publishActionButton.setVisible(false);
        }

        this.moreActionButton.setVisible(me.getCurrentEntityRecord() && me.getCurrentEntityRecord().get('entityType') === 'cms');
    },
    getCurrentEntityRecord: function() {
        var me = this;
        return me.form ? me.form.record : null;
    },
    getListMetaData: function() {
        var me = this;
        return me.listmetaData;
    },
    onOpenList: function(record) {
        var me = this;
        if (!record.raw.metaData) {
            return;
        }
        me.listmetaData = record.raw.metaData;
        me.contentContainer.removeAll();
        me.form = me.grid = null;
        me.grid = Ext.create('Taco.view.entityManager.Grid', {
            listMetaData: record.raw.metaData,
            bubbleEvents: ['cellclick', 'create', 'itemedit']
        });
        Taco.core.StateManager.addState('entities?entityType=' + record.raw.metaData.entityType + '&list=' + record.raw.metaData.name);
        me.contentContainer.add(me.grid);
        me.showHideButtons();
    },
    onCreate: function(options) {
        var me = this,
            record = new Taco.model.Entity({
                listFQN: this.grid.listMetaData.listFQN || this.grid.listMetaData.name,
                tenantId: Taco.app.context.getTenantId(),
                entityType: this.grid.listMetaData.entityType,
                documentTypeFQN: this.grid.listMetaData.documentTypes && this.grid.listMetaData.documentTypes.length ? this.grid.listMetaData.documentTypes[0] : undefined,
                properties: {},
                item: {}
            }),
            menu;
        if (this.grid.listMetaData.documentTypes && this.grid.listMetaData.documentTypes.length > 1) {
            menu = Ext.widget({
                xtype: 'menu',
                itemHandler: function(cmp) {
                    record.set('documentTypeFQN', cmp.text);
                    me.loadEditor(record, options);
                }
            });
            Ext.Array.each(this.grid.listMetaData.documentTypes, function(dType) {
                menu.add({
                    text: dType,
                    handler: menu.itemHandler
                });
            });
            menu.showBy(me.createActionButton);
            return;
        }
        if (Ext.util.Cookies.get('debugext') === 'true') {
            menu = Ext.widget({
                xtype: 'menu',
                items: [{
                    text: 'Create Default',
                    handler: function() {
                        me.loadEditor(record, {
                           
                        });
                    }
                },{
                    text: 'Create Raw',
                    handler: function() {
                        me.loadEditor(record, {
                            editMode: 'raw'
                        });
                    }
                }]
            });
            menu.showBy(me.createActionButton);
            return;
        }
        me.loadEditor(record, options);
    },
    loadEditor: function (record, options) {
        var me = this,
            editor = me.editors.findEditor(record);

        options = options || {};
        if (!editor && options.editMode !== 'raw') {
            Taco.MessageBox.alert('Sorry!', 'No editor defined for this type');
            return;
        }
        me.contentContainer.removeAll();
        me.grid = null;
        me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
            record: record,
            bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
            editor: editor,
            editMode: options.editMode
        });
        me.addADRIfRequired(record);
        me.contentContainer.add(me.form);
        me.showHideButtons();
    },
    onItemEdit: function(view, record, metaData, options) {
        var me = this;
        record.reload({
            success: function() {
                me.contentContainer.removeAll();
                me.grid = null;
                me.form = Ext.create('Taco.view.entityManager.DynamicFormContainer', {
                    record: record,
                    ui: 'subform-section',
                    defaults: {
                        margin: '10 10 10 10',
                    },
                    bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
                    editMode: options ? options.editMode : null,
                    editor: me.editors.findEditor(record)
                });
                me.form = me.addADRIfRequired(record);
                me.contentContainer.add(me.form);
                me.showHideButtons();
            }
        });
        Taco.core.StateManager.addState('entities?entityType=' + metaData.entityType + '&list=' + metaData.name + '&record=' + record.get('name'));
    },
    addADRIfRequired: function (record) {
        var me = this;

        if(!me.form) return null;
        if(!record || !record.data || !record.data.listFlags || !record.data.listFlags.enableADR) return form;
        var adrPanel = Ext.create('Taco.core.ux.form.field.ActiveDateRange', {record: record});
        me.form.dynamicForm.add(adrPanel);
        return form;
    },
    saveSuccess: function() {
        this.mixins.navHeader.saveSuccess.call(this, arguments);
        this.showHideButtons();
    },  
    showGrowl: function(msg) {
        Taco.app.fireEvent('setgrowl', msg, 'info', 1000);
    }
});
