/**
 * @class Taco.view.product.Index
 */
    Ext.define('Taco.view.product.Index', {
        extend: 'Taco.core.ux.content.Container',
        alias: 'widget.prodindex',
        requires: ['Ext.form.Panel', 'Taco.core.ux.BaseGrid', 'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 'Taco.core.ux.FilterableDataView', 'Taco.core.ux.modal.Confirmation', 'Taco.core.ux.browser.ItemBrowser'],
        mixins: {
            protectable: 'Taco.core.util.Protectable'
        },
        initComponent: function (eOpts) {
          
            var me = this,
                itemCount,
                basegridview;
            me.header = {
                title: 'Products',
                actions: [{
                    xtype: 'primarybutton',
                    text: 'Create New Product',
                    onClick: function () {
                        me.launchEditor(Ext.create("Taco.model.Product"));
                        Taco.app.StateManager.addState('products/create');
                    }
                }]
            };
            me.store = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters:true , clearSort:true });
            //me.store = Ext.create('Taco.store.Products');
            me.pager = Ext.create('Taco.core.ux.GridPager', {
                store: me.store
            });

           // me.mon(Taco.app.eventbus, "Taco.model.Product.savesuccess", me.onGlobalModelSave, me);

            me.gridpanel = Ext.create('Taco.core.ux.BaseGrid', {
                store: me.store,
                enableColumnHide: true,
                disableSelection: true,
                columns: [{
                    xtype: 'gridcolumn',
                    dataIndex: 'productImages', // Change this hack later
                    text: 'Image',
                    width: 80,
                    sortable: false,
                    renderer: function (value) {
                        if (value && value.length > 0) {
                            return '<div class="taco-basegrid-thumbnail"><img width="60px" src="' + value[0].imagePath + '?size=60"></div>';
                        } else {
                            return '<div class="taco-image-square taco-image-placeholder">&nbsp;</div>';
                        }
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'productName',
                    text: 'Name',
                    flex: 1,
                    hideable: false,
                    cls: 'taco-frozen',
                    renderer: function (value) {
                        return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                    }
                }, {
                    xtype: 'numbercolumn',
                    dataIndex: 'salePrice',
                    text: 'Price',
                    format: '$0,00.00',
                    align: 'right',
                    width: 150,
                    renderer: function (value, meta, record) {
                        // console.log(value, meta, record);
                        if (record.data.price) {
                            return value ? '<s>$' + record.data.price.toFixed(2) + '</s><br />$' + value.toFixed(2) : '$' + record.data.price.toFixed(2);
                        }
                        return null;
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'productCode',
                    text: 'Code',
                    hidden: false
                }, {
                    xtype: 'numbercolumn',
                    dataIndex: 'stockOnHand',
                    text: 'Stock',
                    format: '000',
                    align: 'right'
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'isActive',
                    text: 'Status',
                    renderer: function (value) {
                        return value ? 'Available' : 'Hidden';
                    }
                }],

                actions: [{
                    tooltip: 'View in Store',
                    iconCls: 'taco-action-hide',
                    eventName: 'viewproduct'
                }, {
                    tooltip: 'Duplicate Product',
                    iconCls: 'taco-action-addsub',
                    eventName: 'duplicateproduct'
                }, {
                    tooltip: 'Delete',
                    iconCls: 'taco-action-delete',
                    eventName: 'deleteproduct'
                }],

                dockedItems: [me.pager],
                listeners: {
                    deleteproduct: function (v, index, idx, action, e, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('deleteproduct', panel, record);
                    },
                    duplicateproduct: function (v, index, idx, action, e, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('duplicateproduct', panel, record);
                    },
                    viewproduct: function (v, index, idx, action, e, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('viewproduct', panel, record);
                    }
                }
              
            });

            me.tilepanel = Ext.create('Taco.core.ux.TilePanel', {
                store: me.store,
                actions: [{
                    iconCls: 'download',
                    tooltip: 'View Product',
                    eventName: 'viewproduct'
                }, {
                    iconCls: 'duplicate',
                    tooltip: 'Duplicate Product',
                    eventName: 'duplicate'
                }, {
                    iconCls: 'delete',
                    tooltip: 'Delete Product',
                    eventName: 'deleteproduct'
                }],
                imageCollection: 'productImages',
                imageField: 'imagePath',
                isDragable: false,
                nameField: 'productName',
                listeners: {

                    deleteproduct: function (view, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('deleteproduct', panel, record);
                    },
                    duplicateproduct: function (view, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('duplicateproduct', panel, record);
                    },
                    viewproduct: function (view, record) {
                        var panel = this;
                        me.itembrowser.fireEvent('viewproduct', panel, record);
                    },
                    tileclick: function (view, record) {
                        me.launchEditor(record);
                        Taco.app.StateManager.addState('products/edit/' + record.getId(), { id: record.getId() });
                    }
                }
            });
            


            me.itembrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
                uniquePanels: [me.gridpanel, me.tilepanel],
                itemStore: me.store,
                itemType: 'products',
                filterProperty: 'productName',
                flex: 1
            });

            Ext.apply(me.body, {
                layout: 'fit',
                items: [me.itembrowser]
            });

            me.callParent(arguments);
            me.store.load();

            basegridview = me.gridpanel.view;
            basegridview.mon(basegridview, 'itemclick', me.onItemClick, me);
            

            me.itembrowser.on({
                deleteproduct: function (panel, record) {
                    console.log('itembrowser deleteproduct fired', arguments);

                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        content: {
                            html: 'Are you sure you want to delete this product?'
                        },
                        listeners: {
                            cancel: function () { },
                            confirm: function () {
                                panel.setLoading(true);
                                me.store.remove(record);
                                me.store.sync({
                                    success: function (m) {
                                        panel.setLoading(false);
                                        Taco.app.fireEvent('setmessage', 'Product deleted.', 'status', m);
                                    },
                                    failure: function (m) {
                                        panel.setLoading(false);
                                        Taco.app.fireEvent('setmessage', 'Product deletion failed.', 'error', m);
                                    }
                                });
                                console.log('sync complete');
                            }
                        }
                    });
                },
                duplicateproduct: function (panel, record) {
                   
                    record.duplicate({
                        success: function (copy) {
                           // panel.setLoading(false);k
                            Taco.app.fireEvent('setmessage', 'Product copied.', 'status', copy);
                            if (record.stores) {
                                Ext.Array.each(record.stores, function(store) {
                                    if ( !store.getById(copy.getId())) {
                                        store.add(copy);
                                    }
                                        
                                });
                            }
                          
                            me.launchEditor(copy);
                            Taco.app.StateManager.addState('products/edit/' + copy.getId() || -1, { id: copy.getId() || -1 });
                        },
                        failure: function (m, operation) {
                            panel.setLoading(false);
                            Taco.app.fireEvent('setmessage', 'Product failed to copy.', 'error', m);
                        }
                    });
                },
                viewproduct: function (panel, record) {
                    window.open('/product/' + record.getId() + ((record.get('isActive'))? '':'?iseditmode=true'   ), 'preview');
                }
            });

            if( this.record && this.record.isModel ) {
                this.on({
                    afterrender: function () {
                        this.launchLoadedEditor( this.record );        
                    },
                    scope: this
                });
                
            }
        },

        onGlobalModelSave: function (model) {
            var itemInStore = this.store.getById(model.getId());
            if (itemInStore == null) {
                this.store.add([model]);
                return;
            }
            if (itemInStore !== model) {
                itemInStore.copyData(model);
            }

        },
        onNavigate: function (newState) {
            // navigation events that i can totes handle include: 
            var md = newState.getMetaData();
            if (md.controller && md.controller === "products" && md.action === "edit") {
                this.launchEditor(md.args[0]);
                return false;
            }
        },

        launchEditor: function (record) {
            var me = this;
            if ( Ext.isString(record)) {
                Taco.model.Product.load(record, {
                    success: function (model) {
                        me.launchLoadedEditor(model);
                    }
                });
                return;
            }
            me.launchLoadedEditor(record);
        },
        launchLoadedEditor:function(record){
            var me = this,
                token = 'products/edit/',
                editorView;

            editorView = Ext.create('Taco.view.product.Edit', {
                logicalParent: me,
                listeners: {
                    cancel: function () {
                        editorView.destroy();
                        Taco.core.StateManager.addState('products');
                        if (me.isDirty) {
                            me.store.load();
                            me.isDirty = false;
                        }
                    },
                    save: function () {
                        me.isDirty = true;
                    },
                    created:function (newRecord, editor) {
                        editorView.destroy();
                        me.launchEditor(newRecord);
                        //try {
                        //    me.store.add([newRecord]);
                        //}
                        //catch (err) {
                        //    console.log(err);
                        //}
                        
                        Taco.app.StateManager.addState('products/edit/' + newRecord.getId());
                    },
                    create: function (newRecord) {
                        me.isDirty = true;
                        editorView.destroy();
                        me.launchEditor(newRecord);
                        Taco.app.StateManager.addState('products/create');
                    },
                    copyrecord: function (newRecord) {
                        editorView.destroy();
                        if (!me.store.getById(newRecord.getId())) {
                            me.store.insert(0, newRecord);
                        }
                        me.launchEditor(newRecord);
                        Taco.app.StateManager.addState('products/edit/' + newRecord.getId() || -1, { id: newRecord.getId() || -1 });
                    },
                    deleterecord: function () {
                        editorView.destroy();
                        Taco.app.StateManager.addState('products');
                    }
                },
                record: record
            });

            Taco.app.contentView.add(editorView);
        },

        onItemClick: function (view, record, elm, index, e) {
            // console.log(e.target);
            if (e.target.className === 'taco-launch-editor') {
                e.preventDefault();
                this.launchEditor(record);
                Taco.app.StateManager.addState('products/edit/' + record.getId(), { id: record.getId() });
            }
        }
    });
