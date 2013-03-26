Ext.define('Taco.core.ux.form.FullEditor', {
    extend: 'Taco.core.ux.content.Container',
    mixins: {
        editorwrapper: 'Taco.core.ux.form.EditorWrapper'
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.editorwrapper.constructor.call(this, config);
    },

    initComponent: function() {


        this.initWrapper();

        this.body = {
            layout: 'fit',
            items: [this.form]
        };

        this.header = {
            actions: this.actions,
            title: this.title
        };

        this.callParent(arguments);
        this.on('idchange', function(editor, record) {
            Taco.app.contentView.remove(editor);
            Taco.core.StateManager.attemptNavigate(Taco.core.StateManager.getCurrentState().metaData.controller + '/edit/' + record.getId());
        }, this, { delay: 10, single: true, scope: this });
    }
});