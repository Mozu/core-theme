/**
 * @class Taco.view.fileManagement.GridPanel
 */
Ext.define('Taco.view.fileManagement.GridPanel', {
    extend: 'Taco.core.ux.BaseGrid',
    mixins: ['Taco.core.ux.FileDragDroppable'],
    requires: ["Ext.data.UuidGenerator", "Taco.view.fileManagement.UpdateBar", "Ext.grid.column.Action", "Taco.core.ux.DragHandleColumn", "Taco.core.ux.QuickAdder", "Taco.core.ux.ClassHandledDragDrop", "Taco.core.ux.action.TreeListAction", "Taco.core.ux.GridPager"],
    alias: 'widget.filelist',

    cls: 'taco-treelist',
    collapsible: false,
    useArrows: true,
    lines: false,
    enableColumnResize: true,
    enableColumnMove: false,
    enableRowReorder: true,
    preventHeader: false,
    sortableColumns: false,
    enableActions: true,
    autoSync: true,
    forSelectionModal: false,
    enableColumnHide: true,

    columns: [{
        xtype: 'draghandlecolumn',
        width: 36,
        hideable: false
    }, {
        xtype: 'templatecolumn',
        header: 'Image',
        tpl: '<tpl if="localthumbnail"><div class="taco-basegrid-thumbnail"><img width="60" src="{localthumbnail}" /></div><tpl else><div class="taco-basegrid-thumbnail"><img width="60" src="{thumbnail}?size=60" /></div></tpl>'
    }, {
        header: 'Name',
        dataIndex: 'name',
        sortable: true,
        hideable: false,
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false,
            style: {
                marginTop: "20px"
            }
        }
    }, {
        header: 'Date',
        dataIndex: 'dateModified',
        xtype: 'datecolumn',
        format: 'M j Y g:i a',
        minWidth: 150,
        sortable: true
    }, {
        header: 'Type',
        dataIndex: 'fileType',
        sortable: true
    }, {
        header: 'Size',
        dataIndex: 'fileSize',
        renderer: Ext.util.Format.fileSize,
        sortable: true
    }, {
        dataIndex: 'isUploaded',
        hideable: false,
        xtype: 'gridcolumn',
        cls: Taco.baseCSSPrefix + 'column-header-empty',
        width: 120,
        suppressUpdateCell: true,
        renderer: function (val, meta, record, row, col, store, view) {
            var id, cnt, fn;
            if (!val) {
                id = Ext.data.IdGenerator.get('uuid').generate();
                cnt = 0;
                fn = function () {
                    var node = Ext.query("#" + id)[0];
                    if (node) {
                        if (node.childElementCount == 0) {
                            Ext.create('Taco.view.fileManagement.UpdateBar', {
                                width: 100,
                                document: record,
                                renderTo: node
                            });
                        } else {
                            return;
                        }
                    } else {
                        if (cnt++ < 10) {
                            Ext.defer(fn, 100);
                        }
                    }
                };
                Ext.defer(fn, 1);
                return "<div id='" + id + "'></div>";
            }
            return "";
        }
    }],
    actions: [{
        tooltip: 'Delete',
        iconCls: 'taco-action-delete',
        eventName: 'deletefile'
    }, {
        tooltip: 'Download',
        iconCls: 'taco-action-hide',
        eventName: 'downloadfile'
    }],
    
    initComponent: function () {
        var me = this;
        me.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        });

        me.plugins = [me.cellEditing];

        me.droparea = Ext.create('Ext.Component', {
            xtype: 'component',
            cls: Taco.baseCSSPrefix + 'grid-droparea',
            html: '<div class="taco-grid-droparea-inner"><p class="droparea-instructions">Simply drag and drop files from your computer<br/> or click upload</p><p class="droparea-learn-more">click here to learn about &nbsp;<a href="#igetit">file types</a></p></div>',
            height: 'auto',
            weight: 101,
            padding: 2,
            flex: 1,
            listeners: {
                click: {
                    element: 'el',
                    fn: function (e, t) {

                        e.stopPropagation();
                        e.preventDefault();
                        me.droparea.hide();
                    },
                    delegate: 'a'
                }
            },
            dock: 'top'
        });

        me.pager = Ext.create('Taco.core.ux.GridPager', {
            store: me.store
        });

        this.mixins["Taco.core.ux.FileDragDroppable"].init.call(this);

        me.dockedItems = [me.droparea, me.pager];
        me.viewConfig = {
            shouldUpdateCell: function (column, changedFieldNames) {
                if (column.suppressUpdateCell) {
                    return false;
                }
                if (column.hasCustomRenderer) {
                    return true;
                }
                return !changedFieldNames || Ext.Array.contains(changedFieldNames, column.dataIndex);
            },

            listeners: {
                render: me.initFileDragZone,
                itemadd: function (records, index, nodes) {
                    Ext.Array.each(nodes, function (node, idx) {
                        Ext.get(node).setOpacity(0.5);
                    });
                }
            }
        };

        me.callParent(arguments);

        me.on({
            cellclick: function (v, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                if (v.lastCellClick && v.lastCellClick.rowIndex == rowIndex && v.lastCellClick.cellIndex == cellIndex) {
                    me.cellEditing.startEditByPosition({ row: rowIndex, column: cellIndex });
                }
                else {
                    me.cellEditing.completeEdit();
                }
                v.lastCellClick = { rowIndex: rowIndex, cellIndex: cellIndex };

            },
            'edit': function (editor, e) {
                if (e.record.dirty) {
                    e.record.save();
                }
            }
        });
        me.mon(Taco.core.util.UploadManager, 'complete', function (e) {
            var docId = e.document.getId(),
                itemInStore;
            if (docId) {
                itemInStore = me.store.getById(docId);
                if (itemInStore) {
                    itemInStore.reload();
                }
            }
        });
    },

    setFolder: function (folderNode) {
        this.folder = folderNode;

        var filter = Ext.create('Ext.util.Filter', {
            id: "folderId",
            property: "folderId",
            value: this.folder.getId(),
            root: 'data'
        });
        this.store.clearFilter(true);
        this.store.filter(filter);

    },

    initFileDragZone: function (v) {
        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
            getDragData: function (e) {
                var sourceEl = e.getTarget(v.itemSelector, 10),
                d;

                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return v.dragData = {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        fileData: v.getRecord(sourceEl)
                    };
                }
            },

            getRepairXY: function () {
                return this.dragData.repairXY;
            }
        });
    }
});
