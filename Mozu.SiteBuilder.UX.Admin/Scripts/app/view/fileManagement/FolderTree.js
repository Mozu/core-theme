/**
 * @class Taco.view.fileManagement.FolderTree
 */
Ext.define('Taco.view.fileManagement.FolderTree', {
    extend: 'Taco.core.ux.TreeList',
    alias: 'widget.foldertree',
    mixins: ['Taco.core.ux.FileDragDroppable'],
    cls: Taco.baseCSSPrefix + 'foldertree',
    flex: 1,
    width: 200,
    minWidth: 200,
    showNewFolder: true,
    columns: [{
        xtype: 'treecolumn',
        text: 'Folder',
        flex: 1,
        dataIndex: 'name',
        editor: {
            xtype: 'textfield',
            allowBlank: false,
            style: {
                marginTop: "10px"
            }

        }
    }],

    actions: [{
        tooltip: 'Delete',
        iconCls: 'taco-action-delete',
        eventName: 'deletefolder'
    }],

    initComponent: function () {
        var me = this,
        cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2,
            listeners: {
                beforeedit: function (e, editor) {
                    // Don't allow editing for the "All Files" folder name
                    if (editor.rowIdx == 0) {
                        return false;
                    }
                }
            }
        });

        me.cellEditing = cellEditing;
        me.plugins = [cellEditing];

        this.mixins["Taco.core.ux.FileDragDroppable"].init.call(this);

        this.callParent(arguments);

        me.getView().on({
            render: me.initFolderDropZone
        });

        this.on({
            deletefolder: this.onDeleteFolder,
            beforeitemmove: function (s, oldParent, newParent, idx, opts) {
                // Don't move the "All Files" folder
                return s.get("parentId") != 0;
            },
            cellclick: function (v, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                if (v.lastCellClick && v.lastCellClick.rowIndex == rowIndex && v.lastCellClick.cellIndex == cellIndex) {
                    me.cellEditing.startEditByPosition({ row: rowIndex, column: cellIndex });
                }
                else {
                    me.cellEditing.completeEdit();
                }
                v.lastCellClick = { rowIndex: rowIndex, cellIndex: cellIndex };
            },

            render: function () {
                var colEl;

                if (!this.showNewFolder) {
                    return;
                }

                if (me.down('actioncolumn')) {
                    colEl = Ext.get(me.down('actioncolumn').getId() + '-textEl');

                    if (colEl) {
                        colEl.addCls(Taco.baseCSSPrefix + 'treelist-add');
                        colEl.on({
                            scope: this,
                            click: function () {
                                Ext.Msg.prompt('Name', 'Folder Name:', function (btn, text) {
                                    if (btn === 'ok') {
                                        var node = me.getSelectedNode();
                                        if (node.getDepth() === 0) {
                                            // dont use the root this only exists on the client
                                            node = node.getChildAt(0);
                                        }

                                        node.set('leaf', false);
                                        node.appendChild({
                                            name: text,
                                            parentId: node.getId()
                                        });
                                        node.expand();
                                    }
                                });
                            }
                        });
                    }
                }
            },
            scope: this
        });
    },

    getSelectedNode: function () {
        var selected = this.getSelectionModel().selected.getAt(0);
        if (selected) {
            return selected;
        }
        else {
            return this.store.getRootNode();
        }
    },

    onDeleteFolder: function (list, index, index2, actionEl, e, model) {
        if (index != 0) {
            Ext.create('Taco.core.ux.modal.Confirmation', {
                autoShow: true,
                text: 'Are you sure you want to delete this Folder?',

                listeners: {
                    confirm: function () {
                        model.remove();
                    },
                    scope: this
                }
            });
        }
    },

    initFolderDropZone: function (v) {
        var treeview = v,
        tree = treeview.up('treepanel');

        tree.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent: function (e) {
                return e.getTarget('.x-grid-row');
            },

            onNodeOver: function (target, dd, e, data) {
                return Ext.dd.DropZone.prototype.dropAllowed;
            },

            onNodeDrop: function (target, dd, e, data) {

                //if folder drop
                if (data.records && data.records.length && data.records[0].isNode) {
                    treeview.getRecord(target).appendChild(data.records);
                    treeview.getRecord(target).expand();
                    return true;
                }
                //if drop from fileList
                if (data.fileData) {
                    data.fileData.set('folderId', treeview.getRecord(target).getId());
                    data.fileData.save();
                    data.fileData.store.remove(data.fileData, true);
                    return true;
                }
            }
        });
    }
});
