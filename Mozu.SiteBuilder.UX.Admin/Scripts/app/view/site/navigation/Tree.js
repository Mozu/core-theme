/**
 * @class Taco.view.site.navigation.Tree
 */

Ext.define('Taco.view.site.navigation.Tree', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.model.NavigationTreeNode', 'Taco.store.NavigationTreeNodes'],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

//todo editlnik
    bubbleEvents: ['editlink'],
    navigate: function (record) {
        var url = record.get('url');
        if (url) {
            if (record.get('nodeType') == 'link') {
                
                //Taco.core.StateManager.attemptNavigate(
                //    Ext.create('Taco.core.AppState', {
                //        uri: '/sites/external-link',
                //        metaData: record.getData()
                //    }));
            }
            else {
                Taco.core.StateManager.attemptNavigate('/sites' + url);
            }
        }
    },
    
    initComponent: function () {
        var me = this;
        this.addEvents('editlink');
        this.pageCreator = Ext.create('Taco.view.site.navigation.PageCreator', {
            cardPanel: me.cardPanel,
            listeners:{
                cancel: function () { me.cardPanel.showItem(me); },
                save: function (creator, record) {
                    var parentNode = me.store.getById(me.pageCreator.parentId);
                    
                   
                    parentNode.appendChild(record);
                    record.save();
                    me.cardPanel.showItem(me);
                }
            }
        });
        
        //todo add shortcut form... ahh this is shitty.
       
        
        this.cardPanel.add(this.pageCreator);
        this.mon(Taco.app, 'page-destroy', this.pageDestroyed, this);
        this.mon(Taco.app, 'page-navigate', this.pageNavigate, this);
        this.mon(Taco.app, 'pageentity-update', this.onPageEntiryUpdate, this);
        this.mon(Taco.app.eventbus, 'Taco.model.CmsDocument.savesuccess', this.refreshTree, this);

        this.store = Ext.data.StoreManager.lookup('navigationTreeNodeStore') || Ext.create('Taco.store.NavigationTreeNodes');
        this.store.autoSync = false;

        this.store.on({
            write: function (store, opt) {
                var record, records = this.tree.getSelectionModel().getSelection();
                if (records && records.length && records[0].parentNode) {
                    record = records[0];
                } else {
                    record = this.tree.getRootNode().firstChild.firstChild;
                }

                this.fireEvent('navigationchange', store, record);
                this.navigate(record);
            },
          
            move: function (node, oldParent, newParent, index, eOpts) {
                node.set('editAction', 'move');
                node.save();
            },
           
            scope: this
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

        this.searchBox = Ext.widget('textfield', {
            padding: '0 14',
            emptyText: 'Search...',
            enableKeyEvents: true,
            listeners: {
                keyup: {
                    fn: this.keyUp,
                    scope: this
                }
            }
        });
        
        this.searchGrid = Ext.widget('grid', {


            store: this.searchStore,
            columns: [
                { header: 'Result',
                    xtype: 'templatecolumn',
                    tpl: '<div class="{iconCls}"><div style="padding-left: 25px"><a href="#" class="taco-action-navigate">{name}</a></div></div>',
                    flex: 1
                }
            ],
            listeners: {
                select: function (rowModel, record, index, eOpts) {
                    me.navigate(record);
                }
            }
        });
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        });
        this.tree = Ext.create('Taco.core.ux.TreeList', {
            hideHeaders: true,
            itemId: 'navigationTree',
            plugins: [cellEditing],
            store: this.store,
            columns: [{
                xtype: 'treecolumn',
                flex: 1,
                dataIndex: 'name',
                renderer: function (value, metaData, record) {
                    var id = record.getId();
                    if (id == '_unlinked' || id == '_navigation') {
                        return '<span style="float:left;font-weight:bold">' + value + '</span><a style="float:right" href="#" data-page-creator="true" data-parent-id="' + id + '" >+ Add Page</a>';
                    } else {
                        return '<a href="#" class="taco-action-navigate">' + value + '</a>';
                    }
                },
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    style: {
                        marginTop: "10px"
                    }
                }
            },
           
                {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                width:40,
                menuItems: [
                {
                    nodeTypes:['link'],
                    text: 'Edit',
                    menuColumnHandler: function (item, eventData) {
                        me.editLink(eventData.record, item);
                    }
                },
                    {
                        nodeTypes: ['page', 'link'],
                        text: 'Delete',
                        menuColumnHandler: function(item, eventData) {
                            var nt = eventData.record.get('nodeType'),
                            confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
                                text: 'Would you like to continue?',
                                title:'Delete Page',
                                confirm: function () {
                                    eventData.record.remove();
                                    eventData.record.destroy({
                                        callback:function(records, operation) {
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
                    }],
                onMenuShow: function(menu, eventData) {
                    var nt = eventData.record.get('nodeType');
                    menu.items.each(function(menuItem) {
                        if (menuItem.nodeTypes.indexOf(nt)>-1) {
                            menuItem.show();
                        } else {
                            menuItem.hide();
                        }

                    });
                }
            }],
            listeners: {
                select: function (rowModel, record, index, eOpts) {
                    this.isNewSelection = true;
                    this.navigate(record);


                },
                edit: function (editor, e) {
                    e.record.set('editAction', 'rename');
                    e.record.save();
                },
                itemclick: function (v, r, elm, idx, e) {
                    var cmp = Ext.fly(e.target);
                    e.preventDefault();
                   
                    //if (r.get('nodeType') === 'link' && !this.isNewSelection) {
                    //    this.fireEvent('editlink', r, elm);
                    //}
                    if (e.target.dataset.pageCreator) {//data-page-creator
                        this.pageCreator.reset( e.target.dataset);
                        this.cardPanel.showItem(this.pageCreator);
                    }

                    this.isNewSelection = false;
                },
                

                scope: this
            }
        });



        this.resultPanel = Ext.widget('panel', {
            flex: 1,
            layout: 'card',
            items: [this.tree, this.searchGrid]
        });

        this.items = [this.searchBox, this.resultPanel];

        this.callParent(arguments);

        var sel = this.tree.getSelectionModel();
        sel.setSelectionMode('SINGLE');

      

        this.addEvents('navigationchange');
        this.enableBubble('navigationchange');

    },

   
    refreshTree: function () {
        this.tree.store.load();

    },
    onPageEntiryUpdate: function (store, model, operation) {
        if (operation != "commit") {
            return;
        }
        var url, node, name, isHidden = false;
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
            this.store.resumeAutoSync()
        }

    },
    keyUp: function (field) {

        var me = this,
            store = me.searchStore,
            val = field.getValue();
        store.currentPage = 1;
        if (val == "refresh" || val =="reload") {
            field.setValue('');
            this.refreshTree();
            return;
        }
        if (val.length == 0) {
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
                filterFn: function () { return true; } // filtering happens on server
            }));
            store.load();
            this.resultPanel.getLayout().setActiveItem(this.searchGrid);
            return;
        }

    },
    editLink: function(record, target) {


        var me = this;
        me.linkEditor = Ext.create('Taco.core.ux.modal.Mini',
            {
                width: 400,
                height: 200,
                destroyOnHide: true,
               
                items: [
                    Ext.create('Taco.view.site.navigation.ExternalLinkEditor', {
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
                        }
                    )
                ]
            });
        me.linkEditor.show(target, 'r-l');

    },
    pageDestroyed: function (url, record) {
        if (record.modelName != this.tree.getRootNode().modelName) {
            record = this.tree.getRootNode().findChild('url', url, true);
        }

        if (!record || !record.isModel) {
            return;
        }
        record.remove(true);
    },
    pageNavigate: function (url) {
        var selectModel = this.tree.selModel,
            selItems = selectModel.getSelection();
        if (selItems && selItems.length &&
            selItems[0].get('url').toLowerCase() == url.toLowerCase()) {
            return;
        }
        var record = this.tree.getRootNode().findChild('url', url, true);
        if (record) {
            selectModel.select([record], false, true);
        }


    }


});