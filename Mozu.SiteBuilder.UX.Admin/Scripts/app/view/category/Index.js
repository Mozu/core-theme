/**
 * @class Taco.view.category.Index
 */
Ext.define('Taco.view.category.Index', {
    extend: 'Taco.core.ux.browser.SearchListTree',
    requires: [
        'Taco.core.ux.TreeList',
     
        'Taco.store.CategoriesTree'
    ],

    createButtonText: "Create New Category",
    createButtonVisible: true,

    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: [ 'c', 's']
    },

    enableNavHeader: true,

    addContentViewPadding: true,

    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    enableSearchBarInHeader: false,

    enablePaging: false,

    enableSearch: false,

    title: 'Categories',

    initComponent: function () {
        var me = this;

        this.createButtonConfig = {
            xtype: 'button',
            text: me.createButtonText,
            margin: "0 0 0 10",
            ui: 'action-primary',
            scale: 'medium',
            hidden: !me.createButtonVisible,
            itemId: 'createActionButton',
            scope: me
        };

        this.createButtonCfg = {
            handler: Ext.emptyFn,
            menu: {
                plain: true,
                showSeparator: false,
                listeners: {
                    click: {
                        fn: function (menu, menuItem, e) {
                            if (!menuItem) {
                                return;
                            }

                            var url = (menuItem.getItemId() == "Dynamic") ? 'categories/createdynamic' : 'categories/create';
                            Taco.core.StateManager.attemptNavigate(url);
                        },
                        scope: me,
                        delegate: "x-menu-item-link"
                    }
                },
                items: [
                    {
                        text: "Static Category",
                        itemId:"Static"
                    }, {
                        text: "Dynamic Category",
                        itemId: "Dynamic"
                    }
                ]
            }
        };

        me.store = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        me.viewConfig = Ext.apply(me.viewConfig, {
            animate: false,
            stripeRows: true,
            onExpand: Ext.emptyFn,
            enableTextSelection: true
        });

        me.columns = [
        {
            xtype: 'treecolumn',
            text: 'Name',
            flex: 1,
            checkboxText:'',
            dataIndex: 'name',
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
            }
        }, 
        {
            xtype: 'treecolumn',
            text: 'Code',
            flex: 2,
            checkboxText:'',
            dataIndex: 'categoryCode',
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
            }
        }, 
        {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.Category',
                    behavior: 'update'
                },
                
                menuColumnHandler: function (item, eventData) {
                    var record = eventData.record;
                    Ext.defer(function () {
                        Taco.core.StateManager.attemptNavigate('categories/edit/' + record.getId(), { complexMetaData: { record: record } });
                    }, 1, this);

                }
            },
            {
                text: 'Duplicate',
                requiredBehaviors: {
                    model: 'Taco.model.Category',
                    behavior: 'create'
                },
                menuColumnHandler: function (item, eventData) {                        
                    var record = eventData.record,
                        metaData = {
                            id: record.getId()
                        };
                    
                    Taco.app.StateManager.attemptNavigate('categories/duplicate/' + record.getId(), metaData);
                }
            }, {
                text: 'Delete',
                requiredBehaviors: {
                    model: 'Taco.model.Category',
                    behavior: 'destroy'
                },
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }];

        me.moreButtonCfg = {
            scope: this,
            menu: {
                plain: true,
                shadow: false,
                items: [
                    {
                        text: 'Expand All',
                        handler: function (menuItem) {
                           this.expandAll()
                        },
                        scope: this
                    }, 
                    {
                        text: 'Collapse All',
                        handler: function (menuItem) {
                            this.collapseAll()
                        },
                        scope: this
                    }
                ]
            }
        };

        me.listeners ={
            cellclick: me.onCellClick,
            itemmove: me.onItemMove,
            scope: me
        };

        me.callParent(arguments);
    },


    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (this.getSelectionText()) {  // inherited from the launchEditor mixin;
            return;                     // if the user has highlighted text, do not launch editor
        }
        var target= Ext.fly(e.getTarget()),
            metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);

        if (target.hasCls('x-tree-expander')) {
            return;
        }

        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
            e.preventDefault();

            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }

            this.launchEditor(record, metaData);
        }
    },

    onItemClick: function (view, record, elm, index, e) {
        this.launchEditor(record);
    },

    onItemMove: function (node, oldParent, newParent, index, options) {
        var me = this,
            store = me.store,
            i;

        if (newParent && newParent.childNodes) {
            //resequence nodes if needed
            for (i = 0; i < newParent.childNodes.length; i++) {
                if (newParent.childNodes[i].get('sequence') !== i) {
                    newParent.childNodes[i].set('sequence', i);
                }
            }
        }

        if (store.isDirty()) {
            me.setLoading(true);
        }

        store.sync({
            success: function (m) {
                me.setLoading(false);
                me.fireEvent('setmessage', 'Item moved successfully', 'status', m);
            },
            failure: function (m) {
                me.setLoading(false);
                me.fireEvent('setmessage', 'Item move failed', 'error', m);
            }
        });
    },

    destroyMenuColumnHandler: function (item, eventData) {
        var isLeaf = eventData.record.get('leaf');

        if (isLeaf) {
            this.deleteLeafNode(eventData.record, eventData.grid);
        } else {
            this.deleteParentNode(eventData.record, eventData.grid);
        }
    },

    deleteParentNode: function (record, grid) {
        var me = this,
            confirm = Ext.create('Taco.view.category.ConfirmDeleteOfSubcategoriesModal', {
                title: 'Delete Category',
                confirmMessage: 'Are you sure you want to delete this category?',
                record: record,
                onDeleteIt: function(modal, cascadeDelete) {
                    record.set('cascadeDelete', cascadeDelete);
                    me.syncRemoveRecordFromStore(grid, record, !cascadeDelete);
                }
            }
        );
    },

    deleteLeafNode: function(record, grid) {
        var me = this;
        Ext.MessageBox.show({
            title: 'Delete Category',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this category?",
            closable: false,
            buttons: Ext.Msg.OKCANCEL,
            fn: function (val) {
                if (val === 'ok') {
                    me.syncRemoveRecordFromStore(grid, record, false);
                }
            }
        });
    },

    syncRemoveRecordFromStore: function (grid, record, reloadGridToMoveSubcategoryUp) {
        var store = grid.getStore();
        grid.setLoading(true);
        record.remove();

        store.sync({
            success: function (m) {
                grid.setLoading(false);
                if (reloadGridToMoveSubcategoryUp) {
                    grid.getStore().load(); 
                }
            },
            failure: function (m) {
                grid.setLoading(false);
                grid.getStore().load();
                Taco.app.fireEvent('setmessage', 'Failed to delete the category', 'error', m);
            }

        });
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('categories/edit/' + record.getId(), { complexMetaData: { record: record} });
        }, 1, this);
        return;
    },

    setHidden: function (records) {
        var me = this;

        Ext.each(records, function (item, index, list) {
            var hiddenCls = '';
            if (item.get("isHidden")) {
                hiddenCls = "taco-row-hidden";
            }
            item.set("cls", item.get("cls") == hiddenCls ? '' : hiddenCls);

            if (item.childNodes.length > 0) {
                me.setHidden(item.childNodes);
            }
        });
    }
});
