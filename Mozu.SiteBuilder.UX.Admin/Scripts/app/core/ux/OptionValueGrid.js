/**
 * @class Taco.core.ux.OptionValueGrid
 * @author Jason Cochran
 * The OptionValueGrid
 */

    var cellEditing;

    Ext.define('Taco.core.ux.OptionValueGrid', {
        extend: 'Ext.grid.Panel',

        requires: ['Taco.core.ux.DragHandleColumn', 'Ext.selection.CellModel'],

        model: 'Taco.model.OptionValue',
        alias: 'widget.optionvaluegrid',
        data: null,
        store: null,
        hidden: false,
        itemId: 'optionValueGrid',
        hideHeaders: true,
        width: 400,
        title: 'Add "Additional" Values',
        getSelectedIds: function ()
        {
            var me = this,
                ret = [];
            if (me.readOnly)
            {
                me.getSelectionModel().selected.each(function (item)
                {
                    ret.push(item.getId());
                });
            }
            else
            {
                me.store.each(function (item)
                {
                    ret.push(item.getId());
                });
            }
            return ret;
        },
        initComponent: function () {
            me = this;

            if (me.readOnly)
            {
                me.selModel = Ext.create('Ext.selection.CheckboxModel', {
                    checkOnly: true,
                    listeners: {
                        selectionchange: function (model, records) {

                        }
                    }
                });
            }
            me.store = me.data;

            cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            });

            me.plugins = [cellEditing];
            me.callParent(arguments);
        },




        columns: [{
            xtype: 'draghandlecolumn',
            width: 50
        }, {
            dataIndex: 'value',
            sortable: false,
            text: 'internalName',
            xtype: 'gridcolumn',
            editor: {
                allowBlank: false
            },
            flex: 1
        }, {
            xtype: 'actioncolumn',
            width: 50,
            iconCls: 'taco-action-delete',
            tooltip: 'Delete',
            handler: function (grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                grid.getStore().remove(rec);
            }
        }],

        viewConfig: {
            plugins: {
                ptype: 'gridviewdragdrop',
                dragText: 'Drag and drop to reorganize'
            },
            listeners: {
                drop: function (node, data, dropRec, dropPosition) {


                    var models = this.getRecords(this.getNodes());
                    Ext.each(models, function (model, i) {
                        model.set('sequence', i);
                    });

                }
            }
        },

        dockedItems: [{
            xtype: 'button',
            dock: 'bottom',
            text: 'add',
            handler: function () {
       
                var g = me;
                var store = me.data;

                var newOpt = new Taco.model.OptionValue();
                newOpt.set('sequence', store.count());
                store.insert(store.count(), newOpt);
                cellEditing.startEdit(newOpt, g.columns[1]);
            }
        }]
    });