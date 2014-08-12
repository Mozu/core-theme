/**
 * @class Taco.core.ux.browser.Browsable
 * @author Travis Johns
 * Grid Mixin
 */

Ext.define('Taco.core.ux.browser.Browsable', {
    requires: ['Taco.core.util.ExceptionWhiner', 'Taco.core.ux.grid.AddEntityRow', 'Taco.core.ux.grid.plugins.AutoSelect'],
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
        secondToolbarItems:null,
        
        showAddEntityRow : false,

        // turns on the row editor behavior of the grid;  Create button will create new record and show the rowEditor;  click on the row will show the editor
        enableRowEditing: false,
        
        // optional prevlidation check by subclass before showing the row editor. return false to cancel create;
        beforeRowCreate: Ext.emptyFn,
        
        // optional prevlidation check by subclass before showing the row editor. return false to cancel update;
        beforeRowUpdate : Ext.emptyFn,

        // subclass can specify what the data should be by default when doing a create via the rowEditor
        defaultRowEditingData: null,

        cls: 'taco-content-browserpage',

        gridPanelDefaults: {
            enableColumnHide: true,
            paged: true
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
                if ( Ext.Array.indexOf(Taco.user.behaviors, behavior) == -1) {
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
        var me = this;

        this.gridPanelConf = Ext.clone(this.gridPanelConf);
        
        if (!this.header) {
            this.header = {};
        } else {
            //if header was defined in config and therefore existing on the prototype. then the destroyed objectes would stick around... badness would prevail
            this.header = Ext.clone(this.header);
        }
                
        if (!this.gridPanelConf.plugins) {
            this.gridPanelConf.plugins = [];
        }

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
               this.gridPanelConf.plugins.push("autoselect");
        }

        if (this.enableRowEditing) {
            // update the button text to be "Save"
            Ext.grid.RowEditor.prototype.saveBtnText = "Save";
            
            this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToMoveEditor: 1,
                clicksToEdit: 1,
                errorSummary: false,
                onCtrlEnterKey: function () {                    
                    me.onRowEditorCreate();
                },
                listeners: {
                    'edit': {
                        fn: this.onRowEditorUpdate,
                        scope:this
                    },
                    'cancelEdit': {
                        fn: this.onRowEditorCancel,
                        scope: this
                    }
                    
                },
                autoCancel: false
            });            
            
            this.gridPanelConf.plugins.push(this.rowEditor);
            this.launchEditorOnClick = false;
        }


        // add grid row selection plugin.
        //this.gridPanelConf.plugins.push();
        
        

        Ext.applyIf(this.header, {
            actions: [{
                xtype: 'primarybutton',
                itemId: 'newbutton',
                hidden: ! this.allowCreate(),
                listeners: {
                    click: function () {
                        var controller = this.getControllerName();
                        
                        if (this.enableRowEditing) {
                            this.onRowEditorCreate();
                        } else if (controller) {
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
        
        
        // only pass the store through the store manager if its not already a store;
        if (!this.store.isStore) {
            this.store = Taco.core.data.StoreManager.getOrCreate(this.store);
        }

        if (this.store && this.store.getProxy()) {
            this.mon(this.store.getProxy(), 'exception', function (proxy, response, operation, eOpts) {
                var error, msg;

                if (operation && operation.error && operation.error.remoteException) {
                    if (operation.error.remoteException.wasHandled) {
                        return;
                    }
                    error = operation.error.remoteException;
                    
                } else {
                    error = Ext.create('Taco.core.data.RemoteException', { response: response });

                    if (operation) {
                        if (!operation.error) {
                            operation.error = {};
                        }
                        operation.error.remoteException = error;
                    }

                }
                error.wasHandled = true;
                msg = error.getMessage() || 'An error occurred';
                Taco.app.fireEvent('setmessage', msg, 'error');
            }, this);
        }

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

        // don't load if the store is explicitly set autoLoad false;
        
        if ((this.store.autoLoad!=false)  && !this.store.hasLoaded()) {
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
        this.gridPager = Ext.create('Ext.toolbar.Paging', {
            dock: 'bottom',
            componentCls: 'x-grid-paging-toolbar',
            displayInfo: true,
            store: this.store,
            inputItemWidth: 45,
            border: '0 1 1'
        });
        

        return this.gridPager;
    },
    
    // logic for selecting a row in grids;
    //doDefaultSeleciton: function (selModel) {        
    //    selModel.select(0, false, false);
    //},

    createGridPanel: function(conf) {
        var me =this;

        Ext.applyIf(conf, this.gridPanelDefaults);
        conf = Taco.app.context.forCurrentContext(conf);
        if (conf.paged) {
            conf.dockedItems = Ext.clone(conf.dockedItems || []);
            conf.dockedItems.push(this.createGridPager());
        }

        conf.store = this.store;


        //this.showAddEntityRow = true;
        
        if (this.showAddEntityRow) {
            if (!conf.features) {
                conf.features = [];
            }

            conf.features.push({
                ftype: 'taco.addentityrow'
            })            
        }

        var gridPanel = this.gridPanel = Ext.create(this.gridPanelClass, conf);
        
        this.mon(this.gridPanel.view, 'itemclick', this.onItemClick, me)

        // treat enter key as a click;
        this.mon(this.gridPanel.view, 'itemkeydown', function (view, record, item, index, e, eOpts) {
            var metaData = null;            
            if (e.getKey() == e.ENTER && !this.enableRowEditing) {
                this.launchEditor(record, metaData);
            }
        }, me)

        if (this.launchEditorOnClick) {            
            this.mon(this.gridPanel.view, 'cellclick', this.onCellClick, me)
        }

        var menuColumns = Ext.Array.filter(this.gridPanel.columns, function (col) { return col.isXType('taco.menucolumn'); });
        if (this.disableContextMenuClick !== true && menuColumns && menuColumns.length == 1) {

            this.gridPanel.on('itemcontextmenu', function (cmp, record, item, index, e) {
                var eventData = {
                    grid: cmp.ownerCt,
                    rowIndex: index,
                    header: menuColumns[0],
                    e: e,
                    record: record,
                    item: item
                },
                    menu = menuColumns[0].getMenu(eventData);

                menu.on('hide', function () {
                    // need to clear and reselect to get focus set after menu closes;
                    // deselect old record
                    this.gridPanel.getSelectionModel().deselect(record);
                    //reselect old record
                    this.gridPanel.getSelectionModel().select(record,false, false);
                }, me)


               
                //e.preventDefault();
                e.stopEvent();
                menu.showAt(e.xy);
            }, this);

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

    createItemBrowser: function (conf) {
        
        
        this.itemBrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
            itemStore: this.store,
            secondToolbarItems: this.secondToolbarItems,
            options: this.options,
            itemType: this.token,
            typeName: this.typeName,
            gridHeaderLabel: this.gridHeaderLabel,
            filterFormConf: this.filterFormConf,
            filterProperties: this.filterProperties,
            advancedSearchConfig: this.advancedSearchConfig,
            isCollectionContext: Taco.app.context.getCurrent().contextType === "m",
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

    createSidebar: function () {
        
        // this.filterList = Ext.create('Taco.core.ux.browser.FilterList', {
        //     itemType: this.token
        // });

        // this.sidebar = {
        //     items: [this.filterList]
        // };

        // this.filterList.on('itemclick', function (cmp, record) {
        //     var newFilter = record && record.get('configuration');
        //     if (newFilter) {
        //         this.store.clearFilter(true); // clear silently so as not to throw two dataChanged events
        //         this.store.filter([newFilter]);
        //     } else {
        //         this.store.clearFilter();
        //     }
        // }, this);
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
            record = eventData.record;
            

        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this",
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    
                    var store = grid.getStore();
                    grid.setLoading(true);
                    store.remove(record);
                    store.sync({
                        success: function (m) {                            
                            grid.setLoading(false);
                        },
                        failure: function (m) {
                            store.reload();
                            grid.setLoading(false);

                            var text = "Unknown error.";
                            if (m.exceptions && Taco.core.util.ExceptionWhiner.wasHandled(m.exceptions)) {
                                return;
                            }
                            if (m.exceptions) {
                                text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
                            }

                            Taco.app.fireEvent('setmessage', text, 'error');

                        }

                    });
                }
            }
        });

    },

    onRowEditorUpdate: function(editor, context, opts) {
        var record = context.record;
        
        // check with the rowEditor to see if creation is allowed;
        if (this.beforeRowUpdate(this.rowEditor, this.store) === false) {
            return;
        }

        record.save({
            success: function (record, operation) {
                record.commit();
            },
            failure: function (record, operation) {
                //handle failure(s) here
                Taco.app.fireEvent('setmessage', 'Error saving item', 'error');
            }
        });
    },
    
    onRowEditorCancel: function(editor, context, opts) {
        var record = context.record,
            isNewRecord = record.phantom;
        // clear unpersisted new records when the user its the cancel button;
        if (isNewRecord && !record.leaveOnCancel) {            
            this.store.remove(record);

            if (this.gridPanel.store.getCount()) {
                this.gridPanel.getSelectionModel().selectRange(0, 0, false);
            }
        }
    },

    onRowEditorCreate : function() {
        this.rowEditor.cancelEdit();
        
        // check with the rowEditor to see if creation is allowed;
        if (this.beforeRowCreate(this.rowEditor, this.store) === false) {
            return;
        }

        // Create a model instance
        var modelName = this.store.model.getName();
        var r = Ext.create(modelName, this.defaultRowEditingData);
        this.store.insert(0, r);
        this.rowEditor.startEdit(0, 0);
        this.rowEditor.editor.focusContextCell()
    },
    
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        if (!header) {
            return;
        }
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