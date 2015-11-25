/**
 * @class Taco.core.ux.mixins.ActionColumn 
 * Grid Mixin that provides custom paging toolbar
 * add this to the initComponent of your grid to initilize this mixin
  
    // to include this mixin in your class:

        mixins: {
            pageable: 'Taco.core.ux.mixins.ActionColumn'
        },

    
    // to initialize the mixin

        < ... code fragment ... >

            initComponent: function (){

                //initialize the action column and insert it into the last position of the this.columns array
                if (this.showActionsColumn) {
                    var actionColumn = this.getActionColumn();
                    if (actionColumn) {
                        this.columns.push(actionColumn);
                    }
                }

                this.callParent(arguments)
            }

        < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.ActionColumn', {    
    /*
     *  Controls whether the action column is added to the column collection.     
     */
    showActionsColumn : true,

    /*
     * the model you are displaying in the grid. this will be used to determine requiredBehaviors permissions.
     *  Example 
     *  requiredBehaviorsModel: 'Taco.model.CouponSet'
     */
    requiredBehaviorsModel: "",

    /* 
     *show the default edit action in the actions and context menu;
     */
    enableEditAction: true,

    /* 
     *show the default delete action in the actions and context menu;
     */
    enableDeleteAction: true,


    // often overwritten as Remove.
    deleteActionText: "Remove",


    /* 
     *show the default delete action in the actions and context menu;
     */
    enableDeleteAllAction: true,

    // often overwritten as Remove All.
    deleteAllActionText: "Remove All",

    /* 
     * Initializes the action column and returns the action column config to be used in the columns array.
     */
    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            }
        }

        return actionColumn;
    },

     
    /* 
     * list of actions to put in action column and context menu;
     */
    getActionItems: function () {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: 'Edit',               
                requiredBehaviors: (me.requiredBehaviorsModel) ? {
                    model: me.requiredBehaviorsModel,
                    behavior: 'update'
                } : null,
                menuColumnHandler: me.doEdit,
                scope: me
            });
        }

        if (this.enableDeleteAction) {
            actions.push({
                text: me.deleteActionText,
                itemId: "deleteMenuItem",
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: "deleteMenuColumnHandler",
                requiredBehaviors: (me.requiredBehaviorsModel) ? {
                    model: me.requiredBehaviorsModel,
                    behavior: 'delete'
                } : null,
                scope: me
            });
        }

        //TODO really should add the delete all to the DeleteFromGrid.js Mixin. This will require extensive refactoring since it currently is only able to delete one at a time and will also require broad testing.
        if (this.enableDeleteAllAction) {
            actions.push({
                xtype: 'menuseparator',
                style: 'border:0px;height:1px;background-color:#ccc;margin:6px 0px;'
            })
            actions.push({
                text: me.deleteAllActionText,
                itemId: "deleteAllMenuItem",                
                menuColumnHandler: me.doDeleteAll,
                requiredBehaviors: (me.requiredBehaviorsModel) ? {
                    model: me.requiredBehaviorsModel,
                    behavior: 'delete'
                } : null,
                scope: me
            });
        }


        return actions;
    },

    onActionMenuShow: function (menu, eventData) {
        var me = this;
                
        /*
            // sample code to hide and show the delete action menu item based on some thing in the record;

            var deleteMenuItem = menu.down("#deleteMenuItem");
            if (deleteMenuItem) {
                if (eventData.record.get('canBeDeleted')) {
                    deleteMenuItem.show();
                } else {
                    deleteMenuItem.hide();
                }
            }

        */
    },

    doEdit: function () {
        console.log("you are expected to override this method with a view specific edit function");
    },

    doDeleteAll: function (item, eventData) {
        var grid = eventData.grid,
            record = eventData.record;

        grid.store.removeAll();
        grid.store.loadPage(1);
    }

});