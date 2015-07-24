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
        'Taco.view.website.misc.ExternalLinkEditor',
        'Taco.core.ux.form.SlugField'
    ],
    animate:false,
    border: false,
    componentCls: 'taco-website-tree',
    hideHeaders: true,
    rootVisible: false,
    useArrows: true,

    viewConfig: {
        stripeRows: false,
        plugins: {
            ptype: 'treeviewdragdrop'
        },
        cls: 'taco-website-tree-backcolor'
    },

    initComponent: function () {
        var me = this;

        this.addEvents('urlclick', 'additemclick');

        this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
            listeners: {
                beforeedit: function (editor) {
                    return editor.allowEdit === true;
                },
                edit: function (editor, e) {
                    var node = e.record;
                    node.set('editAction', 'rename');
                    node.save();
                }
            }
        });
    
        this.mon(this.store, 'load', Ext.Function.createSequence(this.showNavState, this.onTreeNodesLoad), this, {single: true});

        this.plugins = this.plugins || [];
        this.plugins.push(this.cellEditor);
        this.columns = [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'name',
            renderer: function (value, metaData, record) {
                
                var output = me.getNavIcon(value, record);

                if (Ext.Array.contains(['_navigation', '_unlinked'], record.getId()) || Ext.Array.contains(['category', 'link', 'page'], record.data.nodeType) || record.data.parentId === '_emailTemplates') {
                    output += me.getNavOptions(record);
                    output += '</span><span class="taco-website-tree-menu-trigger"></span>';
                }

                return output;
            },
            editor: {
                xtype: 'textfield',
                allowBlank: false
            }
        }];

        this.mon(this.store, {
            write: function (store) {
                var record, records = this.getSelectionModel().getSelection();
                if (records && records.length && records[0].parentNode) {
                    record = records[0];
                } else {
                    record = this.getRootNode().firstChild.firstChild;
                }

                //todo fire urlclick
                this.fireEvent('navigationchange', store, record);

            },
            move: function (node) {
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
        this.addDocked({
            xtype: 'toolbar',
            items: [
                {
                    itemId: 'refresh',
                    tooltip: 'Refresh',
                    overflowText: 'Refresh',
                    iconCls: 'x-tbar-loading',
                   // disabled: this.store.isLoading(),
                    handler: this.store.reload,
                    scope: this.store
                }
            ],
            // store: this.store,
            dock: 'bottom',
            displayInfo: false
        });
        this.on({
            itemclick: {
                scope: this,
                fn: function (tree, record, item, index, e, eOpts) {
                    var url = record.get('url'),
                        metaData = record.raw.metaData,
                        originalDocumentListName = record.get('originalDocumentListName'),
                        name = record.get('name'),
                        items;

                    this.url = url;

                    if (metaData) {
                        this.fireEvent('contentlistclick', this, metaData, record, item, index, e, eOpts);
                    }

                    else if (e.getTarget('.taco-website-tree-menu-trigger', 10)) {
                        items = this.getMenuItems(record, this);
                        this.menu.removeAll();

                        if (items.length > 0) {
                            this.menu.add(items);
                            this.menu.showBy(item, null, [-5, 0]);
                        }
                    } 

                    else if (url) {
                        if (originalDocumentListName && name)
                        {
                            url = "/cms/" + originalDocumentListName + "/" + name;
                        }
                        this.fireEvent('urlclick', this, url, record, item, index, e, eOpts);
                    }
                }
            },
            // itemcontextmenu: {
            //     scope: this,
            //     fn: function (tree, record, item, index, e, eOpts) {
            //         var url = record.get('url');
            //         this.menu.removeAll();
            //         this.menu.add(this.getMenuItems(record, this));
            //         this.menu.showBy(item, null, [-5, 0]);
            //         e.stopEvent();
            //     }
            // },
            additemclick: {
                scope: this,
                fn: 'showPageCreator'
            }
        });

        this.mon(this.getView(), {
            beforedrop:function(node, data, overModel, dropPosition, dropHandlers) {
           
                if (data.records && data.records.length && data.records[0].get('nodeType') === 'contentlist') {
                    dropHandlers.cancelDrop();
                    var nodeData = {
                            nodeType: 'link',
                            iconCls: 'link',
                            name: data.records[0].raw.metaData.name,
                            url: '/cms/' + data.records[0].raw.metaData.listFQN
                        },
                       
                        overIndex = overModel.parentNode.indexOf(overModel);
                    if (dropPosition === 'append') {
                        node = overModel.appendChild(nodeData);
                    } else if (dropPosition === 'before') {
                        node = overModel.parentNode.insertChild(overIndex, nodeData);
                    } else {
                        node = overModel.parentNode.insertChild(overIndex, nodeData);
                    }
                    node.phantom = true;

                    node.save();
                }             
            },
            drop: function(node, data, overModel, dropPosition, eOpts) {
                var selModel = this.getSelectionModel(),
                    navItems = me.store.tree.nodeHash,
                    current = me.getCurrentNode.call(me, navItems);
                
                selModel.deselect(data.records[0]);
                selModel.select(current);
            },
            nodedragover: {
                scope: this,
                fn: function (targetNode, position, dragData) {
                    var roots = ['_unlinked', '_navigation', '_templates'],
                        invalidDropZones = ['_templates', '_emailTemplates', '_backOffice'],
                        sourceId = dragData.records[0].getId(),
                        targetId = targetNode.getId(),
                        isValid = true;

                    if (Ext.Array.contains(invalidDropZones, targetId) || targetId.substr(0, 9) === 'templates') {
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

    onTreeNodesLoad: function (store, records, successfull, eOpts) {

        if (store && store.lastOperation && store.lastOperation.response.getResponseHeader('needsFixup') === 'true') {
            Ext.Ajax.request(
                {
                    url: '/admin/app/navigation/fixup',
                    method: 'POST',
                    success: function (response) {
                        if (response.responseText === 'true') {
                            store.load();
                        }
                    }
                }
            );
        }
    },
    getMenuItems: function (record, scope) {
        var menuItem = function(text, scope, handler) {
                return {
                    text: text,
                    scope: scope,
                    handler: handler
                };
            };

        var addLink = menuItem('Add Link', scope, this.showLinkEditor.bind(scope, null, record)),
            editLink = menuItem('Edit Link', scope, this.showLinkEditor.bind(scope, record, record.parentNode)),
            addPage = menuItem('Add Page', scope, this.showPageCreator.bind(scope, record)),
            deleteLink = menuItem('Delete', scope, this.deleteLink.bind(scope, record)),
            deletePage = menuItem('Delete', scope, this.deletePage.bind(scope, record)),
            showProducts = menuItem('Show Products', scope, this.fireEvent.bind(scope, 'showProducts', record)),
            rename = menuItem('Rename', scope, this.onRename.bind(scope, record)),
            emailtest = menuItem('Send Test Email', scope, this.onTestEmail.bind(scope, record));

        var itemsDict = {
                _navigation: [addLink, addPage],
                _unlinked: [addLink, addPage],
                category: [showProducts, addLink, addPage],
                link: [editLink, rename, deleteLink, addLink, addPage],
                page: [rename, addLink, addPage, deletePage],
                _emailTemplates: [emailtest]
            };

        var key = record.getId() === '_navigation' || record.getId() === '_unlinked' ? record.getId() : undefined;

        if (!key && record.data.parentId === '_emailTemplates') {
            key = '_emailTemplates';
        }

        else if (!key) {
            key = record.data.nodeType;
        }

        return itemsDict[key];

    },

    getIconClass: function(record) {

        var descriptor = record.get('nodeType'),
            iconDefinitions = {
                link: 'link-icon',
                category: 'category-icon',
                page: 'page-icon',
                emailtemplate: 'template-icon',
                template: 'template-icon',
                ordertemplate: 'template-icon',
                contentlist: 'template-icon',
                group: function(record) {return this['parent' + record.data.id];},
                parent_navigation: 'folder-icon',
                parent_unlinked: 'folder-icon',
                parent_backOffice: 'template-icon',
                parent_templates: 'template-icon',
                parent_emailTemplates: 'template-icon'
            };

        return typeof iconDefinitions[descriptor] === 'function' ? iconDefinitions[descriptor](record) : iconDefinitions[descriptor];

    },

    getNavIcon: function(value, record) {
        return '<span class="taco-website-tree-icon ' + this.getIconClass(record) + '"></span><span>' + value + '</span>';
    },

    getNavOptions: function(record) {
        var cls = Ext.Array.contains(['page', 'link'], record.get('nodeType')) ? 'visible' : 'invisible';

        return '<span class="taco-website-tree-icon drag-icon ' + cls + '">';
    },

    showNavState: function(records, success) {
        var me = this,
            navItems = this.store.tree.nodeHash,
            current = this.getCurrentNode.call(me, navItems);

        if (current) me.selectPath(current.getPath());

    },

    getCurrentNode: function(navItems){

        var me = this,
            current;

        Object.keys(navItems).forEach( function(k) {
            if (navItems[k] && navItems[k].data.url === me.url) {
                current = me.getStore().getNodeById(navItems[k].data.id);
            }   
        });

        return current;
    },

    showLinkEditor: function (record, parentRecord) {
        var me = this;
        Ext.create('Taco.view.website.misc.ExternalLinkEditor', {
            record: record,
            parentRecord: parentRecord,
            listeners: {
                savesuccess: function () {
                    me.fireEvent('navigationchange', me);
                }
            }
        });
    },
    deleteLink: function (record) {
        var me = this;
        record.destroy({
            success: function () {
                me.fireEvent('navigationchange', me);
            },
            scope: this
        });
    },
    deletePage: function (record) {
        var me = this,
            cmsDoc = Ext.create('Taco.model.CmsDocument', {
                //uniqueId: record.get('originalDocumentListName') + '_' + record.get('originalId'),
                id: record.get('originalId'),
                listFQN: record.get('originalDocumentListName')
            });
        cmsDoc.destroy({
            success: function () {
                console.log('link deleted');
                record.destroy();
                me.fireEvent('navigationchange', me);
            },
            scope: this
        });
    },
    onRename: function (record) {
        this.cellEditor.allowEdit = true;
        this.cellEditor.startEdit(record, this.columns[0]);
        this.cellEditor.allowEdit = false;
    },
    onTestEmail: function (record) {

        var dialog = Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            closeAction: 'destroy',
            scale: 'medium',
            title: 'Send Test Email',
            primaryText: 'Send Email',
            items: [
                {
                    xtype: 'form',
                    items: [
                        {
                            xtype: 'textfield',
                            allowBlank: false,
                            allowOnlyWhitespace: false,
                            name: 'recipient',
                            width: '100%',
                            fieldLabel: 'Send test email to:',
                            value: Taco.user.email
                        }
                    ]
                    
                }
            ],
            listeners: {

                beforesave: function () {

                    var request = {
                        url: '/admin/app/emailTesting/Send',
                        method: 'POST',
                        jsonData: {
                            email: dialog.getForm().getValues().recipient || Taco.user.email,
                            id: record.get('originalId')
                        },
                        success: function () {

                            Taco.app.fireEvent('setmessage', 'email sent', 'info');
                        },
                        failure: function (response) {

                            var respObj = Ext.decode(response.responseText, true),
                                errorMsg = respObj && respObj.message ? respObj.message : 'Failure Sending Email';

                            Taco.app.fireEvent('setmessage', errorMsg, 'error');
                        }
                    };

                    Ext.Ajax.request(request);
                }
            }
        });
    },
    showPageCreator: function (parentRecord) {
        var me = this,
            pageTypeDefinitionStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions'),
            dialog;

        pageTypeDefinitionStore.filter([{ property: 'userCreatable', value: true }]);

        // hack to get around filtered store not working... todo spend 5 mins and figure it out
        
        dialog = Ext.create('Taco.core.ux.window.Modal', {            
            scale: 'medium',
            title: 'Add a Page',
            autoShow: true,
            items: [{
                xtype: 'form',
                items: [{
                        xtype: 'textfield',
                        allowBlank: false,
                        allowOnlyWhitespace: false,
                        name: 'title',
                        width: '100%',
                        fieldLabel: 'Page Title',
                        listeners: {
                            change: function (cmp, newValue) {
                                cmp.slugField = cmp.slugField || cmp.up('form').down('taco-slugfield');
                                var previous = cmp.slugField.onNameChangeValue,
                                    current = cmp.slugField.getValue();
                                if (current && previous !== current) {
                                    return;
                                }
                                cmp.slugField.setValue(newValue);
                                cmp.slugField.onNameChangeValue = cmp.slugField.getValue();
                            }
                        }
                    },
                    {
                        xtype: 'taco-slugfield',
                        allowBlank: false,
                        allowOnlyWhitespace: false,
                        name: 'name',
                        width: '100%',
                        fieldLabel: 'Page Url'
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
                            //docInfo =dialog.getForm().getForm().findField('docInfo'),
                            //name= values.name,
                            //title= values.title,
                            cmsDoc;

                        cmsDoc = Ext.create('Taco.model.CmsDocument', {
                          //  documentTypeFQN: values.docInfo.documentTypeFQN,
                        //    listFQN: values.docInfo.listFQN,
                            name: values.name,
                            properties: {
                                title: values.title,
                                meta_title: values.title,
                                page_type_definition: values.docInfo,
                                link_title: values.title
                            }
                        });

                        cmsDoc.save({
                            success: function (cmsRecord) {
                                
                                var navRecord = Ext.create('Taco.model.NavigationTreeNode', {
                                    id: 'page^^' + cmsRecord.get('listFQN') + '^^' + cmsRecord.get('id'),
                                    editAction: 'move',
                                    nodeType: 'page',
                                    originalDocumentListName: cmsRecord.get('listFQN'),
                                    url: '/' + cmsRecord.get('name'),
                                    name: values.title                                    
                                });
                                navRecord.setDirty();
                                parentRecord.appendChild(navRecord);
                                navRecord.save();

                                //parentRecord
                                me.fireEvent('pagecreate', navRecord);

                                dialog.saveSuccess();
                            },
                            failure: function () {
                                Taco.app.fireEvent('setmessage', 'Error creating page', 'error');
                            }
                        });

                        return false;
                    }
                }
            }
        });

    }
});