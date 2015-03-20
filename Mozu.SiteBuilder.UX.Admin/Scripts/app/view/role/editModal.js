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

        me.behaviorCatGridCategoryStore = Ext.create('Taco.store.BehaviorCategories', {});
        me.behaviorCatGridCategoryRoleStore = Ext.create('Taco.store.BehaviorCategoryRoles', {
            filters: [
            {
                property: 'id',
                value: 1,
                comparison: 'eq'
            }]
        });

        me.selectedItemStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'parentId', 'parentName', 'name'],
            groupField: 'parentName',
            queryMode: 'local'
        });

        me.behaviorCatGridCategoryStore.load();

        me.behaviorCatGridCategoryRoleStore.on('load', function (it) {
            var recsToSelect = [];
            var category = this.catGrid.getSelectionModel().getSelection()[0];
            var selectedRecs = this.selectedItemStore.getGroups(category.get('name'));
            if (selectedRecs) {
                selectedRecs.children.forEach(function (rec) {                  
                    var index = this.behaviorCatGridCategoryRoleStore.find('id', rec.get('id'));
                    if (index != -1) {
                        recsToSelect.push(this.behaviorCatGridCategoryRoleStore.getAt(index));
                    }  
                }, this);
                if (recsToSelect.length > 0) {
                    this.selModel.select(recsToSelect);
                }
                
            } 
        }, me);

        me.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: "MULTI",
            headerWidth: 37,
            listeners: {
                select: function (it, selected) {
                    var category = this.scope.catGrid.getSelectionModel().getSelection()[0];
                    this.scope.selectedItemStore.add({ id: selected.get('id'), parentId: category.get('id'), parentName: category.get('name'), name: selected.get('name') });
                },
                deselect: function (it, selected) {
                    var record = this.scope.selectedItemStore.find('id', selected.get('id'));
                    this.scope.selectedItemStore.removeAt(record);
                }
            },
            scope: me
        });

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
            selModel: me.selModel,
            viewConfig: {
                deferEmptyText: false
            },
            emptyText: 'Please select a category'
        });

        me.selectedItemsGrid = Ext.create('Ext.grid.Panel', {
            store: me.selectedItemStore,
            height: 400,
            width: 300,
            columns: [{
                dataIndex: "name",
                hideable: false,
                flex: 1
            }],
            features: [{
                ftype: 'grouping', groupHeaderTpl: '{name}'
            }]
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
                                me.selectedItemsGrid
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
    createRole: function () {
        var roleBehaviors = [];
        var name = this.form.getValues().name;

        Ext.Ajax.request({
            url: '/admin/app/roles/create',
            jsonData: {
                id: 0,
                name: name,
                isEditable: false
            },
            success: function (response) {
                var res = Ext.JSON.decode(response.responseText);
                if (res.success) {
                    this.selectedItemStore.each(function (rec) {
                        var item = {
                            id: rec.get('id'),
                            roleId: res.items.id,//get this from the first ajax response
                            name: rec.get('name'),
                            checked: true
                        };
                        roleBehaviors.push(item);
                    });

                    Ext.Ajax.request({
                        url: '/admin/app/rolebehaviors/edit',
                        jsonData: roleBehaviors,
                        success: function (response) {
                            var res = Ext.JSON.decode(response.responseText);
                            if (res.success) {
                                Taco.app.fireEvent('RoleSaved');
                                Ext.ComponentQuery.query('window[title="Create Role"]')[0].close();
                            } else {
                                Taco.MessageBox.alert('Error', 'There was a problem creating a role: ' + res.message);
                            }
                        }
                    }, this);
                } else {
                    Taco.MessageBox.alert('Error', 'There was a problem creating a role: ' + res.message);
                }
            },
            scope: this
        }, this);
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
