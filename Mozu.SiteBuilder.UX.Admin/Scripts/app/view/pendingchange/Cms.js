/**
 * @class Taco.view.pendingchange.Cms
 */
Ext.define('Taco.view.pendingchange.Cms', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: ['Taco.model.CmsDocumentDraft', 'Taco.store.CmsDocumentDrafts', 'Taco.core.ux.action.PrimarySplitButton', 'Taco.core.ux.grid.MenuColumn'],

    typeName: 'Pending Changes',
    modelName: 'Taco.model.CmsDocumentDraft',
    store: { type: 'Taco.store.CmsDocumentDrafts' },
    filterProperty: 'productName',
    useTilePanel: false,

    requiresContextOfType: ['c', 's'],
    publishAllText: "Publish All",
    
    publishAll: function (type) {
        var me = this;
        me.store.publishAll(type, function () {
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
            xtype: 'secondarybutton',
            text: 'Discard All',
            listeners: {
                click: function() {

                    this.discardAll();
                }
            }
        }, {
            xtype: 'primarysplitbutton',
            itemId: 'publishAll',
            text: '',
            textTpl: new Ext.XTemplate('<span>{text} <em>({count} items)</em></span>'),
            handler: function() {
                this.getParentPage().publishAll();
            },
            updateCount: function (obj) {
                this.setText([this.textTpl.apply(obj)]);
            },
            createMenuItems: function () {
                var me = this;
                return [{ text: 'Publish all pages and templates', handler: function() { me.getParentPage().publishAll(); } },
                { text: 'Publish all pages', handler: function () { me.getParentPage().publishAll('page'); } },
                { text: 'Publish all templates', handler: function () { me.getParentPage().publishAll('template'); } }];
            }
        }]
    },

    updateChangeCount: function () {
        this.publishButton = this.publishButton || this.header.getActions().getComponent('publishAll');
        this.publishButton.updateCount({ text: this.publishAllText, count: this.store.count() });
    },

    initComponent: function () {
        
        this.callParent(arguments);
        this.mon(this.store, 'datachanged', this.updateChangeCount, this);
        //this.store.load();
        this.updateChangeCount();
    },

    gridPanelConf: {
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            border: false,
            items: [{
                xtype:'taco.splitbutton',
                text: 'Bulk Actions',
                handler: function (btn) {
                    btn.showMenu();
                },
                menu: {
                    xtype:'menu',
                    items: [ {
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
                    },{
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
                            xtype: "secondarybutton",
                            text: 'Preview',
                            click: function() {
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
