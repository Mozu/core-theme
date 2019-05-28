/**
 * @class Taco.view.category.Index
 */
Ext.define('Taco.view.category.Index', {
    extend: 'Taco.core.ux.browser.SearchListTree',
    requires: [
        'Taco.core.ux.TreeList',
        'Taco.view.category.AdvancedSearchForm',
        'Taco.store.CategoriesTree',
        'Taco.view.filter.Schema'
    ],

    createButtonText: "Create New Category",
    createButtonVisible: true,

    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: ['c', 's']
    },

    advancedSearchConfig: {
        form: null,
        emptySearchText: 'Search'
    },

    enableNavHeader: true,

    addContentViewPadding: true,

    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    enableSearchBarInHeader: true,

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
                cls: 'button-menu',
                plain: true,
                showSeparator: false,
                listeners: {
                    click: {
                        fn: function (menu, menuItem) {
                            if (!menuItem) {
                                return;
                            }

                            var url = (menuItem.getItemId() == "Dynamic") ? 'categories/createdynamic' : 'categories/create';
                            Taco.core.StateManager.attemptNavigate(url);
                        },
                        scope: me,
                        delegate: "x-menu-item-link"
                    },
                    beforerender: function () {
                        var width = this.up('button').el.getWidth(false, true);
                        this.setWidth(width);
                    }
                },
                items: [
                    {
                        text: "Static Category",
                        itemId: "Static"
                    }, {
                        text: "Dynamic Category",
                        itemId: "Dynamic"
                    }
                ]
            }
        };

        me.store = Taco.core.data.StoreManager.getCategoryTreeByCatalog(me.catalogId, true);

        // if were filter categories, turn off drag and drop because
        // that would be crazy, amirite?
        // me.store.on('datachanged', function(store) {
        //     if (store.lastOperation.request) {
        //         var search = store.lastOperation.request.params.advancedSearch;

        //         if (search && search.length > 2) {
        //             me.down('draghandlecolumn').hide();
        //         }

        //         else {
        //             me.down('draghandlecolumn').show();
        //         }
        //     }
        // })

        me.viewConfig = Ext.apply(me.viewConfig, {
            animate: false,
            stripeRows: false,
            onExpand: Ext.emptyFn,
            enableTextSelection: true
        });

        me.columns = [
            {
                xtype: 'treecolumn',
                text: 'Code',
                flex: 1,
                checkboxText: '',
                dataIndex: 'categoryCode',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                }
            },
            {
                xtype: 'treecolumn',
                text: 'Name',
                flex: 3,
                checkboxText: '',
                dataIndex: 'name',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                }
            },
            {
                xtype: 'treecolumn',
                text: 'Type',
                flex: 2,
                checkboxText: '',
                dataIndex: 'categoryType',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + me.parseCategoryType(value) + '</a>';
                }
            }, {
                xtype: 'treecolumn',
                text: 'Status',
                flex: 1,
                checkboxText: '',
                dataIndex: 'isActive',
                renderer: function (value) {
                    var activeDisplayText = (value ? 'Active' : 'Disabled');
                    return '<a href="#" class="taco-launch-editor">' + activeDisplayText + '</a>';
                }
            }, {
                xtype: 'treecolumn',
                text: 'Hidden on Storefront',
                flex: 1,
                checkboxText: '',
                dataIndex: 'isHidden',
                renderer: function (value) {
                    var hiddenDisplayText = (value ? 'Y' : 'N');
                    return '<a href="#" class="taco-launch-editor">' + hiddenDisplayText + '</a>';
                }
            },
            {
                xtype: 'taco.menucolumn',
                text: '<span class="taco-grid-row-menu-trigger" />',
                onMenuShow: function (menu, e) {
                    var previewItem = menu.items.get('preview'),
                        liveItems = menu.items.get('live'),
                        previewMenu,
                        liveMenu,
                        previewSites = [],
                        liveSites = [];

                    var ctx = Taco.app.context.getCurrentContext();

                    if (previewItem && previewItem.menu) {
                        previewMenu = previewItem.menu;
                        liveMenu = liveItems.menu;

                        var sites = (ctx.sites) ? ctx.sites : (ctx.catalog && ctx.catalog.sites) ? ctx.catalog.sites : [];

                        Ext.each(sites, function (site) {
                            if (site.isMozuRendered) {
                                previewSites.push({
                                    itemId: site.id,
                                    text: site.name,
                                    handler: Ext.bind(me.viewInSite, me, [site, 'preview', e.record])
                                });

                                liveSites.push({
                                    itemId: site.id,
                                    text: site.name,
                                    handler: Ext.bind(me.viewInSite, me, [site, 'live', e.record])
                                });
                            }
                        });

                        if (!Ext.Array.equals(Ext.Array.pluck(previewSites, 'itemId'), previewMenu.items.keys)) {
                            previewMenu.removeAll();
                            previewMenu.add(previewSites);
                            liveMenu.removeAll();
                            liveMenu.add(liveSites);
                        }

                    }
                },
                menuItems: [
                    {
                        itemId: 'live',
                        text: 'View Live',
                        menu: {
                            plain: true,
                            shadow: false,
                            items: []
                        }
                    }, {
                        itemId: 'preview',
                        text: 'View Staged',
                        menu: {
                            plain: true,
                            shadow: false,
                            items: []
                        }
                    },
                    {
                        text: 'Edit',
                        requiredBehaviors: {
                            model: 'Taco.model.Category',
                            behavior: 'update'
                        },

                        menuColumnHandler: function (item, eventData) {
                            var record = eventData.record;
                            Ext.defer(function () {
                                me.addRecordToBrowserHistory(record);
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
                        handler: function () {
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

        me.listeners = {
            cellclick: me.onCellClick,
            itemmove: me.onItemMove,
            scope: me
        };

        me.advancedSearchConfig.form = Ext.create('Taco.view.category.AdvancedSearchForm', {});

        me.callParent(arguments);

        me.selectCurrentPath();
    },

    selectCurrentPath: function () {

        var me = this;
        var currentState = Taco.app.StateManager.getCurrentState().getMetaData().args;
        var id = null;

        var doSelect = function () {
            var cmp = this;
            var node = this.getNodeById(id);


            if (node && node.getPath) {
                var fixed = node.getPath();

                while (fixed[0] === '/') {
                    fixed = fixed.substring(1);
                }

                var parts = fixed.split('/');

                parts.forEach(function (part) {
                    cmp.getNodeById(part).expand();
                });

                me.getSelectionModel().select(node);
            }
        };

        if (currentState && currentState[0] && currentState[0].view) {
            id = currentState[0].view;
        }

        if (id) {
            if (this.store.loading) {
                this.store.on('load', doSelect);
            }

            else {
                doSelect();
            }
        }

    },

    parseCategoryType: function (value) {

        switch (value) {
            case 'DynamicPreComputed':
                return 'Precomputed';
            case 'DynamicRealTime':
                return 'Realtime';
            case 'Static':
                return 'Static';
            default:
                return value;
        }

    },

    addRecordToBrowserHistory: function (record) {

        var URIStem = '/categories?view=';
        var id = record.get('id');

        if (!id) {
            return false;
        }

        Taco.core.StateManager.addState(URIStem + id);
    },

    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e) {


        if (this.getSelectionText()) {  // inherited from the launchEditor mixin;
            return;                     // if the user has highlighted text, do not launch editor
        }

        var target = Ext.fly(e.getTarget()),
            metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        if (target.hasCls('x-tree-expander')) {
            return;
        }

        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
            e.preventDefault();

            this.addRecordToBrowserHistory(record);

            this.launchEditor(record, metaData);
        }
    },

    onItemClick: function (view, record) {
        this.launchEditor(record);
    },

    onItemMove: function (node, oldParent, newParent) {
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
                onDeleteIt: function (modal, cascadeDelete) {
                    record.set('cascadeDelete', cascadeDelete);
                    me.syncRemoveRecordFromStore(grid, record, !cascadeDelete);
                }
            }
            );
    },

    deleteLeafNode: function (record, grid) {
        var me = this;
        Ext.MessageBox.show({
            title: 'Delete Category',
            // pushes the buttons to the right to be consistent with our dialog ux.
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
            success: function () {
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
            Taco.core.StateManager.attemptNavigate('categories/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    },

    setHidden: function (records) {
        var me = this;

        Ext.each(records, function (item) {
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
    viewInSite: function (site, env, record) {
        var url = '/_gosite/' + site.id + '?environment=' + env + '&redir=' + encodeURIComponent('/c/' + record.getId());
        window.open(url);
    }
});
