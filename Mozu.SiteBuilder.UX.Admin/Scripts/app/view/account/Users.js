/**
 * @class Taco.view.account.Users
 */
Ext.define('Taco.view.account.Users', {
    extend: 'Taco.core.ux.browser.SearchListTree',
    requires: [
        'Taco.core.ux.TreeList',
        'Taco.store.AccountUsersTree',
        'Taco.view.account.userFormModal'
    ],
    enableNavHeader: true,

    addContentViewPadding: true,

    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    enablePaging: false,

    enableSearchBarInHeader: false,

    addContentViewPadding: true,

    createButtonText: 'Add User',

    enableSearch: false,

    title: 'Users',

    initComponent: function () {
        var me = this;
        me.canCreateUser = false;
        me.canDeleteUser = false;
        me.canUpdateUser = false;

        Taco.user.behaviors.forEach(function (behavior) {
            if (behavior == 29) {
                me.canCreateUser = true;
            };

            if (behavior == 30) {
                me.canUpdateUser = true;
            };

            if (behavior == 31) {
                me.canDeleteUser = true;
            };

        });

        me.createButtonCfg = {
            disabled: !me.canCreateUser,
            handler: me.launchEditor
        };

        me.store = Ext.create('Taco.store.AccountUsersTree', {
            autoLoad: true
        });

        me.viewConfig = {
            animate: false,
            stripeRows: false,
            onExpand: Ext.emptyFn
        };

        me.columns = [
            {
                xtype: 'treecolumn',
                dataIndex: 'email',
                stateId: "email",
                text: 'Email',
                width: 400
            },
            {
                dataIndex: 'role',
                stateId: "role",
                text: 'Roles',
                width: 200
            },
            {
                dataIndex: 'activity',
                stateId: "activity",
                text: 'Activity',
                flex: 1,
                width: 300
            },
            {
                dataIndex: 'status',
                stateId: "status",
                text: 'Status',
                width: 300
            },
            {
                xtype: 'taco.menucolumn',
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
        ];

        me.moreButtonCfg = {
            scope: this,
            menu: {
                plain: true,
                shadow: false,
                cls: 'taco-ellipsis-split-button',
                items: [
                    {
                        text: 'Expand All',
                        handler: function (menuItem) {
                           this.expandAll()
                        },
                        scope: this
                    },
                    {
                        text: 'Collapse All',
                        handler: function (menuItem) {
                            this.collapseAll()
                        },
                        scope: this
                    }
                ]
            }
        };

        me.callParent(arguments);

        Taco.app.on({
            UserSaved: function (direction) {
                this.store.load();
            },
            scope: me
        });

    },
    launchContextMenu: function (evt, record, row) {

        var actions;
        var me = this;

        if (record.get('leaf')) {

            actions = [
                {
                    text: 'Delete Role',
                    disabled: (record.parentNode.get('status') == 'Pending' || !me.canDeleteUser) ? true : false,
                    handler: function (item, event) {
                        me.deleteRecord(me, item, event);
                    },
                    scope: me
                }
            ];
        } else if (record.get('status') == 'Pending') {
            actions = [
                {
                    text: 'Delete User',
                    disabled: !me.canDeleteUser,
                    handler: function (item, event) {
                        me.deleteRecord(me, item, event);
                    },
                    scope: me
                },
                {
                    text: 'Resend Invite',
                    disabled: !me.canDeleteUser,
                    handler: function (item, event) {
                        me.resendInvitation(me, item, event);
                    },
                    scope: me
                }
            ];
        } else {
            /*
                Delete requirements:
                have to be super admin
                can not delete yourself
            */
            var canDelete = true;
            if (Taco.user.id == record.get('id')) {
                canDelete = false;
            }

            actions = [
                {
                    text: 'Edit',
                    disabled: !me.canUpdateUser,
                    handler: function (item, event) {
                        me.launchEditor(item.ownerCt.record);
                    },
                    scope: me
                },
                {
                    text: 'Delete User',
                    disabled: (me.canDeleteUser && canDelete) ? false : true,
                    handler: function (item, event) {
                        me.deleteRecord(me, item, event);
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

        menu.showAt(evt.getXY());
    },
    resendInvitation: function (scope, item, event) {

        var treeview = scope.down('treeview'),
            selection = treeview && treeview.getSelectionModel() ? scope.down('treeview').getSelectionModel().getSelection()[0] : null;

        if (selection) {
            Ext.Ajax.request({
                url: '/admin/app/account/invitations/resend',
                jsonData: selection.data, 
                success: function (response) {
                    var res = Ext.JSON.decode(response.responseText);
                    if (!res.success) {
                        Ext.MessageBox.alert('Error', 'There was a problem resending the invite: ' + res.message);
                    } else {
                        Ext.MessageBox.alert('Success', 'The invite has been sent');
                    }
                }
            });  
        }
    },
    deleteRecord: function (scope, item, event) {

        var message = 'Are you sure you want to delete this user?',
            treeview = scope.down('treeview'),
            selection = treeview && treeview.getSelectionModel() ? scope.down('treeview').getSelectionModel().getSelection()[0] : null;

        if (selection.get('type').toLowerCase() == 'roll') {
            message = 'Are you sure you want to remove this role from the user?';
        }

        Ext.MessageBox.show({
            title: 'Delete',
            icon: Ext.Msg.QUESTION,
            msg: message,
            buttons: Ext.Msg.YESNO,
            fn: function (buttonId) {
                if (buttonId === 'yes') {
                    switch (selection.get('type').toLowerCase()) {
                        case 'user':
                            Ext.MessageBox.alert('Success', 'User has been deleted');
                            selection.destroy();
                            break;
                        case 'invitation':
                            Ext.Ajax.request({
                                url: "/admin/app/account/invitations/delete",
                                method: 'post',
                                jsonData: selection.data,
                                success: function () {
                                    Ext.MessageBox.alert('Success', 'User has been deleted');
                                   treeview.store.reload();
                                },
                                failure: function (resp) {
                                    var json = Ext.decode(resp.responseText, true);
                                    Ext.app.fireEvent('setmessage', json.message, 'error');
                                }
                            });
                            break;
                        case 'roll':
                            var childIds = [],
                                userid = selection.parentNode.get('id'),
                                deleteRecId = selection.get('id');

                            selection.parentNode.childNodes.forEach(function (child) {
                                if (deleteRecId != child.get('id')) {
                                    childIds.push(child.get('id'));
                                }
                            });

                            selection.destroy();

                            Ext.Ajax.request({
                                url: "/admin/app/account/users/updaterole",
                                method: 'post',
                                jsonData: {
                                    userId: userid,
                                    roles: childIds
                                },
                                failure: function (resp) {
                                    var json = Ext.decode(resp.responseText, true);
                                    Taco.app.fireEvent('setmessage', json.message, 'error');
                                }
                            });
                            break;
                    };
                }
                if (buttonId === 'no') {
                    //me.close();
                }
            }
        });
    },
    onCellClick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var target = Ext.fly(e.getTarget()),
            metaData = { id: record.getId() },
            header = view.getHeaderAtIndex(cellIndex);

        if (target.hasCls('x-tree-expander')) {
            return;
        }

        if ((header.dataIndex || header.allowNavigation === true) && header.allowNavigation !== false && this.allowNavigation !== false) {
            e.preventDefault();

            this.launchEditor(record, metaData);
        }
    },

    onItemClick: function (view, record, elm, index, e) {
        this.launchEditor(record);
    },

    onItemMove: function (node, oldParent, newParent, index, options) {
        //Place holder bc this function is required by the base class
    },

    launchEditor: function (record) {

        var rec = record.get ? record : null;

        if (rec == null || rec.get('type') !== 'invitation' && !rec.get('leaf')) {
            var editor = Ext.create('Taco.view.account.userFormModal', {
                record: rec
            });
            editor.show();
        }
    }
});
