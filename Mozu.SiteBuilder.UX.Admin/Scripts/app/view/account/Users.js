/**
 * @class Taco.view.account.Users
 */
Ext.define('Taco.view.account.Users', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.TreeList',
        'Taco.store.AccountUsersTree',
        'Taco.view.account.userFormModal'
    ],
    initComponent: function () {
        var me = this;

        Taco.user.sites.forEach(function (site) {
            if (site.roleId == 1) {
                me.isSuperAdmin = true;
            };
        });

        me.header = {
            title: 'Users',
            actions: [{
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                itemId: 'createActionButton',
                text: 'Add User',
                margin: '0 0 0 10',
                disabled: !me.isSuperAdmin,
                handler: function () {
                    me.launchEditor();
                }
            }]
        };

        me.store = Ext.create('Taco.store.AccountUsersTree', {
            autoLoad: true
        });

        //quick hack bc there's no paging, also this is slated to be refactored
        //BF 2/4/15
        me.store.on('load', function () {
            /*this.filter(function (rec) {
                if (rec.get('activity') != 'Declined') {
                    return rec;
                }
            });*/
            console.log('store loaded');
        });

        me.treelist = Ext.create('Taco.core.ux.TreeList', {
            animate: false,
            enableColumnHide: false,
            enableRowReorder: false,
            store: me.store,
            viewConfig: {
                animate: false,
                stripeRows: true,
                onExpand: Ext.emptyFn
            },
            columns: [{
                xtype: 'treecolumn',
                dataIndex: 'email',
                stateId: "email",
                text: 'Email',
                width: 400
            }, {
                dataIndex: 'role',
                stateId: "role",
                text: 'Roles',
                width: 200
            }, {
                dataIndex: 'activity',
                stateId: "activity",
                text: 'Activity',
                flex: 1,
                width: 300
            }, {
                dataIndex: 'status',
                stateId: "status",
                text: 'Status',
                width: 300
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
            }],
            dockedItems: [{
                xtype: 'container',
                dock: 'top',
                padding: '0 0 10',
                cls: 'taco-secondary-actions',
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'end'
                },
                items: [{
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Expand All',
                    allowDepress: false,
                    enableToggle: true,
                    scope: this,
                    toggleHandler: function (button, nextState) {
                        this.treelist.expandAll(function () {
                            button.toggle(false);
                        });
                    }
                }, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Collapse All',
                    margin: '0 0 0 10',
                    scope: this,
                    handler: function () {
                        this.treelist.collapseAll();
                    }
                }]
            }],
            listeners: {
                cellclick: me.onCellClick,
                itemmove: me.onItemMove,
                scope: me
            }
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [me.treelist]
        });

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
            //debugger
            actions = [
                {
                    text: 'Delete Role',
                    disabled: (record.parentNode.get('status') == 'Pending' || !me.isSuperAdmin) ? true : false,
                    handler: function (item, event) {
                        //me.launchEditor(item.ownerCt.record);
                        me.deleteRecord(item, event);
                    },
                    scope: me
                }
            ];
        } else if (record.get('status') == 'Pending') {
            actions = [
                {
                    text: 'Delete User',
                    disabled: !me.isSuperAdmin,
                    handler: function (item, event) {
                        //me.launchEditor(item.ownerCt.record);
                        me.deleteRecord(item, event);
                    },
                    scope: me
                },
                {
                    text: 'Resend Invite',
                    disabled: !me.isSuperAdmin,
                    handler: function (item, event) {
                        me.resendInvitation(item, event);
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
                    disabled: !me.isSuperAdmin,
                    handler: function (item, event) {
                        me.launchEditor(item.ownerCt.record);
                    },
                    scope: me
                },
                {
                    text: 'Delete User',
                    disabled: (!me.isSuperAdmin || !canDelete) ? true : false,
                    handler: function (item, event) {
                        //me.launchEditor(item.ownerCt.record);
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
    resendInvitation: function (item, event) {
        Ext.Ajax.request({
            url: '/admin/app/account/invitations/resend',
            jsonData: item.data,
            success: function (response) {
                var res = Ext.JSON.decode(response.responseText);
                if (!res.success) Taco.MessageBox.alert('Error', 'There was a problem resending the invite: ' + res.message);
            }
        })
    },
    deleteRecord: function (item, event) {
        switch (item.scope.treelist.getSelectionModel().getSelection()[0].get('type')) {
            case 'user':
                item.scope.treelist.getSelectionModel().getSelection()[0].destroy();
                break;
            case 'invitation':
                Ext.Ajax.request({
                    url: "/admin/app/account/invitations/delete",
                    method: 'post',
                    jsonData: item.scope.treelist.getSelectionModel().getSelection()[0].data,
                    success: function () {
                        item.scope.treelist.store.reload();
                    },
                    failure: function (resp) {
                        var json = Ext.decode(resp.responseText, true);
                        Taco.app.fireEvent('setmessage', json.message, 'error');
                    }
                });
                break;
            case 'roll':
                var childIds = [],
                    userid = item.scope.treelist.getSelectionModel().getSelection()[0].parentNode.get('id'),
                    deleteRecId = item.scope.treelist.getSelectionModel().getSelection()[0].get('id');
                item.scope.treelist.getSelectionModel().getSelection()[0].parentNode.childNodes.forEach(function (child) {
                    if (deleteRecId != child.get('id')) {
                        childIds.push(child.get('id'));
                    }
                });

                Ext.Ajax.request({
                    url: "/admin/app/account/users/updaterole",
                    method: 'post',
                    jsonData: {
                        userId: userid,
                        roles: childIds
                    },
                    success: function () {
                        item.scope.treelist.store.reload();
                    },
                    failure: function (resp) {
                        var json = Ext.decode(resp.responseText, true);
                        Taco.app.fireEvent('setmessage', json.message, 'error');
                    }
                });
                break;
        };
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

            if (e.target) {
                metaData = Ext.apply(metaData, e.target.dataset);
            }

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
        if (record == null || record.get('type') != 'invite' && !record.get('leaf')) {
            var editor = Ext.create('Taco.view.account.userFormModal', {
                record: record
            });
            editor.show();
        }
    }
});
