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
    useTilePanel: true,
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
                    Taco.app.StateManager.addState(this.token + '/create');
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
        if (me.storeName) return me.store = Taco.core.data.StoreManager.getOrCreate({ type: me.storeName, clearFilters: true, clearSort: true });
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
                Taco.app.StateManager.addState(me.token + '/edit/' + record.getId(), { id: record.getId() });
            }
        });
        return this.tilePanel;
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
            tilePanel: me.tilePanel
        });

        me.itemBrowser.on({
            deleteitem: function (panel, record) {
                console.log('itembrowser delete fired', arguments);

                Ext.create('Taco.core.ux.modal.Confirmation', {
                    autoShow: true,
                    content: {
                        html: 'Are you sure you want to delete this ' + me.typeName.toLowerCase() + '?'
                    },
                    listeners: {
                        cancel: function () { },
                        confirm: function () {
                            panel.setLoading(true);
                            me.store.remove(record);
                            me.store.sync({
                                success: function (m) {
                                    panel.setLoading(false);
                                    Taco.app.fireEvent('setmessage', me.typeName + ' deleted.', 'status', m);
                                },
                                failure: function (m) {
                                    panel.setLoading(false);
                                    Taco.app.fireEvent('setmessage', me.typeName + ' deletion failed.', 'error', m);
                                }
                            });
                            console.log('sync complete');
                        }
                    }
                });
            },
            duplicateitem: function (panel, record) {
               
                record.duplicate({
                    success: function (copy) {
                       // panel.setLoading(false);k
                        Taco.app.fireEvent('setmessage', me.typeName + ' copied.', 'status', copy);
                        if (record.stores) {
                            Ext.Array.each(record.stores, function(store) {
                                if ( !store.getById(copy.getId())) {
                                    store.add(copy);
                                }
                                    
                            });
                        }
                      
                        me.launchEditor(copy);
                        Taco.app.StateManager.addState(me.token + '/edit/' + copy.getId() || -1, { id: copy.getId() || -1 });
                    },
                    failure: function (m, operation) {
                        panel.setLoading(false);
                        Taco.app.fireEvent('setmessage', me.typeName + ' failed to copy.', 'error', m);
                    }
                });
            },
            viewitem: function (panel, record) {
                window.open('/' + me.token + '/' + record.getId() + ((record.get('isActive'))? '':'?iseditmode=true'   ), 'preview');
            }
        });

        if( this.record && this.record.isModel ) {
            this.on({
                afterrender: function () {
                    this.launchLoadedEditor( this.record );        
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

    onGlobalModelSave: function (model) {
        var itemInStore = this.store.getById(model.getId());
        if (itemInStore == null) {
            this.store.add([model]);
            return;
        }
        if (itemInStore !== model) {
            itemInStore.copyData(model);
        }

    },
    onNavigate: function (newState) {
        // navigation events that i can totes handle include: 
        var md = newState.getMetaData();
        if (md.controller && md.controller === this.token && md.action === "edit") {
            this.launchEditor(md.args[0], md.args.pop());
            return false;
        }
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

        editorView = Ext.create(me.editorName, {
            logicalParent: me,
            options: options,
            listeners: {
                cancel: function () {
                    editorView.destroy();
                    Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller);

                },
                aftersave: function (editor, record, isEdit) {
                    editorView.destroy();
                    Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller);
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

        Taco.app.contentView.add(editorView);
    },

    onItemClick: function (view, record, elm, index, e) {
        var metaData = { id: record.getId() };
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }
            this.launchEditor(record, metaData);
            Taco.app.StateManager.addState(this.token + '/edit/' + record.getId(), metaData);
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
        this.store.load();
    }

});