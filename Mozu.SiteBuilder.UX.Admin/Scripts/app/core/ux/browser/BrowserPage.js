/**
 * @class Taco.core.ux.browser.BrowserPage
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.browser.BrowserPage', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.browserpage',
    requires: ['Taco.core.ux.grid.Panel', 'Taco.core.ux.TilePanel', 'Taco.core.ux.grid.Pager', 'Ext.util.Inflector', 'Ext.form.Panel', 'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 'Taco.core.ux.FilterableDataView', 'Taco.core.ux.modal.Confirmation', 'Taco.core.ux.browser.ItemBrowser', 'Ext.selection.CheckboxModel', 'Taco.core.ux.browser.FilterList', 'Taco.core.ux.browser.Modal'],

    typeName: 'Item',
    createButtonPrefix: "Create New ",
    useGridPanel: true,
    useTilePanel: false,
    gridPanelClass: 'Taco.core.ux.grid.Panel',
    tilePanelClass: 'Taco.core.ux.TilePanel', 
    filterProperty: 'name',
    hasSidebar: true,

    header: {
        actions: [
        {
            xtype: 'secondarybutton',
            text: 'Edit Records',
            listeners: {
                click: function () {
                    this.launchBulkEditor();
                }
            }
        },{
            xtype: 'primarybutton',
            itemId: 'newbutton',
            listeners: {
                click: function () {
                    this.launchEditor(Ext.create(this.modelName));
                }
            }
        }]
    },

    cls: 'taco-content-browserpage',

    updateRecordTypeName: function () {
        var me = this,
            pluralName = Ext.util.Inflector.pluralize(this.typeName);
        this.token = this.token || pluralName.toLowerCase();
        this.header.title = pluralName;
        Ext.Array.some(this.header.actions, function (item) {
            if (item.itemId === "newbutton" && !item.text) {
                item.text = me.createButtonPrefix + me.typeName;
                return true;
            }
        });
    },

    acquireStore: function() {
        var me = this;
        if (me.store) {
            return me.store = Taco.core.data.StoreManager.getOrCreate(me.store);
        }
       
    },

    createGridPager: function () {
        this.gridPager = Ext.create('Taco.core.ux.grid.Pager', {
            store: this.store
        });
        return this.gridPager;
    },

    gridPanelDefaults: {
        enableColumnHide: true,
        paged: true,
        selModel: Ext.create('Ext.selection.CheckboxModel', { // must pass instantiated selModel, config-only is bugged
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        })
    },

    tilePanelDefaults: {

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
        this.gridPanel.view.on('cellclick', this.onCellClick, this);
        return this.gridPanel;
    },

    createTilePanel: function(conf) {
        Ext.applyIf(conf, this.tilePanelDefaults);
        conf = Taco.app.context.forCurrentContext(conf);
        conf.store = this.store;
        this.tilePanel = Ext.create(this.tilePanelClass, conf);
        this.tilePanel.on({
            tileclick: function (view, record) {
                var me = this;
                me.launchEditor(record);
              
            }
        });
        return this.tilePanel;
    },
    getControllerName:function() {
        
    },

    createItemBrowser: function(conf) {
        var me = this;
        me.itemBrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
            itemStore: me.store,
            itemType: me.token,
            typeName: me.typeName,
            filterProperty: me.filterProperty,
            flex: 1,
            isCollectionContext: Taco.app.context.getCurrent().contextType === "c",
            gridPanel: me.gridPanel,
            tilePanel: me.tilePanel,
            useGridPanel: me.useGridPanel,
            useTilePanel: me.useTilePanel
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
            layout: 'fit',
            items: [this.itemBrowser]
        });
    },

    createSidebar: function() {
        var me = this;
        me.filterList = Ext.create('Taco.core.ux.browser.FilterList', {
            itemType: me.token
        });
        me.sidebar = {
            items: [me.filterList]
        };
        me.filterList.on('itemclick', function (cmp, record) {
            var newFilter = record && record.get('configuration');
            if (newFilter) {
                me.store.clearFilter(true); // clear silently so as not to throw two dataChanged events
                me.store.filter([newFilter]);
            } else {
                me.store.clearFilter();
            }
        });
    },


    onNavigate: function (newState) {
       
    },

    launchBulkEditor: function () {
        Ext.create('Taco.core.ux.browser.Modal', {
            store: this.store,
            columns: this.bulkEditorColumns || this.gridPanelConf.columns
        });
    },

    launchEditor: function (record, options) {
        var me = this,
            modelClass = Ext.ClassManager.get(me.modelName);
        if ( Ext.isString(record)) {
            modelClass.load(record, {
                success: function (model) {
                    me.launchLoadedEditor(model, options);
                }
            });
            return;
        }
        me.launchLoadedEditor(record, options);
    },

    launchLoadedEditor: function(record, options){
        var me = this,
            editToken = me.token + '/edit/',
            editorView;

       //todoPassOPtions
        Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), { complexMetaData: { record: record, options: options } });
        return;

        editorView = Ext.create(me.editorName, {
            logicalParent: me,
            options: options,
            listeners: {
                cancel: function () {
                    editorView.destroy();
                    Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller);

                },
                aftersave: function (editor, record, isEdit) {
                    //editorView.destroy();
                    //Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller);

                    var md = Taco.core.StateManager.getCurrentState().metaData;
                    if (md && md.action == 'create') {
                        Ext.defer(function() {
                            Taco.app.contentView.remove(editorView);
                            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId());
                        }, 2, me);

                    }
                    

                },
                created:function (newRecord, editor) {
                    editorView.destroy();
                    me.launchEditor(newRecord);
                    Taco.app.StateManager.addState(editToken + newRecord.getId());
                },
                create: function (newRecord) {
                    me.isDirty = true;
                    editorView.destroy();
                    me.launchEditor(newRecord);
                    Taco.app.StateManager.addState(me.token + '/create');
                },
                copyrecord: function (newRecord) {
                    editorView.destroy();
                    if (!me.store.getById(newRecord.getId())) {
                        me.store.insert(0, newRecord);
                    }
                    me.launchEditor(newRecord);
                    Taco.app.StateManager.addState(editToken + newRecord.getId() || -1, { id: newRecord.getId() || -1 });
                },
                deleterecord: function () {
                    editorView.destroy();
                    Taco.app.StateManager.addState(me.token);
                },
                scope: this
            },
            record: record
        });


        //editorView.mon(record, 'idchanged', function (record, oldId, newId, eOpts) {
        //    if (record.phantom || record.dirty) {
        //        return;
        //    }
        //    Taco.app.contentView.remove(editorView);
        //    Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + newId);
        //}, this, { delay: 10, single: true, scope: this});

        Taco.app.contentView.add(editorView);
    },
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        
        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation!==false ) {
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
    },

    constructor: function() {
        this.acquireStore();
        this.callParent(arguments);
    },

    initComponent: function () {
        this.updateRecordTypeName();
        this.store = Taco.core.data.StoreManager.getOrCreate(this.store);
        if (this.useGridPanel) this.createGridPanel(this.gridPanelConf || {});
        if (this.useTilePanel) this.createTilePanel(this.tilePanelConf || {});
        this.createItemBrowser();
        this.layoutItemBrowser();
        if (this.hasSidebar) this.createSidebar();
        this.callParent(arguments);
        if (!this.store.hasLoaded()) {
            this.store.load();
        }
    }
});