/**
 * @class  Taco.view.account.Roles
 * The Roles grid view
 */

Ext.define('Taco.view.role.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
    requires: ['Taco.model.Role', 'Taco.store.Roles', 'Taco.view.role.EditModal'],
    modelName: 'Taco.model.Role',
    store: { type: 'Taco.store.Roles' },
    editorName: 'Taco.view.role.Edit',

    enableNavHeader: true,

    enableSearch: false,

    enableSearchBarInHeader: false,

    addContentViewPadding: true,

    createButtonText: 'Create New Role',

    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    title: 'Roles',

    stateful: true,
    stateId: 'statefulRolesGrid',

    initComponent: function () {
        var me = this;
        me.canCreateRole = false;
        me.canUpdateRole = false;
        me.canDeleteRole = false;

        Taco.user.behaviors.forEach(function (behavior) {
            if (behavior == 29) {
                me.canCreateRole = true;
            };

            if (behavior == 30) {
                me.canUpdateRole = true;
            };

            if (behavior == 31) {
                me.canDeleteRole = true;
            };
        });
        me.createButtonCfg = {
            disabled: !me.canCreateRole
        };

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

        this.store = Ext.create('Taco.store.Roles', {
            autoLoad: true
        });
        
        this.columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: "name",
                text: 'Role Name',
                flex: 1,
                renderer: function(value, metaData, record) {

                    if (record.get('isEditable')) {
                        return '<a href="#" class="taco-launch-editor">' + value + '</a>';
                    } else {
                        return value;
                    }
                }
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'isEditable',
                stateId: "isEditable",
                text: 'Role Type',
                flex: 1,
                renderer: function(value, metaData, record) {

                    if (record.get('isEditable')) {
                        return 'Custom Role';
                    } else {
                        return 'System Role';
                    }
                }
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                scope: me,
                items: [
                    {
                        text: 'flerp'
                    }
                ],
                getMenu: function (eventData) {
                    var record = eventData.record;
                    return this.up().grid.scope.getContextMenu(record);
                },
                handler: function (grid, foo, bar, snerst, evt, record, row) {
                    this.launchContextMenu(evt, record, row);
                }
            }
        ];
        
        this.callParent(arguments);

        Taco.app.on({
            RoleSaved: function () {
                this.store.load();
            },
            scope: me
        });

       
    },
    getContextMenu: function (record) {
        //Generates the context menu to be shown
        var actions;
        var me = this;
        var grid = me.down('gridview');

        if (!record.get('isEditable')) {
            actions = [
                {
                    text: 'View',
                    handler: function (item, event) {
                        var rec = grid.getSelectionModel().getSelection()[0];

                        me.launchEditor(rec, 'view');
                    },
                    scope: me
                },
                {
                    text: 'Duplicate',
                    handler: function (item, event) {
                        var rec = grid.getSelectionModel().getSelection()[0];
                        me.launchEditor(rec, 'dup');
                    },
                    scope: me
                }
            ];
        } else {
            actions = [
                {
                    text: 'Edit',
                    disabled: !me.canUpdateRole,
                    handler: function (item, event) {
                        var rec = grid.getSelectionModel().getSelection()[0];
                        me.launchEditor(rec, 'edit');
                    },
                    scope: me
                },
                {
                    text: 'Duplicate',
                    disabled: !me.canUpdateRole,
                    handler: function (item, event) {
                        var rec = grid.getSelectionModel().getSelection()[0];
                        me.launchEditor(rec, 'dup');
                    },
                    scope: me
                },
                {
                    text: 'Delete',
                    disabled: !me.canDeleteRole,
                    handler: function (item, event) {
                        var rec = grid.getSelectionModel().getSelection()[0];
                        me.deleteRecord(rec, event);
                    },
                    scope: me
                }
            ];
        };

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

        return menu;
    },
    launchContextMenu: function(evt, record, row) {
        var me = this;
        var menu = me.getContextMenu(record);

        if (row) {
            menu.showBy(row, 'tr-br', [-1, -1]);
        } else {
            menu.showAt(evt.getXY());
        }
    },
    deleteRecord: function (rec, event) {
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
                    rec.destroy({
                        failure: function(rec, data) {
                            if (data.error && data.error.status) {
                                if (data.error.status === 500) {
                                    var msg = 'Role is currently in use';
                                    Taco.app.fireEvent('setmessage', msg, 'error');
                                }
                            }
                        }
                    });
                }
            }
        });
    },
    getActionEvents: function() {
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
    doCreate: function() {
        this.launchEditor(null, 'create');
    },
    onDeleteRole: function (view, index, idx, action, e, record) {
    }
});