Ext.define('Taco.core.ux.form.FullEditor', {
    extend: 'Taco.core.ux.content.Container',

    mixins: {
        editorwrapper: 'Taco.core.ux.form.EditorWrapper'
    },
    
    autoTitle :true,
    bodyLayout: { type: 'auto' },
    showIndexOnCancel: true,

    constructor: function (config) {
        this.callParent(arguments);
        this.mixins.editorwrapper.constructor.call(this, config);
    },
    
    initComponent: function () {
        var model = this.record ? Ext.ModelManager.getModel(this.record.modelName) : null;
        this.initWrapper();

        this.body = {
            layout: this.bodyLayout,
            items: [this.form]
        };

        this.header = {
            actions: this.actions,
            title: this.title
        };

        this.callParent(arguments);
        
        if (model && !model.allowUpdate()) {


            this.form.getForm().getFields().each( function (field) {
                if (field.setReadOnly) {
                    field.setReadOnly(true);
                }
            });
            //setReadOnly(
        }

        this.bindActionsToForm();

        this.on('idchange', function(editor, record) {
            // Don't navigate if the record has yet to be persisted
            if (record.phantom) return;
            Taco.app.contentView.remove(editor);
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), { record: record });
        }, this, { delay: 10, single: true, scope: this });
        
       
        this.on('cancel', function(editor) {
            if (editor.record) {
                editor.record.reject();
            }
            if (this.showIndexOnCancel) {
                Ext.defer(function () {
                    Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/index');
                }, 10);
            }

        }, this, { single: true, scope: this });
        
        this.on('destroyrecord', function(editor, records, operation) {
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/index');
        }, this, { delay: 10, single: true, scope: this });
    },

    bindActionsToForm: function () {
        var actions = this.header.query('[formBind]'),
            form = this.form;
        
        if (form && form.isComponent) {
            form.getForm().getBoundItems().add(actions);
        }
    }
});