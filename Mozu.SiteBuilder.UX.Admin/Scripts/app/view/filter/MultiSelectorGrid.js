/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.filter.MultiSelectorGrid', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [

    ],

    statics: {
        
    },
        
    EmptyText: "No Values To Display",

    //autoHeight:true,
    //height:"300",

    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();
        
        this.mon(me, "itemkeydown", function (view, record, item, index, e) {
            console.log(e.getKey());
            console.log(e.DELETE);
            switch (e.getKey()) {
                case e.ENTER:
                    // need to correct the event to give it an xy position relative to the row in the tree.
                    //e.xy = Ext.get(item).getXY();
                    //e.xy[0] = e.xy[0] + xOffset;
                    //e.xy[1] = e.xy[1] + yOffset;
                    //me.editNode(record.get("id"), record, item, index, e);

                    // open an editor in place
                    break;
                
                case e.DELETE:
                   
                    record.destroy();
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


        columns.push( {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            onMenuShow: function(menu, eventData) {
                //// need to disable the delete menu option when discount has been used
                //var deleteMenuItem = menu.down("#deleteMenuItem");
                //if (eventData.record.get('canBeDeleted')) {
                //    deleteMenuItem.show();
                //} else {
                //    deleteMenuItem.hide();
                //}
            },
            menuItems: [
                 {
                    text: 'Delete',
                    itemId: "deleteMenuItem",
                    accelerator: "DELETE",
                    width:250,
                    // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                     //menuColumnHandler: "deleteMenuColumnHandler",
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        record.destroy();
                        
                        //Ext.defer(function () {
                        //    Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                        //}, 1, this);
                    },
                    //requiredBehaviors: {
                    //    model: 'Taco.model.Discount',
                    //    behavior: 'delete'
                    //},
                    scope: me
                }
            ]
        });

        return columns;
    }
});