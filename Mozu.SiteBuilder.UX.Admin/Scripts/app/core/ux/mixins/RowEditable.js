/**
 * @class Taco.core.ux.mixins.RowEditable
 * Grid Mixin that provides custom row editing capability
 * add this to the initComponent of your grid to initilize this mixin
  
  // to include this mixin in your class:

        mixins: {
            rowEditable: 'Taco.core.ux.mixins.RowEditable'
        },


  
    < ... code fragment ... >

        initComponent: function (){

            //initialize the grid paging toolbar
            this.mixins.rowEditable.constructor.apply(this);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.RowEditable', {
    
    requires: [
        'Taco.core.util.ExceptionWhiner'
    ],
    
    // turns on the row editor behavior of the grid;  Create button will create new record and show the rowEditor;  click on the row will show the editor
    enableRowEditing: false,

    // optional prevlidation check by subclass before showing the row editor. return false to cancel create;
    beforeRowCreate: Ext.emptyFn,

    // optional prevlidation check by subclass before showing the row editor. return false to cancel update;
    beforeRowUpdate: Ext.emptyFn,

    // subclass can specify what the data should be by default when doing a create via the rowEditor
    defaultRowEditingData: null,

    constructor: function () {
        var me = this;

        if (this.enableRowEditing) {
            // update the button text to be "Save"
            Ext.grid.RowEditor.prototype.saveBtnText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.save;

            this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToMoveEditor: 1,
                clicksToEdit: 1,
                errorSummary: false,
                onCtrlEnterKey: function () {
                    me.onRowEditorCreate();
                },
                listeners: {
                    'beforeedit': {
                        fn: function(cmp, editor) {
                            var newRecords = this.store.getNewRecords();
                            var currentRecord = [editor.record];
                            var difference = Ext.Array.difference(newRecords, currentRecord);

                            if (difference && difference.length > 0) {
                                this.store.remove(difference);
                            } 
                        },
                        scope: this
                    },
                    'edit': {
                        fn: this.onRowEditorUpdate,
                        scope: this
                    },
                    'cancelEdit': {
                        fn: this.onRowEditorCancel,
                        scope: this
                    }

                },
                autoCancel: false
            });

            if (!this.plugins) {
                this.plugins = [];
            } else {
                this.plugins = Ext.clone(this.plugins);
            }
            this.plugins.push(this.rowEditor);
            this.launchEditorOnClick = false;
        }
    },
    
    onRowEditorUpdate: function (editor, context, opts) {
        var record = context.record;

        // check with the rowEditor to see if creation is allowed;
        if (this.beforeRowUpdate(this.rowEditor, this.store) === false) {
            return;
        }

        record.save({
            success: function (record, operation) {
                record.commit();
            },
            failure: function (record, operation) {
                //handle failure(s) here
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_saving_item, 'error');
            }
        });
    },

    onRowEditorCancel: function (editor, context, opts) {
        var record = context.record,
            isNewRecord = record.phantom;
        // clear unpersisted new records when the user its the cancel button;
        if (isNewRecord) {
            this.store.remove(record);            
            if (this.store.getCount() && this.getSelectionModel()) {
                this.getSelectionModel().selectRange(0, 0, false);
            }
            
        }
    },

    onRowEditorCreate: function () {
        this.rowEditor.cancelEdit();

        // check with the rowEditor to see if creation is allowed;
        if (this.beforeRowCreate(this.rowEditor, this.store) === false) {
            return;
        }

        // Create a model instance
        var modelName = this.store.model.getName();
        var r = Ext.create(modelName, this.defaultRowEditingData);
        this.store.insert(0, r);
        this.rowEditor.startEdit(0, 0);
        this.rowEditor.editor.focusContextCell();
    }
});