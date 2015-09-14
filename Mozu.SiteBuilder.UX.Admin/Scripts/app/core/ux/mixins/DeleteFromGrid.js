/**
 * @class Taco.core.ux.mixins.DeleteFromGrid 
 * View Mixin that provides the grid capability to delete the entity 

 
  // to include this mixin in your class:

        mixins: {
            deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
        },
        initComponent: function (){

            //initialize the content navigation toolbar.
            this.mixins.deleteFromGrid.init.apply(this);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.DeleteFromGrid', {
    requires: [
        'Taco.core.util.ExceptionWhiner',
        'Ext.MessageBox'
    ],
    mixins: {
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    init: function () {
        var me = this;
        this.mixins.permissions.constructor.apply(this, arguments);

        me.addEvents(
           /**
            * @event
            * Fired before the save event is run.
            * Returning false from an event listener can prevent the save from occurring.
            * @param {Taco.core.ux.window.Modal} this
            */
           'beforedelete',
           /**
            * @event
            * Fired after the save button is clicked, but before the save process has completed. See savesuccess for the event you should listen to to get data fromt his modal.
            * @param {Taco.core.ux.window.Modal} this
            */
           'delete',
           /**
            * @event
            * Fired when a save operation was successful.
            * @param {Taco.core.ux.window.Modal} this
            * @param {Mixed} data. Typically a record, but it could be an array, json, or string as well. Optional, but strongly recommended;
            */
           'deletesuccess'
        );
    },

    deletePromptMsg : "Are you sure you want to delete this?",

    /**
     * @cfg saveActionHandler
     * The function to execute when the user chooses delete from the grid context menu or the action column.
     */
    deleteMenuColumnHandler: function (item, eventData) {
        var grid = eventData.grid,
            record = eventData.record;
        this.deleteEntity(record,grid);
    },

    /**
     * @private
     * The function to execute when the deleting a specific record from the grid;
     * This is the beginning of the delete  process not the end.      
     * Subclasses should NOT override this method with their own behavior. They should override the doDelete()
     */
    deleteEntity: function (record, grid) {
        var me = this,
            itemsToDelete;

        if (me.deleteInProgress) {
            return;
        }

        if (me.fireEvent('beforedelete', me) !== false) {

            if (grid.multiSelect) {
                itemsToDelete = grid.getSelectionModel().getSelection();
            } else {
                itemsToDelete = record;
            }
            me.onDelete(itemsToDelete);
            me.fireEvent('delete', me);
            me.doDelete(itemsToDelete, grid);
        }
    },

    /**
    *  Template method called just before the save event is fired;
    */
    onDelete: Ext.emptyFn,

    /**
     * @cfg doSave
     * The function to execute the persistance code if needed;  
     * Subclasses should override this method with their own behavior. 
     * Be sure to call the "saveSuccess(data)" method with the new data as an argument when the save process is complete;
     */
    doDelete: function (record, grid) {
        var me = this,
            data = null;
        // select next item, next || last
        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: me.deletePromptMsg,
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    me.deleteInProgress = true;
                    var store = grid.getStore();
                    grid.setLoading(true);
                    store.remove(record);
                    store.sync({
                        success: me.deleteSuccess,
                        failure: me.deleteFailure,
                        scope:me
                    });
                }
            }
        });
    },

    /**
    * Callback method that announces when a deleted record has been successfuly deleted;    
    * @param  {mixed} data the data that was saved. Could be record, string, object, array. Optional, but strongly recommended; If data not passed the method will attempt to pull the data from a child form;
    */
    deleteSuccess: function (data) {
        var me = this;

        me.deleteInProgress = false;
        me.onDeleteSuccess(data);
        me.fireEvent('deletesuccess', me, data);
        me.setLoading(false);
    },
    
    /**
    *  Template method called just before the deletesuccess event is fired; 
    */
    //onDeleteSuccess: Ext.emptyFn,
    onDeleteSuccess: function (data) {
       // this.gridPager.doRefresh();
    },

    /**
    * Callback method that announces failure while deleting    
    * @param  {mixed} data the data that was deleted;
    */
    deleteFailure: function (m) {
        var me = this;

        me.deleteInProgress = false;
        me.onDeleteFailure(arguments);
        me.fireEvent('deletefailure', me, arguments);

        me.store.reload();
        me.setLoading(false);
        var text = "Unknown error.";
        if (m.exceptions && Taco.core.util.ExceptionWhiner.wasHandled(m.exceptions)) {
            return;
        }
        if (m.exceptions) {
            text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
        }

        Taco.app.fireEvent('setmessage', text, 'error');
    },

    onDeleteFailure: Ext.emptyFn
});