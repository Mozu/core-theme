/**
 * @class Taco.view.customSchema.Split
 */


Ext.define('Taco.view.customSchema.Split', {
    extend: 'Taco.core.ux.content.SplitContainer',
    alias: [
        'widget.entity-split',
        'widget.entity.split'
    ],
    requires: [
        'Taco.core.ux.mixins.SplitEditor',
        'Taco.view.publishing.component.button.PublishButton',
        'Taco.core.ux.action.ProgressButton',
        'Taco.view.customSchema.Grid',
        'Taco.core.ux.grid.MenuColumn' // just to refer to its classname
    ],



    mixins: {
        splitEditor: 'Taco.core.ux.mixins.SplitEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    stateId: 'taco-custom-schema',
    title: 'Custom Schema',

    createButtonEnabled: true,
    createButtonText: 'Create New Custom Schema',
    saveButtonVisible: true,
    cancelButtonVisible: false,
    advancedSearchConfig: {
        disableAdvancedSearch: true,
        emptySearchText: 'Search'
    },

    cls:'schema-header',

    contextConfig: {
        supportedLevels: ['t', 'm', 'c', 's']
    },

    statics: {
        factory: function (cfg, callback, scope) {
            callback.call(scope || this, Ext.create('Taco.view.customSchema.Split', cfg));
        }
    },

    initComponent: function () {

        this.config.west = [this.eastGrid()];

        this.config.east = [this.westGrid()];

        this.createButtonCfg = this.getCreateButton();

        this.saveButtonCfg = {
            xtype: 'progressbutton',
            disabled: true,
            itemId: 'saveActionButton',
            handler: function(cmp) {
                cmp.startLoading();
                Taco.app.fireEvent('dissmissmessages');
                this.form.doSave.apply(this.form, arguments);
            }
        };
        
        this.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        this.additionalActions = this.getAdditionalActions();

        this.moreButtonCfg = {
            menu: {
                cls: 'taco-ellipsis-split-button', 
                items: this.getMenuItems()
            },
            disabled: true
        };

        this.mixins.navHeader.init.apply(this);

        this.callParent(arguments);

    },

    onSaveSuccess: function(cmp, operation, isSuccessful) {
        this.saveActionButton.stopLoading();
        if (isSuccessful) {
            this.showMessage('Save Complete');
            this.enableButtons(cmp.record);
        }
    },

    updateSearchContext: function(store) {
        this.navHeader.down('taco-filtercontainer').reconfigureStore(store);
    },

    getCreateButton: function() {
        return {
            xtype: 'splitbutton',
            handler: function() {
                // do nothing;
            },
            menu: {
                cls: 'taco-header-split-button',
                items: [
                    {
                        text: 'Create Default',
                        handler: this.onCreate.bind(this)
                    },
                    {
                        text: 'Create Raw',
                        handler: this.onCreate.bind(this, { editMode: 'raw' })
                    }
                ]
            }
        }
    },

    enableButtons: function(record) {
        this.publishActionButton = this.down('#publishActionButton');
        this.moreActionButton = this.down('#moreActionButton');
        this.saveActionButton = this.down('#saveActionButton');
        this.publishActionButton.addRecord(record);
        this.moreActionButton [record && record.get('entityType') === 'cms' ? 'enable' : 'disable']();

        this.saveActionButton[record ? 'enable' : 'disable']();
        
    },

    getAdditionalActions: function() {
        var me = this;

        return [
            {
                xtype: 'publishbutton',
                itemId: 'publishActionButton',
                scope: this,
                disabled: true,
                handler: function(cmp) {
                    cmp.startLoading();
                    var record = me.getCurrentEntityRecord();
                    record.publish({
                        success: function() {
                            cmp.stopLoading();
                            record.data.publishState = 'active';
                            me.enableButtons(record);
                            me.showMessage('Published', 'info', 1000);
                        }
                    });
                },

                onMoveToPublish: function(record, code) {
                    me.publishActionButton.setLoading(true);
                    record.setPublishCode(code, function() {
                        me.showMessage('Moved to Publish Set');
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
                    me.showMessage('Removed');
                },

                onDiscardDraft: function(record) {
                    me.publishActionButton.setLoading(true);

                    record.discardDraft(function() {
                        me.publishActionButton.setLoading(false);
                        me.publishActionButton.disable();
                        me.showMessage('Discarded');
                        me.cardPanel.getLayout().setActiveItem(0);
                    });
                    
                }
            }
        ];
    },

    getMenuItems: function() {
        var me = this;

        return [
            {
                text: 'Preview in Live Site',
                itemId: 'previewActionButton',
                handler: function() {
                    
                    var record = me.getCurrentEntityRecord();
                    var siteId = Taco.app.context.getContextAtLevel('s').id;
                    var url = "/cms/" + record.get('listFQN') + "/" + record.get('name');

                    window.open('/_gosite/' + siteId + '?environment=live&redir=' + encodeURIComponent(url));
                }
            }, 
            {
                text: 'Preview in Staging Site',
                itemId: 'previewStagingActionButton',
                handler: function() {

                    var record = me.getCurrentEntityRecord();
                    var siteId = Taco.app.context.getContextAtLevel('s').id;
                    var url = "/cms/" + record.get('listFQN') + "/" + record.get('name');

                    window.open('/_gosite/' + siteId + '?environment=staging&redir=' + encodeURIComponent(url));
                }
            }, 
            {
                text: 'Duplicate',
                handler: function() {
                    var copyRec = me.getCurrentEntityRecord().copy({
                        name: null,
                        id: null
                    });
                    
                    if (copyRec.get('name')) {
                        copyRec.set('name', null);
                        copyRec.set('id', null);
                    }

                    copyRec.phantom = true;
                    me.loadEditor(copyRec);
                }
            }];
    },

    getCurrentEntityRecord: function() {
        return this.record;
    },

    eastGrid: function() {

    	this.entityGrid = Ext.create('Taco.view.customSchema.SchemaList', {
    		entityType: 'mzdb',
    		title: 'Entities',
    		autoSelectFirstItem: true
    	});

    	this.documentGrid = Ext.create('Taco.view.customSchema.SchemaList', {
			entityType: 'cms',
    		title: 'Documents'
    	});

        return Ext.create('Ext.tab.Panel', {
        	title: false,
            layout: 'fit',
            header: false,
            cls: 'taco-tabbar-header',
            style: {
                border: 'none'
            },
            tabBar: {
                defaults: {
                    flex: 1
                }
            },
            items: [
                this.documentGrid,
            	this.entityGrid
            ],
            listeners: {
                afterrender: function() {
                    Ext.Array.each(this.tabBar.items.items, function(button) {
                       button.addCls('taco-link-button');
                    });
                },
                tabchange: function(tabPanel, newCard, oldCard) {
                    oldCard.clearSelection();
                }

            }
        });
    },

    westGrid: function() {

        var me = this;

        me.contentContainer = Ext.widget('container', {
            flex: 1,
            layout: 'fit',
            listeners: {
                itemedit: me.onItemEdit,
                savesuccess: me.onSaveSuccess.bind(me),
                savefailure: me.saveFailure,
                // render: me.enableButtons,
                scope: me
            }
        });

        me.entityGrid = Ext.create('Taco.view.customSchema.Grid');

        this.cardPanel = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'card'
            },
            itemId: 'dynamicGridHolder',
            items: [
                me.entityGrid,
                me.contentContainer
            ]
        });

        return this.cardPanel;
    },

    onItemEdit: function(view, record, metaData, options) {
        var me = this;

        record.reload({
            success: function() {
                me.record = record;
                me.contentContainer.removeAll();
                me.grid = null;
                me.form = Ext.create('Taco.view.customSchema.DynamicFormContainer', {
                    record: record,
                    ui: 'subform-section',
                    defaults: {
                        margin: '10 10 10 10',
                    },
                    bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
                    editMode: options ? options.editMode : null,
                    editor: me.editors.findEditor(record)
                });
                me.contentContainer.add(me.form);
                me.enableButtons(record);
                me.cardPanel.getLayout().setActiveItem(1);
            }
        });

        
        Taco.core.StateManager.addState('customschema?entityType=' + record.get('entityType') + '&list=' + record.get('listFQN') + '&record=' + record.get('id'));
    },

    loadEditor: function (record, opts) {
        var me = this;
        var editor = me.editors.findEditor(record);
        var options = opts || {};

        if (!editor && options.editMode !== 'raw') {
            Taco.app.fireEvent('setmessage', 'No Editor defined for this schema type', 'error');
            return false;
        }

        me.contentContainer.removeAll();

        me.form = Ext.create('Taco.view.customSchema.DynamicFormContainer', {
            record: record,
            bubbleEvents: ['savesuccess', 'saveSuccess', 'savefailure'],
            editor: editor,
            editMode: options.editMode
        });

//        me.addADRIfRequired(record);
        me.contentContainer.add(me.form);
        me.enableButtons(record);
        me.cardPanel.getLayout().setActiveItem(1);
    },


    onCreate: function(options) {

        var me = this;
        var grid = me.down('#dymanicEnityGrid');
        var currentList = grid.listMetaData;
        var record;
        var menu;
        var createActionButton = me.createActionButton || me.down('#createActionButton');

        if (!currentList) {
            return false;
        }

        record = new Taco.model.Entity({
            listFQN: currentList.get('listFQN') || currentList.get('name'),
            tenantId: Taco.app.context.getTenantId(),
            entityType: currentList.get('entityType'),
            documentTypeFQN: currentList.get('documentTypes') && currentList.get('documentTypes').length ? currentList.get('documentTypes')[0] : undefined,
            properties: {},
            item: {},
            listFlags: {
                enableADR: currentList.get('enableActiveDateRanges'),
                enablePublishing: currentList.get('enablePublishing')
            }
        });

        // TODO: TALK TO THOM ABOUT THIS LOGIC

        if (currentList.get('documentTypes') && currentList.get('documentTypes').length > 1) {
            record.set('documentTypeFQN', currentList.get('documentTypes'));
        }

        me.loadEditor(record, options);
    },

  

    handleAddToEast: function (ct, cmp) {
        
    },

    onRecordChange: function (record) {
       
    },

    onSelectRecord: function (record) {
        
    },

    updateSplit: function (nextSplit) {

    },

    showMessage: function(msg) {
        Taco.app.fireEvent('setmessage', msg, 'success');
    }

});
