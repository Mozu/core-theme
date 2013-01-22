/**
 * @class  Taco.view.account.RoleForm
 * Role form
 */

Ext.define('Taco.view.role.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires:['Taco.view.role.BehaviorsForm'],
    editTitle: 'Edit Role Bitch',
    createTitle: 'Create a Role, Bitch',

    initComponent: function () {

        this.buildFormComponents();

        this.callParent(arguments);
    },

    buildFormComponents: function () {
        if (!this.store) {
            this.store = Ext.create('Taco.view.role.BehaviorsForm', {
                roleId: this.record ? this.record.getId() : null
            });
        }

        this.items = [{
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeperator: '',
            width: 250,
            name: 'name',
            fieldLabel: 'Name',
            emptyText: 'Enter a role name'
        }, this.store];
    }
});