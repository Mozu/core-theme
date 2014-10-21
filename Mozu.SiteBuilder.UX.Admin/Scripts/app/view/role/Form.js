/**
 * @class  Taco.view.account.RoleForm
 * Role form
 */

Ext.define('Taco.view.role.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires:['Taco.view.role.BehaviorsForm'],
    editTitle: 'Edit Role',
    createTitle: 'Create a Role',
    //layout: {
    //    type: 'auto'
    //},
    initComponent: function () {

        this.height = (Ext.getBody().getBox().height - 201);
        this.buildFormComponents();

        this.callParent(arguments);
    },

    buildFormComponents: function () {
        this.behaviorsForm = Ext.create('Taco.view.role.BehaviorsForm', {
            roleId: (this.record && this.isEdit()) ? this.record.getId() : -1
        });

        this.items = [{
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            width: 250,
            allowOnlyWhitespace: false,
            name: 'name',
            fieldLabel: 'Name',
            emptyText: 'Enter a role name'
        }, this.behaviorsForm];
    }
});