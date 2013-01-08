/**
 * @class Taco.view.role.BehaviorsForm
 * Behaviors Form Tree
 */

Ext.define('Taco.view.role.BehaviorsForm', {
    extend: 'Taco.core.ux.form.Form',

    initComponent: function () {
        this.store = Ext.create('Taco.store.Behaviors');
        this.buildFormComponents();
        this.callParent(arguments);
    },

    buildFormComponents: function () {
        this.items = [
            Ext.create('Taco.core.ux.TreeList', {
                store: this.store,
                columns: [{
                    name: 'treecolumn',
                    text: 'Name',
                    flex: 1,
                    dataIndex: 'name'
                }]
            })
        ];
    }
})