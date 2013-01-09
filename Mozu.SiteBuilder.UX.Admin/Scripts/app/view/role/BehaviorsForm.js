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
        console.log('store',this.store);
        window.st = this.store;
        this.items = [
            Ext.create('Taco.core.ux.TreeList', {
                store: this.store,
                columns: [{
                    name: 'treecolumn',
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