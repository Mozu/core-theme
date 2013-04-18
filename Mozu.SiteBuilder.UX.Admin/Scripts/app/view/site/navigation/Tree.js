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
    bubbleEvents: ['editlink'],
    navigate: function (record) {
        var url = record.get('url');
        if (url) {
            if (record.get('nodeType') == 'link') {
                Taco.core.StateManager.attemptNavigate(
                    Ext.create('Taco.core.AppState', {
                        uri: '/sites/external-link',
                        metaData: record.getData()
                    }));
            }
            else {
                Taco.core.StateManager.attemptNavigate('/sites' + url);
            }
        }
    },
    initComponent: function () {
        var me = this;
        this.addEvents('editlink');

        this.mon(Taco.app, 'page-destroy', this.pageDestroyed, this);
        this.mon(Taco.app, 'page-navigate', this.pageNavigate, this);
        this.mon(Taco.app, 'pageentity-update', this.onPageEntiryUpdate, this);
        this.mon(Taco.app.eventbus, 'Taco.model.CmsDocument.savesuccess', this.refreshTree, this);

        this.store = Ext.data.StoreManager.lookup('navigationTreeNodeStore') || Ext.create('Taco.store.NavigationTreeNodes');
        this.store.autoSync = true;

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

        this.tree = Ext.create('Taco.core.ux.TreeList', {
            hideHeaders: true,
            itemId: 'navigationTree',
            columns: [{
                xtype: 'treecolumn',
                flex: 1,
                dataIndex: 'name',
                renderer: function (value) {
                    return '<a href="#" class="taco-action-navigate">' + (value + '</a>');
                },
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    style: {
                        marginTop: "10px"
                    }
                }
            }],
            listeners: {
                select: function (rowModel, record, index, eOpts) {
                    this.isNewSelection = true;
                    this.navigate(record);


                },
                /* beforeitemmousedown:function(v,r,item,idx,e,eOpts){
                var bing = Ext.fly(e.getTarget());
                if ( bing && bing.hasCls('taco-draghandle'))
                {
                return false;
                }
                },*/
                itemclick: function (v, r, elm, idx, e) {

                    e.preventDefault();

                    if (r.get('nodeType') === 'link' && !this.isNewSelection) {
                        this.fireEvent('editlink', r, elm);
                    }

                    this.isNewSelection = false;
                },

                scope: this
            },
            store: this.store
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

        // sel.onRowMouseDown=function(view, record, item, index, e) {
        //     if (!this.allowRightMouseSelection(e)) {
        //         return;
        //     }
        //     console.log('onRowMouseDown');
        //     var dom = Ext.fly(e.getTarget());
        //     if ( dom && dom.hasCls('taco-draghandle'))
        //     {
        //         return ;
        //     }
        //     if (e.button === 0 || !this.isSelected(record)) {
        //         this.selectWithEvent(record, e);
        //     }
        // };

        //this.on({
        //    render: function () {
        //        this.store.load();
        //    },
        //    scope: this
        //});

        // this.tree.on({
        //     render: this.afterTreeRender,
        //     scope: this
        // });

        this.addEvents('navigationchange');
        this.enableBubble('navigationchange');

    },

    // afterTreeRender: function () {
    //     this.treeView = this.tree.getView()

    //     this.treeView.on({
    //         itemupdate: function (record) {
    //             console.log('itemupdate', record.data.name);
    //         },
    //         itemadd: function (recordArray) {
    //             Ext.each(recordArray, function (record) {

    //                 console.log('itemadd', record.data.name);
    //             })

    //         },
    //         scope: this
    //     });


    // },
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