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

        this.on('idchange', function(editor, record) {
            Taco.app.contentView.remove(editor);
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId(), { record: record });
        }, this, { delay: 10, single: true, scope: this });
        
        if (this.showIndexOnCancel) {
            this.on('cancel', function(editor) {
                if (editor.record) {
                    editor.record.reject();
                }
                Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/index');

            }, this, { delay: 10, single: true, scope: this });
        }
        this.on('destroyrecord', function(editor, records, operation) {
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/index');
        }, this, { delay: 10, single: true, scope: this });
    }
});