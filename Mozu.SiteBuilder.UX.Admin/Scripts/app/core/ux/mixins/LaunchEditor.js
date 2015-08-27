/**
 * @class Taco.core.ux.mixins.LaunchEditor 
 * View Mixin that provides the ability to automatically launch the editor when the user cts an item in the grid
 * to include this mixin in your class:

        mixins: {
            launcheditor: 'Taco.core.ux.mixins.LaunchEditor'
        },


  
    < ... code fragment ... >

        initComponent: function (){

            if (this.launchEditorOnClick) {
                //initialize the content navigation toolbar.
                this.mixins.launcheditor.constructor.apply(this);
            }

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.LaunchEditor', {
    requires: [],
    
    modelName: null,

    // forces a new record to be fetched before loading the editor;
    reFetchRecordOnEdit: false,

    constructor: function () {
        var me = this
        if (!me.modelName) {
            throw ("Configuration Error: modelName is a required configuration member. Example: modelName: Taco.model.YourModelHere");
            return;
        };

        if (this.launchEditorOnClick) {
            // treat enter key as a click;
            me.mon(me, 'itemkeydown', function (view, record, item, index, e, eOpts) {
                var metaData = null;
                if (e.getKey() == e.ENTER && !me.enableRowEditing) {                    
                    me.launchEditor(record, metaData);
                }
            }, me);

            me.mon(me, 'cellclick', this.onCellClick, me)
        }
    },

    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {        
        var metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);
        if (!header) {
            return;
        }
        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
            e.preventDefault();
            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }
            this.launchEditor(record, metaData);
        }
    },

    launchEditor: function (record, options) {        
        var me = this,
            modelClass = Ext.ClassManager.get(me.modelName);
        if (Ext.isString(record)) {
            modelClass.load(record, {
                success: function (model) {
                    me.launchLoadedEditor(model, options);
                }
            });
            return;
        }
        me.launchLoadedEditor(record, options);
    },

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };
        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), complexMetaData);
        }, 1, this);
    },

    editMenuColumnHandler: function (item, eventData) {
        var record = eventData.record,
            metaData = { id: record.getId() };

        this.launchEditor(record, metaData);
    }
});