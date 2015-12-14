/**
 * @class  Taco.view.customSchema.Edit
 */

Ext.define('Taco.view.customSchema.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
    ],
    enableSearchBarInHeader: false,
    formCfg: {
        editMode: 'raw'
    },
    formCls: 'Taco.view.customSchema.DynamicFormContainer',
    initComponent: function () {
    	var me = this;

        if (!this.record) {
            console.warn('A record is required for this view');
            return false;
        }

        this.editMode = 'raw';

        this.parentTitleCfg = {
            title: this.record.get('listFQN'),
            controller: this.getBreadcrumbRoute()
        };

        this.callParent(arguments);

    	this.setTitle(this.record.get('name'));
    },

    saveSuccess: function() {
        Taco.app.fireEvent('setmessage', 'Save Success', 'success');
    },

    getBreadcrumbRoute: function() {
        var type = this.record.get('entityType') === 'cms' ? 'documents' : 'entities'
        var list = this.record.get('listFQN');
        return 'customschema/' + type + '/' + list;
    },

    cancel: function() {
        Taco.core.StateManager.attemptNavigate(this.getBreadcrumbRoute());
    }
});

       