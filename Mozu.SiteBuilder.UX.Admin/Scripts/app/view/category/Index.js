/**
 * @class Taco.view.category.Index
 */
Ext.define('Taco.view.category.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.TreeList', 'Taco.core.FormPanel', 'Taco.store.CategoriesTree'],

    requiresContextOfType: 's',
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
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Categories',
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Category',
                click: function () {
                    
                    me.launchEditor(Ext.create('Taco.model.Category'));
                }
            }]
        };

        
        me.store = Taco.core.data.StoreManager.getCategoryTreeBySite();
        //  me.store = { type: 'Taco.store.CategoriesTree' };
     
        
    

        
        
        //me.store.on("load", function(s, node, records, successful, eOpts) {
        //    me.setHidden(records);
        //});

        me.treelist = Ext.create('Taco.core.ux.TreeList', {
            store: me.store,
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
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [{
                    text: 'Delete',
                    menuColumnHandler: 'destroyMenuColumnHandler'
                }, {
                    text: 'Edit',
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        Ext.defer(function () {
                            Taco.core.StateManager.attemptNavigate('categories/edit/' + record.getId(), { complexMetaData: { record: record } });
                        }, 1, this);

                    }
                }]
                
            }],
            dockedItems: [
                //{
                //xtype: 'quickadder',
                //helperText: 'Click to add a new category'
                //},
            {
                xtype: 'container',
                dock: 'top',
                height: 30,
                cls: 'taco-secondary-actions',
                items: [this.notifier, {
                    xtype: 'action',
                    text: 'Expand All',
                    click: function () {
                        this.findParentByType('treelist').expandAll();
                    }
                }, {
                    xtype: 'action',
                    text: 'Collapse All',
                    click: function () {
                        this.findParentByType('treelist').collapseAll();
                    }
                }]
            }],
            viewConfig: { stripeRows: true },
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

        //this.down('quickadder').on({
        //    commit: function (quickAdder, newCategoryName) {
        //        var newNode, root = this.getRootNode();

        //        newNode = root.insertBefore({
        //            name: newCategoryName
        //        }, root.firstChild);

        //        this.setLoading(true);

        //        if (this.autoSync) {
        //            this.store.sync({
        //                callback: function () {
        //                    this.setLoading(false);
        //                },
        //                success: function () {
        //                    this.fireEvent('setmessage', 'category created', 'status');
        //                },
        //                failure: function (batch) {
        //                    newNode.remove();
        //                    if (batch.exceptions && batch.exceptions.length > 0) {
        //                        this.fireEvent('setmessage', batch.exceptions[0].error, 'error');
        //                    }
        //                    else {
        //                        this.fireEvent('setmessage', 'failed to add category', 'error');
        //                    }
        //                },
        //                scope: this
        //            });
        //        }
        //        this.view.el.scrollTo('top', 0, true);
        //    },
        //    scope: this.treelist
        //});

        var treeview = me.treelist.down('treeview');
       // treeview.mon(treeview, 'itemclick', me.onItemClick, me);

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
    onItemMove: function (node, oldParent, newParent, index, options) {
        var me = this,
            store = me.store;

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
                    record.remove();
                    
                    store.sync({
                        success: function (m) {
                            grid.setLoading(false);
                        },
                        failure: function (m) {
                           
                            grid.setLoading(false);
                            Ext.create('Taco.core.ux.modal.Alert', {
                                autoShow: true,
                                text: 'Delete Failed. <br /> TODO get error text'
                            });

                        }

                    });
                },
                scope: this
            }
        });
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('categories/edit/' + record.getId(), { complexMetaData: { record: record} });
        }, 1, this);
        return;
    },

    onItemClick: function (view, record, elm, index, e) {
        this.launchEditor(record);
    }

});

