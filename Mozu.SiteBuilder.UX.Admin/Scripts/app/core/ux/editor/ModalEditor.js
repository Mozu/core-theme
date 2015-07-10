
/**
 * @class Taco.core.ux.editor.Modal
 * Base class for a generic editor modal
 * Expects to be passed in an editor form panel that encapsolates all of the logic for creating and editing an entity
 * The Modal is equivalent to the Taco.core.ux.form.FullEditor class and should be interchangeable. Its purpose is to allow in context creation and editing of an entity.
 */

// TODO: Try align this class with the FullEditor class. Potentially by utilizing the same mixins with those mixins being agnostic to the view that contains them.

// todo: investigate trying to add navform2 and tabForm into this class;

Ext.define('Taco.core.ux.editor.ModalEditor', {
    //extend: 'Taco.core.ux.window.Modal',
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        //*****  make sure the subclass includes a requires item for the model ******;
    ],
    
    width: "95%",
    height:"95%",

    closeAction: 'destroy',

    // disable the default actions bar added for the modal base class. the form panel will be providing its own save and cancel actions
    showActionsBar : true,

    autoShow: true,

    closable: true,
    
    title: 'Loading...',

    createTitleTpl: new Ext.XTemplate('Create'),

    editTitleTpl: new Ext.XTemplate('Edit'),

    scale: 'large',

    config: {

        //Required
        modelName: null,

        // if not provided (or via the record), modal will default to create;
        entityId: null,

        // optional. Only used to get the id of the record. Linkage to the view that opens the editor should be through the events fired after the modal closes
        record: null
    },
    
    layout : {
        type: 'fit'
    },

    header:false,

    initComponent: function (eOpts) {
        var me = this;

        this.cls = this.cls || "";
        this.cls += " taco-modaleditor ";

        // todo: bring in the mixins from the FullEditor class to enable "next/previous" "duplicate" "permissions" "navheader (will need to modify)"

        this.callParent(arguments);
    },

    onEsc : Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {
        var me = this;

        this.callParent(arguments);

        if (!this.record) {
            this.loadRecord();
        } else {
            this.onLoadRecord();
        }
    },
    
    /**
     * Call the service to reload the data.
     */
    reloadData: function () {
        this.loadRecord();
    },

    /**
     * Call the service and get an updated record.
     */
    loadRecord: function () {
        var me = this,
            entityId = me.record ? me.record.getId() : me.entityId,
            model = Ext.ModelManager.getModel(me.modelName);
        
        if (!model) {
            throw ("this.modelName is either invalid or not added to the requires of the calling class");
            return;
        }

        var mask = me.setLoading({
            msg: "Loading"
        }, me.body);
        
        if (!entityId) {
            // create entity
            me.record = Ext.create(me.modelName, {
                
            });

            me.onLoadRecord();
        } else {
            //Edit entity
            model.load(entityId, {
                failure: function (record, operation) {
                    Taco.app.fireEvent('setmessage', "Error loading", 'error');
                    me.setLoading(false, this.body);
                },
                success: function (record, operation) {
                    me.record = record;
                    me.entityId = record.getId();
                    me.onLoadRecord();
                },
                callback: function (record, operation) {
                    //do something whether the load succeeded or failed
                }
            });
        }
    },
    
    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord : function() {
        var me = this;
        // had to move this to the top so it doesn't cause the body to scroll after the focus El is scrolled into view;

        var titleTpl = (me.record.phantom) ? me.createTitleTpl : me.editTitleTpl;
        
        me.setTitle(titleTpl.apply(me.record.data));

        this.updateUi();

        this.setLoading(false, this.body);
    },
    
    // reloads the ui using new data
    updateUi: function () {
        var me = this;

        this.editView = Ext.create(me.editCls, {
            isModalWrapper: true,
            showIndexOnCancel: false,
            showIndexOnDestroy: false,
            enableWindowCloseButton: true,
            record: me.record,
            saveButtonVisible: true,
            cancelButtonVisible: true
        });

        this.mon(this.editView, 'aftersave', function (view,record, idEdit) {
            this.saveSuccess(record);
        }, this);
        this.mon(this.editView, 'cancel', this.close, this);
        this.add(this.editView);
    },

    
    initUi: function () {
        
    },

    //onAfterSave: function () {
    

    //    this.saveSuccess();
    //},


    //onCancel: function () {
    //    this.close();
    //},

    doSave: function () {
        var me = this;
        this.editView.save();
    },

    //onBeforeSave: Ext.emptyFn,

    //onBeforeCancel: Ext.emptyFn,
    
    constrainResizer: function () {
        var cfg = {},
            region = Ext.getBody().getRegion();

        Ext.apply(cfg, this.resizable, {
            constrainTo: region
        });

        this.resizable = cfg;
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
