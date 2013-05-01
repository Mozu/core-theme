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
        me.store.on("load", function(s, node, records, successful, eOpts) {
            me.setHidden(records);
        });

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
                text: 'Products',
                flex: 1,
                dataIndex: 'productCount'
            }],

            actions: [{
                tooltip: 'Toggle Hidden',
                iconCls: 'taco-action-hide',
                eventName: 'hidecategory'
            }, {
                tooltip: 'Duplicate Category',
                iconCls: 'taco-action-addsub',
                eventName: 'duplicatecategory'
            }, {
                tooltip: 'Delete',
                iconCls: 'taco-action-delete',
                eventName: 'deletecategory'
            }],

            dockedItems: [{
                xtype: 'quickadder',
                helperText: 'Click to add a new category'
            }, {
                xtype: 'toolbar',
                cls: 'taco-secondary-actions',
                dock: 'top',
                items: [this.notifier, '->',
                {
                    xtype: 'button',
                    text: 'Expand All',
                    handler: function () {
                        this.findParentByType('treelist').expandAll();
                    }
                }, '-',
                {
                    xtype: 'button',
                    text: 'Collapse All',
                    handler: function () {
                        this.findParentByType('treelist').collapseAll();
                    }
                }]
            }],

            listeners: {
                hidecategory: function (list, index) {
                    var model = list.store.getAt(index),
                        row = Ext.get(list.all.elements[index]),
                        hiddenCls = 'taco-row-hidden';

                    var hidden = !model.get("isHidden");

                    model.set("isHidden", hidden);
                    model.set("cls", model.get("cls") == hiddenCls ? '' : hiddenCls);
                    console.log(model);

                    model.save({
                        success: function (m) {
                            Taco.app.fireEvent('setmessage', 'Category visibility changed.', 'status', list);
                        },
                        failure: function (m) {
                            var msg;
                            model.set("cls", (hidden) ? '' : hiddenCls);

                            if (m.exceptions && m.exceptions.length > 0) {
                                msg = m.exceptions[0].error;
                            }

                            Taco.app.fireEvent('setmessage', 'Category visibility change failed. This probably because it has children with different visibility settings.', 'error', list);
                        }
                    });
                },

                itemmove: function (node, oldParent, newParent, index, options) {
                    var me = this;
                    me.setLoading(true);
                    me.getStore().sync({
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

                duplicatecategory: function (list, index) {
                    var me = this;
                    var model = list.store.getAt(index);
                    me.setLoading(true);

                    model.duplicate({
                        success: function (copy) {
                            model.parentNode.appendChild(copy);

                            me.getStore().sync({
                                success: function (m) {
                                    me.setLoading(false);
                                    me.fireEvent('setmessage', 'Category copied.', 'status', copy);
                                },

                                failure: function (m) {
                                    me.setLoading(false);
                                    me.fireEvent('setmessage', 'Category creation failed.', 'error', m);
                                }
                            });
                        },
                        failure: function (m, operation) {
                            me.setLoading(false);
                            me.fireEvent('setmessage', 'Category creation failed.', 'error', model);
                        }
                    });
                },

                deletecategory: function (list, index, index2, actionEl, e, model) {
                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        text: 'Are you sure you want to delete this category?',

                        listeners: {
                            confirm: function () {
                                model.remove();
                                this.setLoading(true);
                                this.getStore().sync({
                                    success: function () {
                                        this.setLoading(false);
                                    },

                                    failure: function () {
                                        this.setLoading(false);
                                    },
                                    scope: this
                                });
                            },
                            scope: this
                        }
                    });
                }
            }
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [me.treelist]
        });

        me.callParent(arguments);

        this.down('quickadder').on({
            commit: function (quickAdder, newCategoryName) {
                var newNode, root = this.getRootNode();

                newNode = root.insertBefore({
                    name: newCategoryName
                }, root.firstChild);

                this.setLoading(true);

                if (this.autoSync) {
                    this.store.sync({
                        callback: function () {
                            this.setLoading(false);
                        },
                        success: function () {
                            this.fireEvent('setmessage', 'category created', 'status');
                        },
                        failure: function (batch) {
                            newNode.remove();
                            if (batch.exceptions && batch.exceptions.length > 0) {
                                this.fireEvent('setmessage', batch.exceptions[0].error, 'error');
                            }
                            else {
                                this.fireEvent('setmessage', 'failed to add category', 'error');
                            }
                        },
                        scope: this
                    });
                }
                this.view.el.scrollTo('top', 0, true);
            },
            scope: this.treelist
        });

        var treeview = me.treelist.down('treeview');
        treeview.mon(treeview, 'itemclick', me.onItemClick, me);

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

