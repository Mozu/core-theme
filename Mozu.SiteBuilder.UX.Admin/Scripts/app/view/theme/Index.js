/**
 * @class Taco.view.themes.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.theme.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.view.theme.ThemeView',
        'Taco.store.ThemeListingsTree',
        'Taco.store.ThemeListingsApplied'
    ],

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    itemId: 'taco-themeView',
    
    initComponent: function() {
        this.header = {
            title: 'Manage Themes'
        };

        this.buildTree();

        this.buildAppliedView();

        this.body = {
            layout: 'fit',
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    this.appliedView,
                    this.treeList
                ]
            }]
        };

//        this.store.load();
        
        this.callParent(arguments);
    },

    buildAppliedView: function() {
        this.appliedStore = Ext.create('Taco.store.ThemeListingsApplied');

        this.appliedStore.load();


        this.appliedView = Ext.create('Taco.view.theme.ThemeView', {
            store: this.appliedStore,
            margin: '5 0 0 0',
            width: 318
        });
    },

    buildTree: function() {
        var me = this;

        this.treeStore = Ext.create('Taco.store.ThemeListingsTree');

        this.treeList = Ext.create('Taco.core.ux.TreeList', {
            flex: 1,
            animate: false,
            enableColumnHide: false,
            store: this.treeStore,
            enableRowReorder: false,
            autoSync: false,
            viewConfig: {
                animate: false,
                stripeRows: true
            },
            listeners: {
                itemcontextmenu: function(cmp, record, item, index, e) { 

                    if (!record.isLeaf()) {
                        e.stopEvent();
                        return;
                    }

                    var menuItems = me.getMenuItems(),
                        menu;

                    //overriding the menucolumnhandler from menuitems so it works with this menu
                    menuItems.forEach(function(item) {
                        item.handler = item.menuColumnHandler.bind(me, null, {record: record});
                    });

                    menu = Ext.create('Ext.menu.Menu', {
                        items: menuItems,
                    });

                    e.stopEvent();
                    menu.showAt(e.xy);
                }
            },
            columns: [{
                text: 'Name',
                xtype: 'treecolumn',
                flex: 1,
                checkboxText: '',
                dataIndex: 'name',
                minWidth: 150
            }, {
                text: 'Applied',
                dataIndex: 'applied',
                width: 200
            }, {
                text: 'Version',
                dataIndex: 'version',
                width: 120
            }, {
                text: 'Author',
                dataIndex: 'author',
                width: 120
            }, {
                text: 'Install Date',
                xtype: 'datecolumn',
                format: 'M d, Y',
                dataIndex: 'installDate',
                width: 120
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                getClass: function(scope, cmp) {
                    if (cmp.record.isLeaf()) {
                        return 'x-action-col-icon x-action-col-0 taco-grid-row-menu-trigger';
                    }
                    else {
                        return 'x-hide-display';
                    }

                },
                menuItems: me.getMenuItems()
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
                    xtype: 'component',
                    cls: 'taco-theme-selector',
                    html: '<h2>Available Themes</h2>',
                    flex: 1
                }, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Expand All',
                    allowDepress: false,
                    enableToggle: true,
                    scope: this,
                    toggleHandler: function (button, nextState) {
                        this.treeList.expandAll(function () {
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
                        this.treeList.collapseAll();
                    }
                }]
            }]
        });
    },

    getMenuItems: function() {
        var me = this;
        return [{
                    text: 'Apply',

                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record,
                            path = record.getPath();
                        Ext.defer(function () {
                            record.applyTheme({
                                success: function() {
                                    console.log('success');
                                    me.treeStore.reload({
                                        callback: function () {
                                            me.treeList.selectPath(path);
                                        }
                                    });
                                    me.appliedStore.reload();
                                },
                                apply: true
                            });
                        }, 0);
                    }
                }, {
                    text: 'Settings',

                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        Ext.defer(function () {
                            Taco.core.StateManager.attemptNavigate('themesettings/edit/' + record.getId(), {
                                complexMetaData: {
                                    record: record
                                }
                            });
                        }, 1, this);
                    }
                }, {
                    text: 'Preview',
                    menuColumnHandler: function (item, eventData) {                        
                        var record = eventData.record;

                        var height = Taco.app.viewPort.getHeight();
                        var width = Taco.app.viewPort.getWidth();

                        Ext.create('Ext.window.Window', {
                            title: record.get('name') + (record.get('version') ? ' ('+ record.get('version') + ')' : '') + ' Theme Preview',
                            height: height - 20,
                            width: width - 20,
                            layout: 'fit',

                            items: [
                                {
                                    flex: 1,
                                    itemId: 'iframe',
                                    xtype: 'uxiframe',
                                    src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend('/', '/?iseditmode=true&SBTHEME=' + record.getId())),
                                    listeners: {
                                        load: function (iframe) {
                                            Ext.EventManager.on(iframe.getDoc(), 'click', function (e, target) {
                                                var url = target.pathname + target.search;
                                                if (target.hostname === iframe.getWin().location.hostname && !e.browserEvent.defaultPrevented) {


                                                    iframe.getWin().location.href = Ext.String.urlAppend(url, 'SBTHEME=' + record.getId());

                                                    e.stopEvent();
                                                }
                                            }, this, {
                                                delegate: 'a'
                                            });
                                        }
                                    }
                                }
                            ]
                        }).show();
                    }
                }]
    }

});