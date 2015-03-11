/**
 * @class Taco.view.account.userFormModal
 */

Ext.define('Taco.view.account.userFormModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.selection.CheckboxModel',
        'Taco.store.Roles'
    ],

    autoShow: true,
    scale: 'large',
    title: 'Add User',

    initComponent: function() {
        var me = this;

        me.roles = Ext.create('Taco.store.Roles', {
            autoLoad: true,
            filters: [
                function(item) {
                    if (item.data.id > 2) {
                        return item;
                    }
                }
            ]
        });

        me.roles.on('load', function () {
            var selectedRecs = [];
            if (this.record) {
                if (this.record.get('role') == 'SuperAdmin') {
                    Ext.ComponentQuery.query('[inputValue="sa"]')[0].setValue(true);
                } else if (this.record.get('role') == 'Admin') {
                    //admin
                    Ext.ComponentQuery.query('[inputValue="a"]')[0].setValue(true);
                } else if (this.record.get('role') != 'None' && this.record.get('role') != 'Multiple') {
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
        }, me);

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: this.multiSelect === false ? "SINGLE" : "MULTI",
            headerWidth: 37,
            listeners: {
                selectionchange: function (it) {
                    if (it.getSelection().length == 0) {
                        Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                    } else if (this.scope.form.getValues()['email'] != '') {
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
                html: 'Other Roles'
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
                    value: (this.record) ? this.record.get('email') : '',
                    listeners: {
                        change: function (it) {
                            if (it.getValue() == '') {
                                Ext.ComponentQuery.query('[text="Save"]')[0].disable();
                            } else if (it.scope.selModel.getSelection().length > 0) {
                                Ext.ComponentQuery.query('[text="Save"]')[0].enable();
                            } 
                        }
                    },
                    scope: me
                },
                {
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
                            padding: '0 10 0 0'
                        }, {
                            boxLabel: 'Admin',
                            name: 'role',
                            inputValue: 'a',
                            padding: '0 10 0 0'
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
                            },
                            scope: this
                        }
                    ]
                },
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

        if (Ext.ComponentQuery.query('[name=role]')[0].value == true) {
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
        } else {
            //other
            for (var x = 0; x < this.roleSelector.selModel.getSelection().length; x++) {
                var item = {
                    roleId: this.roleSelector.selModel.getSelection()[x].get('id'),
                    name: this.roleSelector.selModel.getSelection()[x].get('name')
                };
                roles.push(item);
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
        if (Ext.ComponentQuery.query('[name=role]')[0].value == true) {
            //super admin
            roles.push(1);
        } else if (Ext.ComponentQuery.query('[name=role]')[1].value == true) {
            //admin
            roles.push(2);
        } else {
            //other
            for (var x = 0; x < this.roleSelector.selModel.getSelection().length; x++) {
                roles.push(this.roleSelector.selModel.getSelection()[x].get('id'));
            }
        }

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
                //I had to do this bc a weird scoping issue and overwriting the close function
                Ext.ComponentQuery.query('window[title="Add User"]')[0].close();
            }
        });
    }
});
