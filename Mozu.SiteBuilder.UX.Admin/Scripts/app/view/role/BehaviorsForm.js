/**
 * @class Taco.view.role.BehaviorsForm
 * Behaviors Form Tree
 */

Ext.define('Taco.view.role.BehaviorsForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.Behaviors'],
    roleId: 0,

    initComponent: function () {
        this.store = Ext.create('Taco.store.Behaviors', {
            filters: [{
                property: 'roleId',
                value: this.roleId
            }]
        });
        this.stores = [this.store];
        this.buildFormComponents();
        this.callParent(arguments);
    },

    buildFormComponents: function () {
        console.log('store',this.store);
        window.st = this.store;
        this.items = [
            Ext.create('Taco.core.ux.TreeList', {
                store: this.store,
                columns: [{
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 1,
                    dataIndex: 'name'
                }, {
                    text: 'cls',
                    dataIndex: 'cls'
                }]
            })
        ];
    }
})