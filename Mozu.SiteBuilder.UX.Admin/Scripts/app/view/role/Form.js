/**
 * @class  Taco.view.account.RoleForm
 * Role form
 */

Ext.define('Taco.view.role.Form', {
    extend: 'Taco.core.ux.form.Form',

    editTitle: 'Edit Role Bitch',
    createTitle: 'Create a Role, Bitch',

    initComponent: function () {

        this.stores = Ext.create('Taco.store.Behaviors');

        this.buildFormComponents();

        this.callParent(arguments);

        this.loadStore();
    },

    buildFormComponents: function () {
        this.items = [{
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeperator: '',
            width: 250,
            name: 'name'
        }];
    },

    loadStore: function () {
        var fnCleanupLoad,
            store = this.stores[0];


    }
});