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

    initComponent: function () {
        var me = this;

        me.roles = Ext.create('Taco.store.Roles', {
            autoLoad: true,
            filters: [
                function (item) {
                    if (item.data.id > 2) {
                        return item;
                    } 
                }
            ]
        });

        me.roles.on('load', function() {
            if (this.record) {
                if (this.record.get('role') == 'Super Admin') {
                    Ext.ComponentQuery.query('[inputValue="sa"]')[0].setValue(true);
                }
                this.record.childNodes.forEach(function (child) {
                    if (this.roles.getById(child.get('id')) > -1) {
                        this.selModel.select(Number(this.roles.getById(child.get('id'))));
                        /*
                        if (Number(child.get('id')) == 1) {
                            //super admin
                            Ext.ComponentQuery.query('[inputValue="sa"]')[0].setValue(true);
                        } else if (Number(child.get('id')) == 2) {
                            //admin
                            Ext.ComponentQuery.query('[inputValue="a"]')[0].setValue(true);
                        }*/
                    }
                }, this);
            }
        }, me);
        
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: this.multiSelect === false ? "SINGLE" : "MULTI",
            headerWidth: 37
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
            columns: [{
                dataIndex: 'name',
                hideable: false,
                flex: 1
            }],
            selModel: me.selModel
        });

        me.form = Ext.create('Ext.form.Panel', {
            items: [
            {
                xtype: 'textfield',
                name: 'email',
                width: 400,
                fieldLabel: 'Email',
                value: (this.record) ? this.record.get('email') : ''
            },
            {
                xtype      : 'fieldcontainer',
                fieldLabel : 'Role',
                defaultType: 'radiofield',
                defaults: {
                    flex: 1
                },
                layout: 'hbox',
                items: [
                    {
                        boxLabel  : 'Super Admin',
                        name      : 'role',
                        inputValue: 'sa',
                        padding: '0 10 0 0'
                    }, {
                        boxLabel  : 'Admin',
                        name: 'role',
                        inputValue: 'a',
                        padding: '0 10 0 0'
                    }, {
                        boxLabel  : 'Other',
                        name      : 'role',
                        inputValue: 'o',
                        padding: '0 10 0 0',
                        checked: true,
                        handler: function (radio) {
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
            me.roleSelector]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
        var email = this.form.getValues().email;
        var roles = [];

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
    createInvite: function (values) {
        var me = this;

        if (!(values.email) || !(values.accessLevel)) {
            return false;
        }
    }
});
