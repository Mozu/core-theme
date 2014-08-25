/**
 * @class Taco.view.pendingChange.Cms
 */
Ext.define('Taco.view.pendingChange.Cms', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.CmsDocumentDraft',
        'Taco.store.CmsDocumentDrafts',
        'Taco.core.ux.action.PrimarySplitButton',
        'Taco.core.ux.grid.MenuColumn'
    ],

    typeName: 'Pending Content Changes',
    modelName: 'Taco.model.CmsDocumentDraft',
    store: { type: 'Taco.store.CmsDocumentDrafts' },
    filterProperty: 'productName',
    useTilePanel: false,

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: [ 's']
    },
    
    publishAllText: "Publish All",
    
    publishAll: function (listFQN) {
        var me = this;
        me.store.publishAll(listFQN, function () {
            // removing notification per TFS #7653 and #7655
            //var notice = type ? 'All ' + type + ' changes published!' : 'All changes published!';
            //Taco.app.fireEvent('setmessage', notice, 'success');
            me.store.reload();
        });
    },
    discardAll:function() {
        var me = this;
        me.store.discardAll( function () {
            Taco.app.fireEvent('setmessage', 'changes discarded', 'success');
            me.store.reload();
        });
    },

    header: {
        actions: [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Discard All',
            scope: this,
            handler: function () {
                this.discardAll();
            }
        }, {
            xtype: 'splitbutton',
            itemId: 'publishAll',
            ui: 'action-primary',
            scale: 'medium',
            menuAlign: 'tr-br?',
            text: 'Publish All',
            // textTpl: new Ext.XTemplate('<span>{text} <em>({count} items)</em></span>'),
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'Publish all pages and templates',
                    handler: function(item) {
                        item.up('contentcontainer').publishAll();
                    }
                }, {
                    text: 'Publish all pages',
                    handler: function (item) {
                        item.up('contentcontainer').publishAll('page');
                    }
                }
                //removeing bulk type of templates should be aggregate of document type / document list
                //, {
                //    text: 'Publish all templates',
                //    handler: function (item) {
                //        item.up('contentcontainer').publishAll('template');
                //    }
                //}

                ]
            },
            handler: function (button) {
                button.up('contentcontainer').publishAll();
            }
        }]
    },

    updateChangeCount: function () {
        this.publishButton = this.publishButton || this.header.getActions().getComponent('publishAll');
        this.publishButton.updateCount({ text: this.publishAllText, count: this.store.count() });
    },

    initComponent: function () {
        
        this.callParent(arguments);
        // this.mon(this.store, 'datachanged', this.updateChangeCount, this);
        // this.store.load();
        // this.updateChangeCount();
    },

    gridPanelConf: {
        selType: 'checkboxmodel',
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            border: false,
            items: [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                menuAlign: 'tr-br?',
                text: 'Bulk Actions',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Publish',
                        handler: function() {
                            var grid = this.grid || (this.grid = this.up('grid')),
                                checkedModels = grid.getSelectionModel().getSelection(),
                                store = grid.store;

                            if (checkedModels) {
                                Ext.each(checkedModels, function(item) {
                                    item.set('isPublished', true);
                                });
                                store.sync({
                                    callback: function() {
                                        store.reload();
                                    }
                                });
                            }
                        }
                    }, {
                        text: 'Discard',
                        handler: function() {
                            var grid = this.up('grid'),
                                checkedModels = grid.getSelectionModel().getSelection(),
                                store = grid.store;

                            if (checkedModels) {
                                store.remove(checkedModels);
                                store.sync({
                                    callback: function() {
                                        store.reload();
                                    }
                                });
                            }
                        }
                    }]
                }
            }]
        }],
        columns: [{
                dataIndex: 'name',
                text: 'Name',
                minWidth: 120,
                flex: 1
            }, {
                dataIndex: 'draftType',
                text: 'Type',
                value: 'Page',
                minWidth: 120,
                width: 100
            }, {
                dataIndex: 'modificationType',
                text: 'Modification',
              
                width: 100
            }, {
                dataIndex: 'lastModified',
                text: 'Last Modified',
                xtype: 'datecolumn',
                width: 200
            }, {
                dataIndex: 'modifiedBy',
                text: 'Modified By',
                
                width: 100
            },
            {
                dataIndex: 'lastPublished',
                text: 'Last Published',
                xtype: 'datecolumn',
                width: 100
            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems:[],
                onMenuShow: function(menu, e) {
                    menu.removeAll();
                    if (e.record.get('draftType') === 'Page') {
                        menu.add({
                            xtype: 'button',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Preview',
                            scope: this,
                            handler: function () {
                                var r = e.record;

                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent('/pages/' + r.get('name')), 'taco-preview');
                            }
                        });
                    }
                }
            }
        ]
    }
});
