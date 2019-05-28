/**
 * @class Taco.view.website.misc.VariationRowEditable
 * Grid Mixin that provides custom row editing capability
 * add this to the initComponent of your grid to initilize this mixin
  
  // to include this mixin in your class:

        mixins: {
            rowEditable: 'Taco.view.website.misc.VariationRowEditable'
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

Ext.define('Taco.view.website.misc.VariationRowEditable', {

    requires: [
        'Taco.core.util.ExceptionWhiner'
    ],

    // turns on the row editor behavior of the grid;  Create button will create new record and show the rowEditor;  click on the row will show the editor
    enableRowEditing: false,

    // subclass can specify what the data should be by default when doing a create via the rowEditor
    defaultRowEditingData: null,

    constructor: function () {
        var me = this;

        if (this.enableRowEditing) {
            // update the button text to be "Save"
            Ext.grid.RowEditor.prototype.saveBtnText = "Save";

            this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToMoveEditor: 1,
                clicksToEdit: 1,
                autoCancel: true,
                errorSummary: false,
                listeners: {
                    'edit': {
                        fn: me.onRowEditorSave,
                        scope: this
                    },
                    'canceledit': {
                        fn: me.onRowEditorCancel,
                        scope: this
                    }

                }
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

    onRowValidatEdit: function (editor, context, opts) {
        var record = context.record;
        var name = context.newValues.name;
        var me = this;

        var isEmpty = (name.trim().length === 0);

        function beforeRowUpdate(editor, store) {
            var containsSameName = store.findBy(function (r, idx) {
                if (r.get('name') === name
                    && r.get('id') !== record.get('id')) {
                    return true;
                }
            });

            if (containsSameName !== -1 || isEmpty) {
                return false;
            }
        };

        if (beforeRowUpdate(this.rowEditor, this.store) === false) {
            Taco.app.fireEvent('setmessage', 'Variation must be unique', 'error');
            opts.cancel = true;
            return false;
        }

        return true;
    },



    onRowEditorSave: function (editor, context, opts) {
        var record = context.record;
        var name = context.newValues.name;
        var me = this;



        var isEmpty = (name.trim().length === 0);

        function beforeRowUpdate(editor, store) {
            var containsSameName = store.findBy(function (r, idx) {
                if (r.get('name') === name
                    && r.get('id') !== record.get('id')) {
                    return true;
                }
            });

            if (containsSameName !== -1 || isEmpty) {
                return false;
            }
        };

        if (beforeRowUpdate(this.rowEditor, this.store) === false) {
            this.rowEditor.startEdit(record, 0);
            this.rowEditor.editor.focusContextCell();
            Taco.app.fireEvent('setmessage', 'Variation must be unique', 'error');
            return;
        }

        if (record._newVariation) {
            var dataCopy = Object.assign({}, this.store.originalDocument.data);

            var properties = [
                'documentTypeFQN',
                'listFQN',
                'entityType',
                'listFlags',
                'properties',
                'publishState',
            ];

            Ext.Array.forEach(properties, function (propName) {
                var prop = dataCopy[propName];
                if (prop) {
                    if (typeof prop === 'object') {
                        record.set(propName, Object.assign({}, prop));
                    } else {
                        record.set(propName, prop);
                    }
                }
            });

            record.set('parentId', dataCopy['parentId'] || dataCopy.id);

            //Find better way to do this. 
            //We do not have PArtent Id in Store if no items exists
            if (!record.get('id')) {
                record.set('id', dataCopy.id + '-1');
            }

            //temp for boken recs

        }

        record.set('entityType', 'cms');

        me.setLoading(true);

        editor.view.refreshView();
        record.save({
            success: function (record, operation) {
                Taco.app.fireEvent('setmessage', 'Variation Saved', 'success');
                var variationStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityVariations');

                if (variationStore.getAt(0)._newVariation) {
                    variationStore.fireEvent('setNewVariation', record.get('id'));
                    variationStore.getAt(0)._newVariation = false;
                }

                me.getSelectionModel().deselectAll();
                me.setLoading(false);
                //record.commit();
            },
            failure: function (record, operation) {
                //handle failure(s) here     
                Taco.app.fireEvent('setmessage', 'Error saving variation', 'error');
                //Remove Record Last record From Store and Deselect EditorRow
                me.rowEditor.startEdit(0, 0);
                me.setLoading(false);
            }
        });


    },

    onRowEditorCancel: function (editor, context, opts) {
        var record = context.record,
            isNewRecord = record._newVariation,
            isNewDuplicateRecord = record._isDuplicate;
        // clear unpersisted new records when the user its the cancel button;
        if (isNewRecord || isNewDuplicateRecord) {
            this.store.remove(record);
            if (this.store.getCount() && this.getSelectionModel()) {
                this.getSelectionModel().deselectAll();
            }
            this.view.refreshView();
        }

        if (record.raw && record.raw.name) {
            record.set('name', record.raw.name);
        }
    },

    beforeRowCreate: function (editor, store) {
        var maxVariationsAllowed = 20;
        if (store.getCount() >= maxVariationsAllowed) {
            return false;
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
        this.rowEditor.startEdit(r, 0);
        this.rowEditor.editor.focusContextCell();
    }
});