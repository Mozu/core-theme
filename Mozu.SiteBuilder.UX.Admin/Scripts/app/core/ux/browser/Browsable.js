/**
 * @class Taco.core.ux.browser.Browsable
 * @author Travis Johns
 * Grid Mixin
 */

Ext.define('Taco.core.ux.browser.Browsable', {
    requires: ['Taco.core.util.ExceptionWhiner'],
    config: {
        typeName: 'Item',
        createButtonPrefix: "Create New ",
        useGridPanel: true,
        useTilePanel: false,
        gridPanelClass: 'Taco.core.ux.grid.Panel',
        tilePanelClass: 'Taco.core.ux.TilePanel', 
        filterProperty: 'name',
        hasSidebar: true,
        useEditRecordsButton: false,
        launchEditorOnClick: true,
        header: null,

        cls: 'taco-content-browserpage',

        gridPanelDefaults: {
            enableColumnHide: true,
            paged: true,
            selModel: {
                selType: 'checkboxmodel',
                checkOnly: true,
                showHeaderCheckbox: true,
                ignoreRightMouseSelection: true
            }
        },

        tilePanelDefaults: {

        }
    },


    allowCreate:function () {
        return this.allowMethod('create');
    },

    allowDestroy: function () {
        return this.allowMethod('destroy');
    },

    allowUpdate: function () {
        return this.allowMethod('update');
    },

    allowRead: function () {
        return this.allowMethod('read');
    },
    allowMethod:function (method) {
        var me = this,
            res = true,
            model;
            
        if (me.behaviors && me.behaviors[method]) {
            Ext.each(me.behaviors[method], function (behavior) {
                if (Taco.User.behaviors.indexOf(behavior) == -1) {
                    res = false;
                    return false;
                }
                return true;
            });
        } else if (me.modelName) {
            model = Ext.ModelManager.getModel(this.modelName);
            res = model.allowMethod(method);
            
       }
        
        return res;
    },
    initBrowserConfig: function () {

        if (!this.header) {
            this.header = {};
        }
        
        

        Ext.applyIf(this.header, {
            actions: [{
                xtype: 'secondarybutton',
                hidden:!this.allowUpdate() || !this.useEditRecordsButton,
                text: 'Edit Records',
                listeners: {
                    click: function () {
                        this.launchBulkEditor();
                    },
                    scope: this
                }
            },{
                xtype: 'primarybutton',
                itemId: 'newbutton',
                hidden: ! this.allowCreate(),
                listeners: {
                    click: function () {
                        var controller = this.getControllerName();
                        if (controller) {
                            Taco.app.StateManager.attemptNavigate(controller + '/create');
                        } else {
                            this.launchEditor(Ext.create(this.modelName));
                        }
                        
                        
                    },
                    scope: this
                }
            }]
        });
        
       


        this.updateRecordTypeName();

        this.store = Taco.core.data.StoreManager.getOrCreate(this.store);

        if (this.useGridPanel) {
            this.createGridPanel(this.gridPanelConf || {});
        }
        if (this.useTilePanel) {
            this.createTilePanel(this.tilePanelConf || {});
        }

        this.createItemBrowser();
        this.layoutItemBrowser();
        
        if (this.hasSidebar) {
            this.createSidebar();
        }
    },

    initBrowserListeners: function () {
        
        this.mon(this.store.getProxy(), 'exception', function (proxy, response, operation, eOpts) {
            if (operation.error && operation.error.remoteException) {
                //alert(operation.error.remoteException.getMessage());
            }

        }, this);

        if (!this.store.hasLoaded()) {
            this.store.load();
        }
    },

    updateRecordTypeName: function () {
        var pluralName = Ext.util.Inflector.pluralize(this.typeName);
        this.token = this.token || pluralName.toLowerCase();
        if (this.plural === false) {
            this.header.title = this.typeName;
        } else {
            this.header.title = pluralName;
        }
        
        var newCreateButtonText = this.createButtonPrefix + this.typeName;
        Ext.Array.some(this.header.actions, function (item) {
            if (item.itemId === "newbutton") {
                if (!item.rendered) {
                    item.text = newCreateButtonText;
                } else {
                    item.setText(newCreateButtonText);
                }
                return true;
            }
        }, this);
    },

    createGridPager: function () {
        this.gridPager = Ext.create('Taco.core.ux.grid.Pager', {
            store: this.store
        });
        return this.gridPager;
    },

    createGridPanel: function(conf) {
        Ext.applyIf(conf, this.gridPanelDefaults);
        conf = Taco.app.context.forCurrentContext(conf);
        if (conf.paged) {
            conf.dockedItems = Ext.clone(conf.dockedItems || []);
            conf.dockedItems.push(this.createGridPager());
        }
        conf.store = this.store;
        this.gridPanel = Ext.create(this.gridPanelClass, conf);
        
        this.gridPanel.view.on('itemclick', this.onItemClick, this);
        
        if (this.launchEditorOnClick) {
            this.gridPanel.view.on('cellclick', this.onCellClick, this);
        }
        return this.gridPanel;
    },

    createTilePanel: function(conf) {
        Ext.applyIf(conf, this.tilePanelDefaults);
        conf = Taco.app.context.forCurrentContext(conf);
        conf.store = this.store;
        this.tilePanel = Ext.create(this.tilePanelClass, conf);
        this.tilePanel.on({
            tileclick: function (view, record) {
                this.launchEditor(record);
            },
            scope: this
        });
        return this.tilePanel;
    },
    getControllerName:function() {
        var curState = Taco.core.StateManager.getCurrentState(), modelParts;
        if (this.controllerName) {
            return this.controllerName;
        }
        if (curState && curState.metaData && curState.metaData.controller) {
            return curState.metaData.controller;
        }
        return null;

    },

    createItemBrowser: function(conf) {
        this.itemBrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
            itemStore: this.store,
            options: this.options,
            itemType: this.token,
            typeName: this.typeName,
            filterFormConf: this.filterFormConf,
            filterProperties: this.filterProperties,
            isCollectionContext: Taco.app.context.getCurrent().contextType === "c",
            gridPanel: this.gridPanel,
            tilePanel: this.tilePanel,
            useGridPanel: this.useGridPanel,
            useTilePanel: this.useTilePanel
        });

        if (this.record && this.record.isModel) {
            this.on({
                afterrender: function () {
                    this.launchLoadedEditor(this.record);
                },
                scope: this
            });
        }
    },

    layoutItemBrowser: function () {
        Ext.apply(this.body, {
            layout: { type: 'fit' },
            items: [this.itemBrowser]
        });
    },

    createSidebar: function() {
        this.filterList = Ext.create('Taco.core.ux.browser.FilterList', {
            itemType: this.token
        });

        this.sidebar = {
            items: [this.filterList]
        };

        this.filterList.on('itemclick', function (cmp, record) {
            var newFilter = record && record.get('configuration');
            if (newFilter) {
                this.store.clearFilter(true); // clear silently so as not to throw two dataChanged events
                this.store.filter([newFilter]);
            } else {
                this.store.clearFilter();
            }
        }, this);
    },

    launchBulkEditor: function () {
        Ext.Error.raise('The "launchBulkEditor" method is not explicitly defined in the use of this mixin.');
    },

    launchEditor: function (record, options) {
        Ext.Error.raise('The "launchEditor" method is not explicitly defined in the use of this mixin.');
    },

    launchLoadedEditor: function (record, options) {
        Ext.Error.raise('The "launchLoadedEditor" method is not explicitly defined in the use of this mixin.');
    },
    
    editMenuColumnHandler: function (item, eventData) {
        var record = eventData.record,
            metaData = { id: record.getId() };

        this.launchEditor(record, metaData);
    },
    
    destroyMenuColumnHandler:function (item, eventData) {
        var grid = eventData.grid,
            record = eventData.record,
            modal;

        modal = Ext.create('Taco.core.ux.modal.Confirmation', {
            autoShow: true,
            content: {
                html: 'Are you sure you want to delete this?'
            },
            listeners: {
                cancel: Ext.emptyFn,
                confirm: function () {
                    var store = grid.getStore();
                    grid.setLoading(true);
                    store.remove(record);
                    store.sync({
                        success: function (m) {
                            grid.setLoading(false);
                        },
                        failure: function (m) {
                            var records = store.getRemovedRecords();
                            Ext.each(records, function(record) {
                                store.insert(record.index, record);
                            });
                                        
                            records.splice(0, records.length);
                            grid.setLoading(false);
                            
                            var text = "Unknown error."
                            if (m.exceptions) {
                                text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
                            }

                            Ext.create('Taco.core.ux.modal.Alert', {
                                autoShow: true,
                                text: 'Delete Failed. <br />' + text
                            });
                                        
                        }
                        
                    });
                },
                scope: this
            }
        });
    },
    
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        
        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation!==false && this.allowNavigation !== false) {
            e.preventDefault();
            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }
            this.launchEditor(record, metaData);
        }
       
    },

    onItemClick: function (view, record, elm, index, e) {
        var metaData = { id: record.getId() };
       
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }
            this.launchEditor(record, metaData);
        }
    }

});