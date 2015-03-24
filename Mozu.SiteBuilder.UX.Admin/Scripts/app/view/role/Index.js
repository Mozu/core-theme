/**
 * @class  Taco.view.account.Roles
 * The Roles grid view
 */

Ext.define('Taco.view.role.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: ['Taco.model.Role', 'Taco.store.Roles', 'Taco.view.role.EditModal'],
    modelName: 'Taco.model.Role',
    store: { type: 'Taco.store.Roles' },
    editorName: 'Taco.view.role.Edit',

    // this is the title. 
    typeName: "Role",

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Roles',
            actions: [{
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                itemId: 'createActionButton',
                text: 'Create New Roles',
                margin: '0 0 0 10',
                handler: function () {
                    me.launchEditor('', 'create');
                }
            }]
        };

        if (!this.store) {
            this.store = Ext.create('Taco.store.Roles', {
                autoLoad: true
            });
        }

        this.gridPanelConf = {
         //   store: this.store,
            listeners: {
               // itemclick: this.onItemClick,
                deleterole: this.onDeleteRole,
                scope: this
            },
            layout: 'fit',
            stateful: true,
            stateId: "statefulRolesGrid",
            columns: [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'name',
                    stateId:"name",
                    text: 'Name',
                    flex: 1,
                    renderer: function (value, metaData, record) {

                        if (record.get('isEditable')) {
                            return '<a href="#" class="taco-launch-editor">' + value + '</a>';
                        } else {
                            return value;
                        }
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'isEditable',
                    stateId: "isEditable",
                    text: 'Role Type',
                    flex: 1,
                    renderer: function (value, metaData, record) {

                        if (record.get('isEditable')) {
                            return 'Custom Role';
                        } else {
                            return 'System Role';
                        }
                    }
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    stateId: 'actionsColumn',
                    scope: me,
                    items: [
                    {
                        text: 'flerp'
                    }],
                    handler: function (grid, foo, bar, snerst, evt, record, row) {
                        this.launchContextMenu(evt, record, row);
                    }
                }
            ]
        };
        
        this.callParent(arguments);

        Taco.app.on({
            RoleSaved: function () {
                this.store.load();
            },
            scope: me
        });

       
    },
    launchContextMenu: function(evt, record, row) {
        var actions;
        var me = this;

        if (!record.get('isEditable')) {
            actions = [
                {
                    text: 'View',
                    handler: function (item, event) {
                        me.launchEditor(item.scope.gridPanel.getSelectionModel().getSelection()[0], 'view');
                    },
                    scope: me
                },
                {
                    text: 'Duplicate',
                    handler: function (item, event) {
                        me.launchEditor(item.scope.gridPanel.getSelectionModel().getSelection()[0], 'dup');
                    },
                    scope: me
                }
            ];
        } else {
            actions = [
                {
                    text: 'Edit',
                    handler: function (item, event) {
                        me.launchEditor(item.scope.gridPanel.getSelectionModel().getSelection()[0], 'edit');
                    },
                    scope: me
                },
                {
                    text: 'Duplicate',
                    handler: function (item, event) {
                        me.launchEditor(item.scope.gridPanel.getSelectionModel().getSelection()[0], 'dup');
                    },
                    scope: me
                },
                {
                    text: 'Delete',
                    handler: function (item, event) {
                        me.deleteRecord(item, event);
                    },
                    scope: me
                }
            ];
        }


        var menu = Ext.create('Ext.menu.Menu', {
            showSeparator: false,
            items: actions,
            record: record,
            cls: 'dc-flydown-menu',
            shadow: false,
            plain: true,
            listeners: {
                beforeshow: function (view, eOpts) {
                    me.actionMenuOpen = true;
                },
                beforehide: function (view, eOpts) {
                    me.actionMenuOpen = false;
                }
            }
        });

        if (row) {
            menu.showBy(row, 'tr-br', [-1, -1]);
        } else {
            menu.showAt(evt.getXY());
        }
    },
    deleteRecord: function (item, event) {
        Ext.MessageBox.show({
            title: 'Warning',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this role? Click Ok to proceed.",
            closable: false,
            buttons: Ext.Msg.OKCANCEL,
            fn: function (val) {
                if (val === 'ok') {
                    item.scope.gridPanel.getSelectionModel().getSelection()[0].destroy();
                }
            }
        });
    },
    launchEditor: function (record, action) {
        //This is a work around bc the single click calls launch Editor twice
        //3/24/15 BF
        if (Ext.ComponentQuery.query('window[title*="Role"]').length == 0) {
            switch (action) {
                case 'create':
                case 'dup':
                case 'edit':
                case 'view':
                    break;
                default:
                    //catches the single click to edit stuff
                    if (record.get('isEditable')) {
                        action = 'edit';
                    } else {
                        action = 'view';
                    }
                    break;
            }
            var editor = Ext.create('Taco.view.role.EditModal', {
                record: record,
                action: action
            });
            editor.show();
        }
    },
    onDeleteRole: function (view, index, idx, action, e, record) {
    },
});