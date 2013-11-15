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
        'Ext.tree.plugin.TreeViewDragDrop',
        'Taco.view.website.misc.ExternalLinkEditor'
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

        this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
            listeners: {
                beforeedit: function (editor, e, eOpts) {
                    return editor.allowEdit === true;
                },
                edit: function (editor, e, eOpts) {
                    var node = e.record;
                    node.set('editAction', 'rename');
                    node.save();
                }
            }
        });
        this.plugins = this.plugins || [];
        this.plugins.push(this.cellEditor);
        this.columns = [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'name',
            renderer: function (value, metaData, record) {
                var output = '<span class="taco-website-tree-icon"></span><span>' + value + '</span>';

                output += '<span class="taco-website-tree-menu-trigger"></span>';

                return output;
            },
            editor: {
                xtype: 'textfield',
                allowBlank: false
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
                fn: 'showPageCreator'
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
        var items = [],
            addLink = {
                text: 'Add Link',
                scope: scope,
                handler: function () {
                    this.showLinkEditor(null, record);
                }
            },
            editLink = {
                text: 'Edit Link',
                scope: scope,
                handler: function () {
                    this.showLinkEditor(record, record.parentNode);
                }
            },
            addPage = {
                text: 'Add Page',
                scope: scope,
                handler: function () {
                    this.showPageCreator(record);
                }
            },
            deleteLink = {
                text: 'Delete',
                scope: scope,
                handler: function () {
                    this.deleteLink(record);
                }
            },
            showProducts = {
                text: 'Show Products',
                scope: scope,
                handler: function () {
                    this.fireEvent('showproducts', record);
                }
            }, rename = {
                text: 'Rename',
                scope: scope,
                handler: function () {
                    this.onRename(record);
                }
            };;


        if (record.getId() == '_navigation') {
            items.push(addLink);
            items.push(addPage);
        } else if (record.getId() == '_unlinked') {
            items.push(addLink);
            items.push(addPage);
        } else if (record.data.nodeType === 'category') {
            items.push(showProducts);
            items.push(addLink);
            items.push(addPage);
        } else if (record.data.nodeType === 'link') {
            items.push(editLink);
            items.push(rename);
            items.push(deleteLink);
            items.push(addLink);
            items.push(addPage);

        } else if (record.data.nodeType == 'page') {
            items.push(rename);
            items.push(addLink);
            items.push(addPage);
            
        }
        

        return items;
    },
    showLinkEditor: function (record, parentRecord) {
        var modal = Ext.create('Taco.view.website.misc.ExternalLinkEditor', {
            record: record,
            parentRecord:parentRecord 

        });
        //modal.on('close', )
    },
    deleteLink:function (record) {
        record.destroy({
            success: function () {
                console.log('link deleted');
            },
            scope: this
        });
    },
    onRename: function (record) {
        this.cellEditor.allowEdit = true;
        this.cellEditor.startEdit(record, this.columns[0]);
        this.cellEditor.allowEdit = false;
    },
    showPageCreator: function (tree, linked, record) {
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
                        width: '100%',
                        fieldLabel: 'Page Name'
                    }, {
                        name: 'docInfo',
                        xtype: 'selectfield',
                        fieldLabel: 'Choose type',
                        queryMode: 'local',
                        valueField: 'id',
                        displayField: 'title',
                        width: '100%',
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



//editLink: function(record, target) {
//    var me = this;

//    me.linkEditor = Ext.create('Taco.core.ux.modal.Mini', {
//        width: 400,
//        height: 200,
//        destroyOnHide: true,
//        items: [Ext.create('Taco.view.site.navigation.ExternalLinkEditor', {
//            isEditMode: true,
//            record: record,
//            listeners: {
//                savesuccess: function() {
//                    record.set('editAction', 'rename');
//                    record.save();
//                    me.linkEditor.hide();
//                },
//                cancel: function(editor) {
//                    me.linkEditor.hide();
//                }
//            }
//        })]
//    });

//    me.linkEditor.show(target, 'r-l');
//},.




/// **
// * @class Taco.view.site.navigation.ExternalLinkEditor
// */
//Ext.define('Taco.view.site.navigation.ExternalLinkEditor', {
//    extend: 'Taco.core.ux.form.Form',

//    // title: 'External Link Configurator',
//    isEditMode: true,

//    navigationStoreId: 'navigationTreeNodeStore',
//    navigationParentNodeId: '_unlinked',
//    modelType: 'Taco.model.NavigationTreeNode',
//    nodeType: 'link',
//    iconCls: 'link',
//    width: 300,
//    // height: 300,
//    layout: { type: 'auto' },
//    initComponent: function () {
//        this.addEvents('save');

//        this.items = [{
//            xtype: 'textfield',
//            name: 'name',
//            emptyText: 'Label',
//            fieldStyle: {
//                width: '100%'
//            },
//            width: 250,
//            flex: 1
//        }, {
//            xtype: 'textfield',
//            name: 'url',
//            emptyText: 'URL',
//            fieldStyle: {
//                width: '100%'
//            },
//            width: 250,
//            flex: 1
//        }, {
//            xtype: 'container',
//            items: [{
//                xtype: 'action',
//                text: 'Cancel',
//                click: {
//                    fn: function () {
//                        this.fireEvent('cancel');
//                    },
//                    scope: this
//                }
//            }, {
//                xtype: 'primarybutton',
//                text: 'Save',
//                click: {
//                    fn: function () {
//                        this.updateForm();
//                    },
//                    scope: this
//                }
//            }]
//        }]

//        this.callParent(arguments)
//    },

//    save: function () {
//        var store,
//            values = this.getForm().getFieldValues()

//        if (this.isEditMode) {
//            this.getForm().updateRecord(this.record)
//        } else {
//            this.record = Ext.create(this.modelType, {
//                name: values.name,
//                url: values.url,
//                nodeType: this.nodeType,
//                iconCls: this.iconCls
//            })

//        }
//        this.fireEvent('save', this, this.record);

//    }
//})