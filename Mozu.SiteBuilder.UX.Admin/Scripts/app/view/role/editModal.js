/**
 * @class Taco.view.role.EditModal
 */

Ext.define('Taco.view.role.EditModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
    ],

    autoShow: true,
    scale: 'large',
    title: 'Edit Role',

    initComponent: function () {
        var me = this;

        me.behaviorCatGridCategoryStore = Ext.create('Taco.store.Behaviors', {
            nodeParam: 'roleId',
            defaultRootId: this.roleId
        });
        
        me.behaviorCatGrid = Ext.create('Ext.grid.Panel', {
            title: 'Behavior Category',
            store: me.behaviorCatGridCategoryStore,
            height: 500,
            width: 500,
            columns: [
                { text: 'Name', dataIndex: 'id', flex: 1 }
            ]
        });

        me.form = Ext.create('Ext.form.Panel', {
            items: [
            {
                xtype: 'textfield',
                name: 'name',
                flex: 1,
                fieldLabel: 'Name'
            },
            me.behaviorCatGrid,
            Ext.create('Taco.core.ux.TreeList', {
                enableRowReorder: false,
                disableSelection: true,
                flex: 1,
                store: this.behaviorCatGridCategoryStore,
                columns: [{
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 1,
                    dataIndex: 'name'
                }]
            })]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {

    }
});
