Ext.define('Taco.core.ux.form.FullEditor', {
    //extend: 'Taco.core.ux.content.Container',
    extend: 'Ext.panel.Panel',
    requires: ['Taco.core.ux.plugins.NextPrevious'],
    mixins: {
        editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },

    alias: 'widget.fulleditor',

    enableNavHeader: true,

    autoTitle :true,
    
    showIndexOnCancel: true,

    showIndexOnDestroy :true,

    autoScroll: true,
        
    enableNextPrevious: false,

    // This is long standing behavior for this class, but is undesireable when your editing unpersisted data. 
    // use case. edit record and save dialog (not persisted yet) edit again and cancel. When this is true, the first edit is canceled as well. 
    rejectRecordOnCancel : true,

    initComponent: function () {
        var me = this
        
        this.cls = this.cls || "";
        this.cls += " taco-fulleditor ";

        

        if (this.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        }
        

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableNextPrevious == true) {
            this.plugins = this.plugins || [];

            var nextPreviousConfig = Ext.applyIf(this.nextPreviousCfg, {
                ptype: "nextprevious",
                enableNextPrevious: this.enableNextPrevious
            })
            

            this.plugins.push(nextPreviousConfig);
        };
        


        this.mixins.editorwrapper.constructor.call(this, {});

        
        var model = this.record ? Ext.ModelManager.getModel(this.record.modelName) : null;
        this.initWrapper();
        

        // if the view is loaded after a call to duplicate, this allows for any ui specific behavior to be added;
        // note that any data manipulation is performmed in the optional record.beforeDuplicate() 
        if (me.isDuplicate) {
            // make the record dirty so it can be saved without modification;
            me.record.setDirty(true);
            if (me.afterDuplicate) {
                me.afterDuplicate();
            }
        }

        this.callParent(arguments);
        
        if (model && !model.allowUpdate()) {


            this.form.getForm().getFields().each( function (field) {
                if (field.setReadOnly) {
                    field.setReadOnly(true);
                }
            });
        
        }

        

        this.on('idchange', function(editor, record) {
            // Don't navigate if the record has yet to be persisted
            if (record.phantom) return;

            me.onCreateSuccess(editor, record);

            //Taco.app.contentView.remove(editor);
            
            //// save after a create. navigate to the edit view;
            //Taco.core.StateManager.attemptNavigate(me.getEditRoute() + '/' + record.getId(), { record: record });
            

            
        }, this, { delay: 10, single: true, scope: this });
        
        this.on('cancel', function (editor) {
            if (editor.rejectRecordOnCancel && editor.record) {
                editor.record.reject();
            }
            if (this.showIndexOnCancel) {
                Ext.defer(function () {
                    return Taco.core.StateManager.attemptNavigate(me.getIndexRoute());
                }, 10);
            }

        }, this, { single: true, scope: this });
        
        this.on('destroyrecord', function (editor, records, operation) {
            if (this.showIndexOnDestroy)
            {
                Taco.core.StateManager.attemptNavigate(me.getIndexViewName());
            }
            
        }, this, { delay: 10, single: true, scope: this });
    },

    onCreateSuccess: function (editor, record) {
        var me = this;
        
        Taco.app.contentView.remove(editor);

        // save after a create. navigate to the edit view;
        Taco.core.StateManager.attemptNavigate(me.getEditRoute() + '/' + record.getId(), { record: record });
    },


    getIndexRoute:function () {
        return Taco.core.StateManager.getCurrentState().metaData.controller + '/index';
    },

    getEditRoute: function () {
        return Taco.core.StateManager.getCurrentState().metaData.controller + '/edit';
    },

    doSave: function () {
        
        if (this.form && this.form.save) {
            this.form.save();
        } else {
            console.log("Warning: this class expects a doSave method if there is no form defined;")
        }
    }    
});