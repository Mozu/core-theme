/**
 * @class Taco.view.role.BehaviorsForm
 * Behaviors Form Tree
 */

Ext.define('Taco.view.role.BehaviorsForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.Behaviors'],

    layout: {
        type: 'auto'
        //  align: 'stretch'
    },
    flex: 1,
    initComponent: function () {
        this.store = Ext.create('Taco.store.Behaviors', {
            nodeParam: 'roleId',
            defaultRootId: this.roleId
        });
        this.stores = [this.store];

        this.buildFormComponents();
        this.callParent(arguments);


    },

    addSaveTasks: function (tasks) {
        var record = this.record;
        var store = this.store;
        tasks.add([{
            
            store: this.store,
            dependencyFilter: function  ( task ){
                return !!task.bing;
            }
            
        }, {
            fn: function (task) {
                var id = record.getId();
                Ext.each(store.getModifiedRecords(),function  ( storeRecord ){
                    storeRecord.set('roleId', id);
                });
                task.callback();
            },
            bing: true,
            dependencyFilter: function (task) {
                return task.saveRecord == record;
            }
            
        }]);

        return tasks;
    },

    buildFormComponents: function () {
        this.items = [
            Ext.create('Taco.core.ux.TreeList', {
                enableRowReorder: false,
                disableSelection: true,
                flex: 1,
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
});