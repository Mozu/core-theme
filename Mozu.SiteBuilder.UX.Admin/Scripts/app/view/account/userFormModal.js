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
    initComponent: function() {
        var me = this;
        me.title = (me.record) ? 'Edit User' : 'Add User';
        me.roles = Ext.create('Taco.store.Roles', {
            autoLoad: true/*,
            filters: [
                function(item) {
                    if (item.data.id > 2) {
                        return item;
                    }
                }
            ]*/
        });

        me.roles.on('load', function () {
            var selectedRecs = [];

            if (this.record) {
                /*if (this.record.get('role') == 'SuperAdmin') {
                    Ext.ComponentQuery.query('[inputValue="sa"]')[0].setValue(true);
                } else if (this.record.get('role') == 'Admin') {
                    //admin
                    Ext.ComponentQuery.query('[inputValue="a"]')[0].setValue(true);
                } else */if (this.record.get('role') != 'None' && this.record.get('role') != 'Multiple') {
                    var pushRec = this.roles.getAt(this.roles.find('name', this.record.get('role')));

                    if (pushRec) {
                        console.log(pushRec);
                        selectedRecs.push(pushRec);
                    }
                }

                this.record.childNodes.forEach(function (child) {
                    if (this.roles.getById(child.get('id')) > -1) {
                        selectedRecs.push(this.roles.getById(Number(child.get('id'))));
                    }
                }, this);
                this.selModel.select(selectedRecs);
            }

            if (!this.isValid()) {
                Ext.ComponentQuery.query('[text="Save"]')[0].disable();
            } else {
                Ext.ComponentQuery.query('[text="Save"]')[0].enable();
            }
        }, me);

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: this.multiSelect === false ? "SINGLE" : "MULTI",
            headerWidth: 37,
            listeners: {
                selectionchange: function (it) {
                    if (!this.scope.isValid()) {
                        Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                    } else {
                        Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                    }

                }
            },
            scope: me
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
                                Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                            } else {
                                Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                            }
                        }
                    },
                    scope: me
                },
                /*{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Role',
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'Super Admin',
                            name: 'role',
                            inputValue: 'sa',
                            padding: '0 10 0 0',
                            handler: function (radio) {
                                if (!this.isValid()) {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                                } else {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                                }
                            },
                            scope: this
                        }, {
                            boxLabel: 'Admin',
                            name: 'role',
                            inputValue: 'a',
                            padding: '0 10 0 0',
                            handler: function (radio) {
                                if (!this.isValid()) {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                                } else {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                                }
                            },
                            scope: this
                        }, {
                            boxLabel: 'Other',
                            name: 'role',
                            inputValue: 'o',
                            padding: '0 10 0 0',
                            checked: true,
                            handler: function(radio) {
                                if (radio.checked) {
                                    this.roleSelector.enable();
                                } else {
                                    this.roleSelector.disable();
                                }

                                if (!this.isValid()) {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                                } else {
                                    Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                                }
                            },
                            scope: this
                        }
                    ]
                },*/
                me.roleSelector
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
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
        /*if (Ext.ComponentQuery.query('[name=role]')[0].value == true) {
            //super admin
            var item = {
                roleId: 1,
                name: 'superadmin'
            };
            roles.push(item);
        } else if (Ext.ComponentQuery.query('[name=role]')[1].value == true) {
            //admin
            var item = {
                roleId: 2,
                name: 'admin'
            };
            roles.push(item);
        } else {*/
            //other
        for (var x = 0; x < this.roleSelector.selModel.getSelection().length; x++) {
            var roleId = this.roleSelector.selModel.getSelection()[x].get('id');
                var item = {
                    roleId: this.roleSelector.selModel.getSelection()[x].get('id'),
                    name: this.roleSelector.selModel.getSelection()[x].get('name')
                };
                if (!isAdmin) {
                    roles.push(item);
                }

                if (roleId == 2 || roleId == 1) {
                    isAdmin = true;
                }

           // }
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
        /*if (Ext.ComponentQuery.query('[name=role]')[0].value == true) {
            //super admin
            roles.push(1);
        } else if (Ext.ComponentQuery.query('[name=role]')[1].value == true) {
            //admin
            roles.push(2);
        } else {*/
            //other
        for (var x = 0; x < this.roleSelector.selModel.getSelection().length; x++) {
            var roleId = this.roleSelector.selModel.getSelection()[x].get('id');
                if (!isAdmin) {
                    roles.push(roleId);
                }

                if (roleId == 2 || roleId == 1) {
                    isAdmin = true;
                }
            }
        //}
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
        /*var radioSuperAdmin = Ext.ComponentQuery.query('[name=role]')[0];
        var radioAdmin = Ext.ComponentQuery.query('[name=role]')[1];*/
        var email = this.form.getValues()['email'];
        var selectionModel = this.selModel.getSelection();

        /*if (radioSuperAdmin.value == true && email != '') {
            //super admin
            retval = true;
        } else if (radioAdmin.value == true && email != '') {
            //admin
            retval = true;
        } else */if (email != '' && selectionModel.length != 0) {
            //other
            retval = true;
        }
        return retval;
    }
});
