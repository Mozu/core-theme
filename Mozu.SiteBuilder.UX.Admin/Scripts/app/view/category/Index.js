/**
 * @class Taco.view.category.Index
 */
Ext.define('Taco.view.category.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.TreeList',
     
        'Taco.store.CategoriesTree'
    ],

    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: [ 'c', 's']
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Categories',
            actions: [{
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                itemId: 'createActionButton',
                text: 'Create New Category',
                margin: '0 0 0 10',
                handler: function () {
                    Taco.core.StateManager.attemptNavigate('categories/create');
                
                }
            }]
        };

        me.store = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        me.treelist = Ext.create('Taco.core.ux.TreeList', {
            animate: false,
            enableColumnHide: false,
            store: me.store,
            viewConfig: {
                animate: false,
                stripeRows: true,
                onExpand: Ext.emptyFn
            },
            columns: [{
                xtype: 'treecolumn',
                text: 'Name',
                flex: 1,
                checkboxText:'',
                dataIndex: 'name',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                }
            }, {
                xtype: 'treecolumn',
                text: 'Code',
                flex: 2,
                checkboxText:'',
                dataIndex: 'categoryCode',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                }
            }, {
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
                
            }],
            dockedItems: [{
                xtype: 'container',
                dock: 'top',
                padding: '0 0 10',
                cls: 'taco-secondary-actions',
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'end'
                },
                items: [{
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Expand All',
                    allowDepress: false,
                    enableToggle: true,
                    scope: this,
                    toggleHandler: function (button, nextState) {
                        this.treelist.expandAll(function () {
                            button.toggle(false);
                        });
                    }
                }, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Collapse All',
                    margin: '0 0 0 10',
                    scope: this,
                    handler: function () {
                        this.treelist.collapseAll();
                    }
                }]
            }],
            listeners: {
                cellclick: me.onCellClick,
                itemmove: me.onItemMove,
                scope: me
            }
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [me.treelist]
        });

        me.callParent(arguments);
    },

    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
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
