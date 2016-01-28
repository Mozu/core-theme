/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.filter.MultiSelectorGrid', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Taco.core.ux.grid.MenuColumn'
    ],

    mixins: {
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    enableDeleteAction:true,
    
    showActionsColumn:true,
    
    sortableColumns : false,

    statics: {
        
    },
    removeAction : "destroy",
        
    deferEmptyText: false,
    emptyText: "No Values To Display",

    config : {
        gridActions: []
    },

    removeItemText: 'Delete',

    //autoHeight:true,
    //height:"300",

    initComponent: function () {
        var me = this;

        this.viewConfig = this.viewConfig || {}
        this.viewConfig.emptyText = this.emptyText;
        this.viewConfig.deferEmptyText = this.deferEmptyText;


        this.columns = this.getColumnConfig();
        
        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }
        
        this.mon(me, "itemkeydown", function (view, record, item, index, e) {
            switch (e.getKey()) {
                case e.ENTER:

                    // open an editor in place
                    break;
                
                case e.DELETE:
                    this.removeRecord(record);
                    break;
            }
        });

        // select records after a delete;
        this.mon(me.store, "remove", function (view, record, index, isMove, eOpts) {
            var indexToSelect = (me.store.count() == index) ? index - 1 : index;
            var recordToSelect = me.store.getAt(indexToSelect);
            
            if (recordToSelect) {
                me.getSelectionModel().select(recordToSelect);
            }
        });


        me.callParent(arguments);

        this.mixins.gridcontextmenu.constructor.apply(this);
    },
    





    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    //   xtype: 'gridcolumn',
                    dataIndex: 'id',
                    text: 'Id',
                    renderer: function (value, record) {
                        return value;
                        //todo: add display format
                        //return Taco.app.context.getCurrent().formatCurrency(value);
                    },
                    hideable: false,
                    flex: 1,
                    minWidth: 150
                }
            ];

        return columns;
    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this,
            gridActions = this.getGridActions() || [];


        if (this.enableDeleteAction) {


            gridActions.push({
                text: this.removeItemText,
                itemId: "deleteMenuItem",
                accelerator: "DELETE",
                width: 250,
                menuColumnHandler: function(item, eventData) {
                    var record = eventData.record;
                    //eventData.grid.removeRecord(record);
                    Ext.bind(eventData.grid.removeRecord, eventData.grid, [record])();
                },
                scope: me
            });
        }
        return gridActions;
    },

    removeRecord: function (record) {
        if (this.removeAction == "destroy") {
            record.destroy();
        } else {
            this.store.remove([record]);
            //record.destroy();
        }
        
    },

    onActionMenuShow: function (menu, eventData) {

    },

    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            gridActions = this.getActionItems();

        // as long as we have actions;
        if (gridActions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                onMenuShow: me.onActionMenuShow,
                menuItems: gridActions
            }
        }

        return actionColumn;
    }






});