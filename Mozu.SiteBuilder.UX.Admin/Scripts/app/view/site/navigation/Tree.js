/**
 * @class Taco.view.site.navigation.Tree
 */
Ext.define('Taco.view.site.navigation.Tree', {
    // extend: 'Taco.view.site.ToolboxPanel',
    extend: 'Ext.panel.Panel',
    requires: ['Taco.model.NavigationTreeNode', 'Taco.store.NavigationTreeNodes', 'Taco.view.site.navigation.PageCreator', 'Taco.view.site.navigation.ExternalLinkEditor', 'Taco.view.site.navigation.NavHeadings'],

    layout: 'auto',
    overflowY: 'auto',

    initComponent: function() {
        var me = this,
            navigationTreeNodeModel,
            cellEditing,
            navHeadings;

        navigationTreeNodeModel = Ext.ModelManager.getModel('Taco.model.NavigationTreeNode');
        navigationTreeNodeModel.prototype.initExpandable(navigationTreeNodeModel); // hack to get around cat expand when no children

        cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        });

        navHeadings = Ext.create('Taco.view.site.navigation.NavHeadings');

        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes');
        

        this.pageCreator = Ext.create('Taco.view.site.navigation.PageCreator', {
            parentPanel: me.parentPanel
        });

        this.searchBox = Ext.widget('textfield', {
            emptyText: 'Search...',
            enableKeyEvents: true,
            cls: Taco.baseCSSPrefix + 'toolbox-search',
            width: '100%'
        });

        this.tree = Ext.create('Taco.core.ux.TreeList', {
            hideHeaders: true,
            manageHeight: false,
            itemId: 'navigationTree',
            plugins: [cellEditing],
            features: [navHeadings],
            store: this.store,
            columns: [{
                xtype: 'treecolumn',
                flex: 1,
                dataIndex: 'name',
                renderer: function(value, metaData, record) {
                    var id = record.getId();
                    if (record.parentNode.isRoot()) {
                        return '<span>' + value + '</span><a href="#" data-page-creator="true" data-parent-id="' + id + '" >+ Add Page</a>';
                    } else {
                        return '<a href="#" class="taco-action-navigate">' + value + '</a>';
                    }
                },
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    style: { marginTop: '10px' }
                }
            }]
        });


        this.searchStore = Ext.create('Ext.data.Store', {
            fields: ['nodeType', 'name', 'iconCls', 'url'],
            proxy: {
                type: 'ajaxproxy',
                api: {
                    read: '/admin/app/navigation/search'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: 'message'
                }
            }
        });
        this.treeContextMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                nodeTypes: ['category'],
                text: 'Show Products',
                plain :true,
                handler: function(item, eventData) {
                    me.showCategoryProducts(item.record.get('originalId'));
                }
            }, {
                nodeTypes: ['link'],
                text: 'Edit',
                plain: true,
                handler: function (item, eventData) {
                    me.editLink(item.record, item);
                }
            }, {
                nodeTypes: ['page', 'link'],
                text: 'Delete',
                plain: true,
                handler: function (item, eventData) {
                    var nt = item.record.get('nodeType'),
                        confirm;

                    confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
                        text: 'Would you like to continue?',
                        title: 'Delete Page',
                        confirm: function() {
                            item.record.remove();
                            item.record.destroy({
                                callback: function(records, operation) {
                                    if (operation.success) {
                                        confirm.hide();
                                    } else {
                                        alert('error');
                                    }
                                }
                            });
                        },
                        autoShow: true
                    });
                }
            }]
    });
    this.searchGrid = Ext.widget('grid', {
            store: this.searchStore,
            columns: [{
                    header: 'Result',
                    xtype: 'templatecolumn',
                    tpl: '<div class="{iconCls}"><div style="padding-left: 25px"><a href="#" class="taco-action-navigate">{name}</a></div></div>',
                    flex: 1
                }
            ],
            listeners: {
                select: function(rowModel, record, index, eOpts) {
                    me.navigate(record);
                }
            },
            dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        '->',
                        {
                            xtype: 'secondaryaction',
                            text: 'Cancel',
                            listeners: {
                                click: function() {
                                    this.tabPanel.getLayout().setActiveItem(this.tree);
                                },
                                scope: me
                            }
                        }
                    ]
                }
            ]
        });

        this.productGrid = Ext.create('Taco.core.ux.grid.Panel', {
            columns: [{
                    text: 'Product Name',
                    dataIndex: 'productName',
                    flex: 1
                }
            ],
            hideHeaders: true,
            // hidden: true,
            listeners: {
                itemclick: function(panel, record) {
                    Taco.core.StateManager.attemptNavigate('/sites/product/' + record.getId());
                }
            },
            //height: 200,
            width: '100%',
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        '->',
                        {
                            xtype: 'secondaryaction',
                            text: 'Cancel',
                            listeners: {
                                click: function() {
                                    this.tabPanel.getLayout().setActiveItem(this.tree);
                                },
                                scope: me
                            }
                        }
                    ]
                }
            ],
            store: {
                type: 'Taco.store.Products',
                storeManagerConfig: {
                    createOnly: true
                },
                autoLoad: false
            }
        });

        this.tabPanel = Ext.widget('panel', {
            flex: 1,
            layout: 'card',
            items: [this.tree, this.productGrid, this.searchGrid]
            
        });


        // this.items = [this.searchBox, this.tree ];
        this.items = [this.searchBox, this.tabPanel];
        this.callParent(arguments);

        this.addEvents('editlink', 'navigationchange');
        this.enableBubble('editlink', 'navigationchange');

        this.attachEvents();

        this.add(this.pageCreator);

        this.tree.getSelectionModel().setSelectionMode('SINGLE');

    },

    attachEvents: function() {
        var me = this;

        // this panel
        this.mon(Taco.app, 'page-destroy', this.pageDestroyed, this);
        this.mon(Taco.app, 'page-navigate', this.pageNavigate, this);
        this.mon(Taco.app, 'pageentity-update', this.onPageEntiryUpdate, this);
        this.mon(Taco.app, 'Taco.model.CmsDocument.savesuccess', this.refreshTree, this);

        // this panel's store
        this.mon(this.store,
            {
                write: function(store, opt) {
                    var record, records = this.tree.getSelectionModel().getSelection();
                    if (records && records.length && records[0].parentNode) {
                        record = records[0];
                    } else {
                        record = this.tree.getRootNode().firstChild.firstChild;
                    }
                    this.fireEvent('navigationchange', store, record);
                    this.navigate(record);
                },
                move: function(node, oldParent, newParent, index, eOpts) {
                    node.set('editAction', 'move');
                    node.save();
                },
                scope: this
            }
        );
        

        // tree
        this.tree.on({
            //select: function(rowModel, record, index, eOpts) {
            //    this.isNewSelection = true;
            //    console.log(arguments);
            //},
            edit: function(editor, e) {
                e.record.set('editAction', 'rename');
                e.record.save();
            },
            itemmousedown: function (view, record, item, index, e, eOpts) {
                var cmp = Ext.fly(e.target);
                e.preventDefault();

                if (e.target.dataset.pageCreator) { //data-page-creator
                    this.isNewSelection = false;
                    this.pageCreator.reset(e.target.dataset);
                    this.pageCreator.show();

                }
            },
            itemclick: function(view, record, item, index, e, eOpts) {
                var cmp = Ext.fly(e.target);
                e.preventDefault();

                if (e.target.dataset.pageCreator) { //data-page-creator
                    this.isNewSelection = false;
                    this.pageCreator.reset(e.target.dataset);
                    this.pageCreator.show();

                } else {
                    this.isNewSelection = true;
                    this.navigate(record);
                }

            },
            //afteritemexpand: function(node, index, item, eOpts) {
            //    if (node.get('nodeType') != 'category') {
            //        return;
            //    }
            //    // me.showCategoryProducts(node.get('originalId'), true);
            //},
            scope: this
        });

        this.tree.getView().on({
            itemcontextmenu: function(view, record, item, index, e, eOpts) {

                var nt = record.get('nodeType'),
                    position = e.getXY();
                e.stopEvent();
                this.treeContextMenu.items.each(function(menuItem) {
                    menuItem.record = record;
                    if (menuItem.nodeTypes.indexOf(nt) > -1) {
                        menuItem.show();
                    } else {
                        menuItem.hide();
                    }
                });

                this.treeContextMenu.showAt(position);
            },
            scope: this
        });
    
        
        

        // page creator
        this.pageCreator.on({
            cancel: function() {
                me.pageCreator.hide();
            },
            save: function(creator, record) {
                var parentNode = me.store.getById(me.pageCreator.parentId);

                parentNode.appendChild(record);
                record.save();
                me.pageCreator.hide();
            }
        });

        // search box
        this.searchBox.on({
            keyup: {
                fn: this.keyUp,
                scope: this
            }
        });
    },

    navigate: function(record) {
        var url = record.get('url');

        if (url) {
            if (record.get('nodeType') == 'link') {
                //Taco.core.StateManager.attemptNavigate(
                //    Ext.create('Taco.core.AppState', {
                //        uri: '/sites/external-link',
                //        metaData: record.getData()
                //    }));
            } else {
                Taco.core.StateManager.attemptNavigate('/sites' + url);
            }
        }
    },

    showCategoryProducts: function(catId) {
        var me = this;

        this.tabPanel.getLayout().setActiveItem(this.productGrid);
        this.productGrid.store.filter({
            id: 'categoryIds',
            property: 'categoryIds',
            value: catId
        });


    },

    refreshTree: function() {
        this.tree.store.load();
    },

    onPageEntiryUpdate: function(store, model, operation) {
        var url, node, name, isHidden = false;

        if (operation != "commit") {
            return;
        }

        switch (model.modelName) {
        case 'Taco.model.Category':
            url = '/category/' + model.get('id');
            isHidden = model.get('isHidden');
            name = model.get('name');
            break;
        case 'Taco.model.Product':
            url = '/product/' + model.getId();
            isHidden = !model.get('isActive');
            name = model.get('name');
            break;
        case 'Taco.model.CmsDocument':
            url = '/pages/' + model.get('name');
            name = mode.get('name');
            break;
        }

        node = this.tree.getRootNode().findChild('url', url, true);

        if (node) {
            this.store.suspendAutoSync();
            node.set('name', name);
            node.set('isHidden', isHidden);
            node.commit();
            this.store.resumeAutoSync();
        }
    },

    keyUp: function(field) {


        this.tabPanel.getLayout().setActiveItem(this.searchGrid);

        var me = this,
            store = me.searchStore,
            val = field.getValue();

        store.currentPage = 1;

        if (val == "refresh" || val == "reload") {
            field.setValue('');
            this.refreshTree();
            return;
        }
        if (val.length === 0) {
            store.filters.removeAtKey(this.id);
            store.removeAll();
            this.resultPanel.getLayout().setActiveItem(this.tree);
            return;
        }
        if (val.length >= 3) {
            store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                anyMatch: true,
                property: me.filterProperty,
                value: val,
                root: 'data',
                filterFn: function() {
                    return true;
                } // filtering happens on server
            }));
            store.load();
            return;
        }
    },

    editLink: function(record, target) {
        var me = this;

        me.linkEditor = Ext.create('Taco.core.ux.modal.Mini', {
            width: 400,
            height: 200,
            destroyOnHide: true,
            items: [Ext.create('Taco.view.site.navigation.ExternalLinkEditor', {
                isEditMode: true,
                record: record,
                listeners: {
                    savesuccess: function() {
                        record.set('editAction', 'rename');
                        record.save();
                        me.linkEditor.hide();
                    },
                    cancel: function(editor) {
                        me.linkEditor.hide();
                    }
                }
            })]
        });

        me.linkEditor.show(target, 'r-l');
    },

    pageDestroyed: function(url, record) {
        if (record.modelName != this.tree.getRootNode().modelName) {
            record = this.tree.getRootNode().findChild('url', url, true);
        }

        if (!record || !record.isModel) {
            return;
        }

        record.remove(true);
    },

    pageNavigate: function(url) {
        var selectModel = this.tree.selModel,
            selItems = selectModel.getSelection(),
            record;

        if (selItems && selItems.length && selItems[0].get('url').toLowerCase() == url.toLowerCase()) {
            return;
        }

        record = this.tree.getRootNode().findChild('url', url, true);

        if (record) {
            selectModel.select([record], false, true);
        }
    }
});