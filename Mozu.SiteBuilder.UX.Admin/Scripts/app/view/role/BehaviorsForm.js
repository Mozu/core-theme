/**
 * @class Taco.view.role.BehaviorsForm
 * Behaviors Form Tree
 */

Ext.define('Taco.view.role.BehaviorsForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.Behaviors'],
    layout: {
        type: 'fit',
        align: 'stretch'
    },
    flex:1,
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

    addSaveTasks: function (tasks) {
        var record = this.record;
        var store = this.store;
        tasks.add([{
            key: 'sync-behavior-store',
            store: this.store,
            dependencies: 'update-fk-store',
        }, {
            key: 'update-fk-store',
            updateForeignKey: 'roleId',
            record: this.record,
            store: this.store,
            dependencies: 'save-record'
        }]);

        return tasks;
    },

    buildFormComponents: function () {
        this.items = [
            Ext.create('Taco.core.ux.TreeList', {
                enableRowReorder: false,
                disableSelection: true,
                store: this.store,
                columns: [{
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 1,
                    dataIndex: 'name'
                }]
            })
        ];
    }
})