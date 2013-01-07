/**
 * @class Taco.view.fileManagement.MultiFileAssociator
 */
Ext.define('Taco.view.fileManagement.MultiFileAssociator', {
    extend: 'Taco.core.ux.modal.ContentWithActions',
    requires: ['Taco.view.fileManagement.Index', 'Taco.view.fileManagement.TilePanel','Taco.store.FileManagementFiles','Taco.model.FileManagementFile','Taco.store.shared.BaseStore'],
    mixins: {
        savable: 'Taco.view.fileManagement.Savable'
    },
    autoShow: true,
    allowMultiple: true,
    originalValue: null,
    isModal: true,
    showDimensions: true,
    initComponent: function () {

        var selectedFilters = [], filterArr=[], me = this;
        me.selectedStore = Ext.create('Taco.store.shared.BaseStore', {
            autoSync: false,
            model: 'Taco.model.FileManagementFile',
            autoLoad: false,
            id:'selectedfileManagementFiles'
        });
        me.addManagedListener(me.selectedStore, 'datachanged', me.onSelectedStoreChange, me);
        me.addManagedListener(me.selectedStore, 'update', me.onSelectedStoreChange, me);
        me.addManagedListener(me.selectedStore, 'load', me.onSelectedStoreChange, me);

        me.originalValue = [];
        if (me.initialSelected && me.initialSelected.length > 0) {
            
            Ext.Array.each(me.initialSelected, function (item) {
                var entry, parts;
                if (Ext.isString(item)) {
                    parts = item.split('/');
                    entry = {
                        id: parts[parts.length - 1]
                    };
                } else {
                    entry = item;
                }
                me.originalValue.push(entry);
                selectedFilters.push(Ext.create('Ext.util.Filter', {
                    anyMatch: true,
                    property: 'id',
                    value: entry.id,
                    filterFn :function(recored) {
                        var res, id = recored.getId();
                        Ext.Array.each(me.originalValue, function (selectedItem) {
                            if ( selectedItem.id == id) {
                                res = true;
                                return;
                            }
                        });
                        return res;
                    }
                }));
            });
            me.selectedStore.load({
                filters:selectedFilters,
                callback: function ( records, operation, successful) {
                    Ext.Array.each(records,function (record) {
                        Ext.Array.each(me.originalValue, function (ov) {
                            if (ov.id == record.getId()) {
                                record.set('alt', ov.alt);
                                return false;
                            }
                        });
                    });

                }
            });
        }

        me.foldersStore = Taco.app.getStore('Taco.store.FileManagementFolders');
        
        me.filesStore = Taco.app.getStore('Taco.store.FileManagementFiles');

        
        

        me.filelist = Ext.widget('filelist', {
            xtype: 'filelist',
            store: me.filesStore,
            itemId: 'filelist',
            forSelectionModal: true,
            hiddenColumns: ['dateModified', 'fileSize', 'fileType'],
            simpleSelect: me.allowMultiple,
            listeners: {
                filedrop: me.onSaveFiles,
                select: function (sel, mod) {
                    if (Ext.isEmpty(mod)) {
                        return;
                    }
                    var items = Ext.Array.from(mod);

                    if (!me.allowMultiple) {
                        me.selectedStore.removeAll();
                    }
                    Ext.each(items, function (record) {
                        if (!me.selectedStore.getById(record.getId())) {
                            me.selectedStore.add(record);
                        }
                    });
                },
                deletefile: function (v, index, idx, action, e, record) {
                    var panel = this;
                    me.down('itembrowser').fireEvent('deletefile', panel, record);
                   
                },
                deselect: function (sel, mod) {
                    var selMod = me.selectedStore.getById(mod.getId());
                    if (selMod) {
                        me.selectedStore.remove(selMod);
                    }
                },
                scope: me

            }
        });

        me.tilepanel = Ext.create('Taco.view.fileManagement.TilePanel', {
            store: me.filesStore,
            simpleSelect: me.allowMultiple,
           // actions: ['delete', 'download'],
            listeners: {
                filedrop: me.onSaveFiles,
                select: function (sel, mod) {
                    if (Ext.isEmpty(mod)) {
                        return;
                    }
                    var items = Ext.Array.from(mod);

                    if (!me.allowMultiple) {
                        me.selectedStore.removeAll();
                    }
                    Ext.each(items, function (record) {
                        if (!me.selectedStore.getById(record.getId())) {
                            me.selectedStore.add(record);
                        }
                    });


                },
                deselect: function (sel, mod) {
                    me.selectedStore.remove(mod);
                },
                scope: me
            }
        });

        me.selectedPanel = Ext.create('Taco.core.ux.TilePanel', {
            store: me.selectedStore,
            editorTriggerCls: 'name',
            minHeight: 200,
            listeners: {
                filedrop: {
                    fn: function (fileList, e) {
                        me.onSaveFiles(fileList, e, function (newDocs) {
                            me.selectedStore.add(newDocs);
                        });
                    },
                    scope: me
                }
            },
            items: [{
                xtype: 'tileview',
                actions: ['remove'],
                featured: true,
                tileSizes: [160],
                flex: 1,
                listeners: {
                    render: function (v) {
                        v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
                            getTargetFromEvent: function (e) {
                                return e.getTarget('.taco-datalist-item');
                            },

                            onNodeOver: function (target, dd, e, data) {
                                return Ext.dd.DropZone.prototype.dropAllowed;
                            },

                            onNodeDrop: function (target, dd, e, data) {
                                var targetRecord = v.getRecord(target),
                                    targetLoc = v.indexOf(targetRecord);
                                v.store.remove(data.record);
                                v.store.insert(targetLoc, data.record);
                                return true;
                            }
                        });
                    }
                }
            }, {
                xtype: 'form',
                itemId: 'selecteditemeditor',
                border: 1,
                hidden: true,
                listeners: {
                    render: function () {
                        this.getForm().trackResetOnLoad = true;
                    },
                    dirtychange: function (form, isDirty) {
                        this.getForm().updateRecord(this.getForm().getRecord());
                    }
                },
                defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeparator: '',
                    width: 200
                },
                items: [{
                    fieldLabel: 'Alt Text',
                    name: 'alt'

                }, {
                    fieldLabel: 'Height',
                    name: 'height',
                    itemId: 'height',
                    hidden: !me.showDimensions
                }, {
                    fieldLabel: 'Width',
                    name: 'width',
                    itemId: 'width',
                    hidden: !me.showDimensions
                }, {
                    xtype: 'slider',
                    value: 100,
                    maxValue: 200,
                    minValue: 5,
                    increment: 1,
                    useTips: true,
                    listeners: {
                        change: function (slider, newValue, thumb, eOpts) {
                            var form = slider.up('form'),
                                width = form.down('#width'),
                                height = form.down('#height'),
                                record = form.getRecord(),
                                originalValue;
                            me.ovCache = me.ovCache || {};
                            originalValue = me.ovCache[record.getId()];
                            if (!originalValue) {
                                me.ovCache[record.getId()] = originalValue = { height: record.get('height'), width: record.get('width') };
                            }
                            width.setValue(Math.round(originalValue.width * (newValue * 0.01)));
                            height.setValue(Math.round(originalValue.height * (newValue * 0.01)));
                        }
                    }
                }]
            }],

            onEdit: function () {
                var form = me.selectedItemEditor.getForm(),
                    previousRecord = form.getRecord();

                if (previousRecord) {
                    form.updateRecord(previousRecord);
                }
                me.selectedItemEditor.setVisible(true);
                form.loadRecord(record);
            },

            onRemove: function (view, record) {
                if (record.isModel) {
                    me.selectedStore.remove(record);
                }
            },

            initFileDragZone: function (v) {
                v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
                    getDragData: function (e) {
                        var sourceEl = e.getTarget(v.itemSelector, 10),
                            d;

                        if (sourceEl) {
                            d = sourceEl.cloneNode(true);
                            d.id = Ext.id();
                            v.dragData = {
                                sourceEl: sourceEl,
                                repairXY: Ext.fly(sourceEl).getXY(),
                                ddel: d,
                                record: v.getRecord(sourceEl)
                            };
                            return v.dragData;
                        }
                    },

                    getRepairXY: function () {
                        return this.dragData.repairXY;
                    }
                });

                v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
                    getTargetFromEvent: function (e) {
                        return e.getTarget('.taco-thumbnail-item');
                    },

                    onNodeOver: function (target, dd, e, data) {
                        return Ext.dd.DropZone.prototype.dropAllowed;
                    },
                    onNodeDrop: function (target, dd, e, data) {
                        var targetRecord = v.getRecord(target),
                                    targetLoc = v.indexOf(targetRecord);
                        v.store.remove(data.record);
                        v.store.insert(targetLoc, data.record);
                        return true;
                    }
                });
            }
        });

        me.foldertree = Ext.create('Taco.view.fileManagement.FolderTree', {
            xtype: 'foldertree',
            store: me.foldersStore,
            region: 'west',
            width: 200,
            //  enableRowReorder: false,
            //  split: true,
            //  hideHeaders: true,
            showHeader: true,
            showNewFolder: true,
            flex: 0.5,
            itemId: 'foldertree',
            hidden: false,
            listeners: {
                filedrop: {
                    fn: me.onSaveFiles,
                    scope: me
                },
                render: function (){
                    //var node ,filter = me.filesStore.filters.get('folderId');
                    //if (filter) {
                    //    node =me.foldersStore.getNodeById( filter.value );
                    //    if (node) {
                    //        node.expand();
                    //        me.foldertree.getSelectionModel().select([node]);
                    //    }
                    //}
                },
                selectionchange: function (view, models, eOpts) {
                    if (models && models.length > 0) {
                        me.down('#filelist').setFolder(models[0]);
                    }

                }
            }
        });

        me.itembrowser = {
            header: false,
            xtype: 'itembrowser',
            title: 'Use Existing',
            uniquePanels: [me.filelist, me.tilepanel],
            commonPanels: [me.foldertree],
            itemStore: me.filesStore,
            itemType: 'files',
            filterProperty: 'name',
            flex: 1,
            listeners: {
                deletefile: function (panel, record) {
                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        text: 'Are you sure you want to delete this File?',

                        listeners: {
                            confirm: function () {
                                me.filesStore.remove(record);
                                record.destroy();
                            },
                            scope: this
                        }
                    });
                }
            }
        };

        

        this.content = {

            items: [
                {
                    xtype: 'container',
                    layout: { type: 'vbox', align: 'right' },
                    items: [{
                        xtype: 'tacofilefield',
                        text: 'Upload',
                        listeners: {

                            filechange: function (fileList, e) {
                                me.onSaveFiles(fileList, e, function (newDocs) {
                                    me.selectedStore.add(newDocs);
                                });
                            },
                            scope: me
                        }
                    }]
                },

                {
                xtype: 'tacotabpanel',
                itemId: 'tabPanel',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1,
                items: [{
                    xtype: 'container',
                    titleTpl: 'pictures <tpl if="count &gt; -1"><span>{count}</span></tpl>',
                    titleData: {
                        count: -1
                    },
                    layout: {
                        type: 'fit',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [me.selectedPanel]
                }, {
                    title: 'use existing',
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [me.itembrowser]
                }]
            }]
        };

        this.callParent(arguments);

        me.selectedItemEditor = me.down('#selecteditemeditor');

        me.filelist.getSelectionModel().deselectAll = Ext.emptyFn;

        me.filelist.getView().on({
            refresh: function () {
                var records = [];
                me.selectedStore.data.each(function (record) {
                    var itemInStore = me.filelist.store.getById(record.getId());
                    if (itemInStore) {
                        records.push(itemInStore);
                    }
                });
                me.filelist.getSelectionModel().select(records);
            }
        });

        me.tilepanel.getView().on({
            refresh: function () {
                var records = [];
                me.selectedStore.data.each(function (record) {
                    var itemInStore = me.tilepanel.store.getById(record.getId());
                    if (itemInStore) {
                        records.push(itemInStore);
                    }
                });
                me.tilepanel.getView().getSelectionModel().select(records);
            }
        });

        this.on('aftershow', function () {
            if (me.selectedStore.isLoading()) {

                var selectorview = me.selectedPanel.getView(),
                    cfg = {
                        msg: selectorview.loadingText,
                        msgCls: selectorview.loadingCls,
                        useMsg: selectorview.loadingUseMsg,
                        store: selectorview.store
                    };
                selectorview.loadMask = new Ext.LoadMask(selectorview, cfg);
                selectorview.loadMask.on({
                    scope: selectorview,
                    beforeshow: selectorview.onMaskBeforeShow,
                    hide: selectorview.onMaskHide
                });
                selectorview.loadMask.show();
            }
        });

        me.on('beforesave', function () {
            var formPanel = me.down('#selecteditemeditor'),
                form = formPanel.getForm(),
                previousRecord = form.getRecord();
            if (previousRecord) {
                form.updateRecord(previousRecord);
            }
        });

    },
    getSelectedRecords: function () {
        return this.selectedStore;
    },

    

    onSelectedStoreChange: function () {
        var tabPanel = this.down('#tabPanel'),
            curValue = [];
        this.selectedStore.each(function (item) {
            curValue.push({
                id: item.get('id'),
                alt: item.get('alt')
            });
        });
        tabPanel.tabActionItems[0].update({
            count: this.selectedStore.getCount()
        });
        this.dirtyButton.setDirty(Ext.encode(curValue) != Ext.encode(this.originalValue));
    }
});