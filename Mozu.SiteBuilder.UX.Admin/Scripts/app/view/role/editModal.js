/**
 * @class Taco.view.role.EditModal
 */

Ext.define('Taco.view.role.EditModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.store.BehaviorCategories',
        'Taco.store.BehaviorCategoryRoles'
    ],
    autoShow: true,
    scale: 'large',
    title: 'Create Role',
    width: 1000,
    height: 680,
    actions: [{
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction'
    }],
    initComponent: function () {

        var me = this;
        this.roleid = 10;

        me.behaviorCatGridCategoryStore = Ext.create('Taco.store.BehaviorCategories', {});
        me.behaviorCatGridCategoryRoleStore = Ext.create('Taco.store.BehaviorCategoryRoles', {
            filters: [
            {
                property: 'id',
                value: 1,
                comparison: 'eq'
            }]
        });
        //me.behaviorCatGridCategoryRoleStore.load();

        me.behaviorCatGridCategoryStore.load();

        me.catGrid = Ext.create('Ext.grid.Panel', {
            store: me.behaviorCatGridCategoryStore,
            height: 400,
            width: 300,
            columns: [
                { text: 'Name', dataIndex: 'name', flex: 1 }
            ],
            selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    select: function (it, rec) {
                        this.scope.updateBehaviorGrid(rec.get('id'));
                    }
                },
                scope: me
            }, me),
            viewConfig: {
                deferEmptyText: false,
                stripeRows: me.showStripedRows
            },
            emptyText: 'There are no categories'
        });

        me.nameGrid = Ext.create('Ext.grid.Panel', {
            store: me.behaviorCatGridCategoryRoleStore,
            height: 400,
            width: 300,
            columns: [
                { text: 'Name', dataIndex: 'name', flex: 1 }
            ],
            selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    select: function (it, rec) {
                        //this.scope.updateBehaviorGrid(rec.get('id'));
                    }
                },
                scope: me
            }, me),
            viewConfig: {
                deferEmptyText: false
            },
            emptyText: 'Please select a category'
        });

        me.selectedGrid = Ext.create('Ext.grid.Panel', {
            store: me.behaviorCatGridCategoryStore,
            height: 400,
            width: 300,
            columns: [
                { text: 'Name', dataIndex: 'id', flex: 1 }
            ],
            selModel: Ext.create('Ext.selection.RowModel', {
                listeners: {
                    select: function (it, rec) {
                        //this.scope.updateBehaviorGrid(rec.get('id'));
                    }
                },
                scope: me
            }, me),
            viewConfig: {
                deferEmptyText: false,
                stripeRows: me.showStripedRows
            },
            emptyText: 'No items selected'
        });
        me.form = Ext.create('Ext.form.Panel', {
            flex: 1,
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    width: 400,
                    fieldLabel: 'Name',
                    allowBlank: false
                },
                {
                    xtype: 'panel',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'container',
                            padding: '10 10 10 0',
                            items: [
                                {
                                    xtype: 'label',
                                    text: 'Behavior Category',
                                    padding: '10 10 10 0',
                                },
                                me.catGrid
                            ]
                        },
                        {
                            xtype: 'container',
                            padding: '10 10 10 0',
                            items: [
                                {
                                    xtype: 'label',
                                    text: 'Behavior Name',
                                    padding: '10 10 10 0',
                                },
                                me.nameGrid
                            ]
                        },
                        {
                            xtype: 'container',
                            padding: '10 10 10 0',
                            items: [
                                {
                                    xtype: 'label',
                                    text: 'Assigned Behavior',
                                    padding: '10 10 10 0',
                                },
                                me.selectedGrid
                            ]
                        }]
                }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },
    doSave: function () {
        if (this.record) {
            //update rec
            this.updateRole(this.record);
        } else {
            //create invite
            this.createRole();
        }

    },
    updateRole: function(record) {
        console.log('update record');
    },
    createRole: function() {
        console.log('create roll');
    },
    updateBehaviorGrid: function (id) {
        var me = this;
        me.behaviorCatGridCategoryRoleStore.filter([Ext.create('Ext.util.Filter', {
            property: 'id',
            value: Number(id),
            comparison: 'eq'
        })]);
    }
});
