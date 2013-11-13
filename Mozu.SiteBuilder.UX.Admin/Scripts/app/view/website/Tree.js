/**
 * @class Taco.view.website.Tree
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Tree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.taco-website-tree',
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes',
        'Ext.tree.plugin.TreeViewDragDrop'
    ],

    border: false,
    componentCls: 'taco-website-tree',
    hideHeaders: true,
    rootVisible: false,
    useArrows: true,

    viewConfig: {
        stripeRows: true,
        plugins: {
            ptype: 'treeviewdragdrop'
        }
    },

    initComponent: function () {
        this.addEvents('urlclick', 'additemclick');

        this.columns = [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'name',
            renderer: function (value, metaData, record) {
                var output = '<span class="taco-website-tree-icon"></span><span>' + value + '</span>';

                output += '<span class="taco-website-tree-menu-trigger"></span>';

                return output;
            }
        }];
        



        this.mon(this.store,
        {
            write: function (store, opt) {
                var record, records = this.getSelectionModel().getSelection();
                if (records && records.length && records[0].parentNode) {
                    record = records[0];
                } else {
                    record = this.getRootNode().firstChild.firstChild;
                }
                
                //todo fire urlclick
                this.fireEvent('navigationchange', store, record);

            },
            move: function (node, oldParent, newParent, index, eOpts) {
                node.set('editAction', 'move');
                node.save();
            },
            scope: this
           
        });
        


        this.menu = Ext.create('Ext.menu.Menu', {
            defaultAlign: 'tr-br',
            plain: true,
            shadow: false,
            items: []
        });

        this.callParent(arguments);

        this.on({
            itemclick: {
                scope: this,
                fn: function (tree, record, item, index, e, eOpts) {
                    var url = record.get('url');

                    if (e.getTarget('.taco-website-tree-menu-trigger', 10)) {
                        this.menu.removeAll();
                        this.menu.add(this.getMenuItems(record, this));
                        this.menu.showBy(item, null, [-5, 0]);
                    } else if (url) {
                        this.fireEvent('urlclick', this, url, record, item, index, e, eOpts);
                    }
                }
            },
            additemclick: {
                scope: this,
                fn: 'showCreator'
            }
        });

        this.mon(this.getView(), {
            nodedragover: {
                scope: this,
                fn: function (targetNode, position, dragData, e) {
                    var roots = ['_unlinked', '_navigation', '_templates'],
                        sourceId = dragData.records[0].getId(),
                        targetId = targetNode.getId(),
                        isValid = true;

                    if (targetId === '_templates' || targetId.substr(0, 9) === 'templates') {
                        // cannot drop anything onto templates
                        isValid = false;
                    } else if (position === 'before' && Ext.Array.contains(roots, targetId)) {
                        // cannot drop anything as a sibling of a "root" node
                        isValid = false;
                    } else if (Ext.Array.contains(roots, sourceId)) {
                        // cannot drop "root" nodes onto anything
                        isValid = false;
                    } else if (sourceId.substr(0, 8) === 'category') {
                        // cannot drop a category into the Single Pages collection
                        isValid = !(targetId === '_unlinked' || targetId.substr(0, 11) === 'page^^pages');
                    }

                    return isValid;
                }
            }
        });
    },

    getMenuItems: function (record, scope) {
        var items = [];

        if (record.getId() == '_navigation') {
            items.push({
                text: 'Add Page',
                scope: scope,
                handler: function () {
                    this.fireEvent('additemclick', this, true, record);
                }
            });
        } else if (record.getId() == '_unlinked') {
            items.push({
                text: 'Add Page',
                scope: scope,
                handler: function () {
                    this.fireEvent('additemclick', this, false, record);
                }
        });
        } else if (record.getId().substr(0, 8) === 'category') {
            items.push({
                text: 'Edit',
                scope: scope,
                handler: Ext.emptyFn
            }, {
                text: 'View Products',
                scope: scope,
                handler: Ext.emptyFn
            });
        } else {
            items.push({
                text: 'Edit',
                scope: scope,
                handler: Ext.emptyFn
            }, {
                text: 'Rename',
                scope: scope,
                handler: Ext.emptyFn
            }, {
                text: 'Duplicate',
                scope: scope,
                handler: Ext.emptyFn
            }, {
                text: 'Delete',
                scope: scope,
                handler: Ext.emptyFn
            });
        }

        return items;
    },

    showCreator: function (tree, linked, record) {
        var me = this,
            pageTypeDefinitionStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions'),
            data = [],
            storeCopy,
            dialog;

        pageTypeDefinitionStore.filter([{ property: "userCreatable", value: true }]);

        // hack to get around filtered store not working... todo spend 5 mins and figure it out
        // storeCopy = Ext.create('Taco.store.PageTypeDefinitions', { data: data });

        dialog = Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            closeAction: 'destroy',
            scale: 'medium',
            title: 'Add a Page',
            items: [{
                xtype: 'form',
                items: [{
                    xtype: 'textfield',
                    allowBlank: false,
                    allowOnlyWhitespace: false,
                    name: 'title',
                    fieldLabel: 'Page Name'
                }, {
                    name: 'docInfo',
                    xtype: 'selectfield',
                    fieldLabel: 'Choose type',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'title',
                    width: 200,
                    emptyText: 'Select',
                    store: pageTypeDefinitionStore
                }]
            }],
            listeners: {
                beforesave: {
                    scope: this,
                    fn: function (dialog) {
                        var values = dialog.getForm().getValues(),
                            cmsDoc;

                        cmsDoc = Ext.create('Taco.model.CmsDocument', {
                            documentType: values.docInfo.documentType,
                            collectionName: values.docInfo.collectionName,
                            name: values.title,
                            items: [{
                                key: "title",
                                value: values.title
                            }, {
                                key: "meta_title",
                                value: values.title
                            }, {
                                key: "page_type_definition",
                                value: values.docInfo
                            }]
                        });

                        cmsDoc.save({
                            success: function () {
                                me.fireEvent('pagecreate', dialog, cmsDoc, linked, record);
                                dialog.close();
                            },
                            failure: function () {
                                Taco.app.fireEvent('setmessage', "Error creating page", 'error');
                            }
                        });

                        return false;
                    }
                }
            }
        });

    }
});