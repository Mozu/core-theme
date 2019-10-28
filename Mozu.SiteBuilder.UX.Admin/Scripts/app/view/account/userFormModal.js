/**
 * @class Taco.view.account.userFormModal
 I left the radio button switcher code in for right now incase we have to switch back 
 BF 3/20/15
 */

Ext.define('Taco.view.account.userFormModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.selection.CheckboxModel',
        'Taco.store.Roles'
    ],
    
    autoShow: true,
    scale: 'large',
    //title: 'Add User',
    actions: [{
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction'
    }],
    // Keeps track of all currently selected roles on the modal.
    // Since the roles store is paged we can't track using the roles store.
    selectedRecords: {
        items: [],
        matchesImpl: function (record, role) {
            return (record.id != null && Number(role.get('id')) === record.id) || role.get('name') === record.name;
        },
        sortImpl: function (a, b) {
            // Always sort by ID as some behavior relies on this...
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        },
        find: function (role) {
            return this.items.find(function (record) {
                return this.matchesImpl(record, role);
            }, this);
        },
        findIndex: function (role) {
            return this.items.findIndex(function (record) {
                return this.matchesImpl(record, role);
            }, this);
        },
        add: function (role) {
            var matchingIndex = this.findIndex(role);

            // Certain events, like select, fire on initial load so
            // only push a new record if it doesn't already exist.
            if (matchingIndex === -1) {
                var pushRecord = {
                    id: Number(role.get('id')),
                    name: role.get('name')
                };

                this.items.push(pushRecord);
                this.items.sort(this.sortImpl);
            }
        },
        remove: function (role) {
            var indexToDelete = this.findIndex(role);

            if (indexToDelete !== -1) {
                this.items.splice(indexToDelete, 1);
                this.items.sort(this.sortImpl);
            }
        },
        clear: function () {
            this.items = [];
        }
    },
    initComponent: function() {
        var me = this;
        me.title = (me.record) ? 'Edit User' : 'Add User';
        
        // Always clear the selected records on load
        this.selectedRecords.clear();

        if (me.record) {
            // Loop through the assigned roles for this user
            me.record.childNodes.forEach(function (child) {
                var fakeRole = Ext.create('Taco.model.Role', {
                    id: Number(child.get('id')),
                    name: child.get('role')
                });

                me.selectedRecords.add(fakeRole);
            });
        }

        me.roles = Ext.create('Taco.store.Roles', {
            autoLoad: true
        });

        me.roles.on('load', function () {
            // Find all roles matching the list of selected records.
            // Since roles is paged this will only match roles on this page.
            var selectedRecords = this.selectedRecords;

            // Filter the data.items array directly since we just want a copy of
            // matching roles and we don't want to filter the actual store.
            var selectedRolesOnThisPage = this.roles.data.items.filter(function (role) {
                var record = selectedRecords.find(role);
                return record != null && record != undefined;
            });

            this.selModel.select(selectedRolesOnThisPage);

            if (!this.isValid()) {
                Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].disable();
            } else {
                Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].enable();
            }
        }, me);

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            allowDeselect: true,
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: this.multiSelect === false ? "SINGLE" : "MULTI",
            headerWidth: 37,
            listeners: {
                select: function (it, role) {
                    this.scope.selectedRecords.add(role);
                },
                deselect: function (it, role) {
                    this.scope.selectedRecords.remove(role);
                },
                selectionchange: function (it) {
                    if (!this.scope.isValid()) {
                        Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].disable();
                    } else {
                        Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].enable();
                    }

                }
            },
            scope: me
        });

        me.gridPager = Ext.create('Taco.core.ux.grid.LinkPaging', {
            componentCls: 'x-link-paging-toolbar',
            store: me.roles,
            displayInfo: true,
            dock: 'bottom'
        });

        me.roleSelector = Ext.create('Ext.grid.Panel', {
            tbar: {
                xtype: 'component',
                cls: 'gridPanelSubhead',
                html: 'Access Level'
            },
            store: me.roles,
            hideHeaders: true,
            header: false,
            height: 300,
            columns: [
                {
                    dataIndex: 'name',
                    hideable: false,
                    flex: 1
                }
            ],
            dockedItems: [
              me.gridPager
            ],
            selModel: me.selModel
        });

        me.form = Ext.create('Ext.form.Panel', {
            items: [
                {
                    xtype: 'textfield',
                    name: 'email',
                    width: 400,
                    fieldLabel: 'Email',
                    allowBlank: false,
                    enableKeyEvents: true,
                    value: (this.record) ? this.record.get('email') : '',
                    listeners: {
                        change: function (it, newVal) {
                            if (!this.scope.isValid()) {
                                Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].disable();
                            } else {
                                Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].enable();
                            }
                        }
                    },
                    scope: me
                },
                me.roleSelector
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);

        if (me.record == null) {
            Ext.ComponentQuery.query('[itemId="primaryAction"]')[0].text = 'Invite User';
        } 
    },

    doSave: function() {
        if (this.record) {
            //update rec
            this.updateUserAccountRole(this.record);
        } else {
            //create invite
            this.createInvitation();
        }
        
    },
    createInvitation: function () {
        var email = this.form.getValues().email;
        var roles = [];
        var isAdmin = false;

        for (var i = 0; i < this.selectedRecords.items.length; i++) {
            var record = this.selectedRecords.items[i];
            
            var item = {
                roleId: record.id,
                name: record.name
            };

            if (!isAdmin) {
                roles.push(item);
            }

            if (item.roleId == 2 || item.roleId == 1) {
                isAdmin = true;
            }
        }

        Ext.Ajax.request({
            url: '/admin/app/account/invitations/create',
            jsonData: {
                email: email,
                roleIds: roles
            },
            success: function (response) {
                var res = Ext.JSON.decode(response.responseText);
                if (res.success) {
                    Taco.app.fireEvent('UserSaved');
                    //I had to do this bc a weird scoping issue and overwriting the close function
                    Ext.ComponentQuery.query('window[title="Add User"]')[0].close();
                } else {
                    Taco.MessageBox.alert('Error', 'There was a problem inviting the user: ' + res.message);
                }
            }
        }, this);
    },
    updateUserAccountRole: function (record) {
        var me = this;
        var roles = [];
        var email = this.form.getValues()['email'];
        var isAdmin = false;
            
        for (var i = 0; i < this.selectedRecords.items.length; i++) {
            var roleId = this.selectedRecords.items[i].id;

            if (!isAdmin) {
                roles.push(roleId);
            }

            if (roleId == 2 || roleId == 1) {
                isAdmin = true;
            }
        }

        this.close();

        Ext.Ajax.request({
            url: '/admin/app/account/users/updaterole',
            method: 'POST',
            jsonData: {
                roles: roles,
                userId: record.get('id'),
                email: email,
                firstName: record.get('firstName'),
                lastName: record.get('lastName')
            },
            success: function () {
                Taco.app.fireEvent('UserSaved');
            }
        }, this);
    },
    isValid: function () {
        var retval = false;
        var email = this.form.getValues()['email'];
        var selectedRecords = this.selectedRecords.items;
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        
        if (re.test(email) && selectedRecords.length != 0) {
            retval = true;
        }
        return retval;
    }
});
