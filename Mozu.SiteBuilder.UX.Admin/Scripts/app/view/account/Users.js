/**
 * @class  Taco.view.account.Users
 */

Ext.define('Taco.view.account.Users', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
            'Taco.store.Roles',
            'Taco.store.AccountUsers'
  ],

    // this is the title. 
    title: 'Users',

    initComponent: function () {
        var me = this;

        me.header = {
            title: this.title
        };

        me.store = Ext.create('Taco.store.AccountUsers', {
            autoLoad: true
        });
        me.roles = Ext.create('Taco.store.Roles', {
            autoLoad: true
        });

        me.addform = Ext.create('Ext.form.Panel', {
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            defaults: {
                margin: '0 15 0 0'
            },
            hidden: true,
            items: [{
                xtype: 'textfield',
                name: 'email',
                fieldLabel: 'Email',
                labelAlign: 'left',
                labelWidth: 60,
                msgTarget: 'qtip',
                allowOnlyWhitespace: false
             }, {
                xtype: 'combobox',
                name: 'accessLevel',
                fieldLabel: 'Access Level',
                labelAlign: 'left',
                labelWidth: 100,
                msgTarget: 'qtip',
                queryMode: 'local',
                valueField: 'id',
                displayField: 'name',
                emptyText: 'Select access',
                allowOnlyWhitespace: false,
                editable: false,
                forceSelection: true,
                store: me.roles
             }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Cancel',
                scope: this,
                handler: function () {
                    this.addbutton.show();
                    this.addform.hide();
                }
            }, {
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Send Invite',
                scope: this,
                handler: function () {
                    var form = me.addform.getForm();

                    this.fireEvent('adduser', form.getFieldValues());
                    form.reset();
                }
            }]
        });

        me.addbutton = Ext.widget('button', {
            ui: 'action',
            scale: 'medium',
            text: '+ Add new User',
            scope: this,
            handler: function () {
                this.addform.show();
                this.addbutton.hide();
            }
        });

        me.rolesEditor = Ext.widget('boxselect', {
            name: 'accessLevel',
            mode: 'local',
            valueField: 'id',
            displayField: 'name',
            allowBlank: false,
            store: me.roles
        });

        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners: {
                    beforeedit: function (editor, e) {
                        return e.record.data.type !== 'invitation';
                    },
                    edit: function (editor, e) {

                        me.updateUserAccountRole({
                            roles: e.value,
                            userId: e.record.getId()
                        });
                    }
                }
            }),
            basegridview;

        me.basegrid = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.store,
            layout: 'fit',
            width: 942,
            //hiddenColumns: ['name','siteName'],
            enableColumnHide: true,
            stateful:true,
            stateId:"statefulUsersGrid",
            columns: [{
                xtype: 'gridcolumn',
                dataIndex: 'email',
                stateId: "email",
                text: 'Email',
                width: 400
                }, {
                xtype: 'gridcolumn',
                dataIndex: 'roleIds',
                stateId: "roles",
                text: 'Roles',
                width: 200,
                renderer: function (value, metaData, record) {
                    return Ext.Array.pluck(record.data.roles || [], 'name').join(', ');
                },
                editor: me.rolesEditor
                }, {
                xtype: 'gridcolumn',
                dataIndex: 'activity',
                stateId: "activity",
                text: 'Activity',
                width: 300,
                renderer: function (value) {
                    return value === 'Pending' ? value + ' <a href="#" class="resend-user-invite">Resend</a>' : value;
                }
                }],

            plugins: [cellEditing],

            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                weight: 101,
                padding: '5 0 0 0',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                cls: Taco.baseCSSPrefix + 'toolbar-form',
                items: [me.addbutton, me.addform]
             }]
        });

        me.items = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'fit'
            },
            flex: 1,
            items: [me.basegrid]
        });

        Ext.apply(me.body, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [me.items]
        });

        me.callParent(arguments);
        me.store.load();

        me.on({
            'adduser': {
                fn: me.createInvite,
                scope: me
            },
            'deleteuser': {
                fn: me.deleteuser,
                scope: me
            }
        });
        basegridview = me.basegrid.view;
        basegridview.mon(basegridview, 'itemclick', me.onItemClick, me);
    },

    updateUserAccountRole: function (updateInfo) {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/account/users/updaterole',
            method: 'POST',
            jsonData: updateInfo,

            success: function () {
                me.store.load();
            }
        });
    },

    createInvite: function (values) {
        var me = this;

        if (!(values.email) || !(values.accessLevel)) {
            return false;
        }


        Ext.Ajax.request({
            url: '/admin/app/account/invitations/create',
            jsonData: {
                email: values.email,
                roleId: values.accessLevel
            },
            success: function (response) {

                var res = Ext.JSON.decode(response.responseText);
                if (res.success) {
                    me.store.load();
                } else {
                    Taco.MessageBox.alert('Error', 'There was a problem inviting the user: ' + res.message);
                }
            }
        });
    },

    onItemClick: function (view, record, elm, index, e) {
        if (e.target.className === 'resend-user-invite') {
            e.preventDefault();

            Ext.Ajax.request({
                url: '/admin/app/account/invitations/resend',
                jsonData: record.data,
                success: function (response) {
                    var res = Ext.JSON.decode(response.responseText);
                    if (!res.success) Taco.MessageBox.alert('Error', 'There was a problem resending the invite: ' + res.message);
                }
            });
        } else if (e.target.className.indexOf('taco-action-delete') >= 0) {
            // todo: fix! this sucks, but the actions column on basegrid wasn't working as expected for me. allow this hack for now
            var me = this;

            Ext.Ajax.request({
                url: '/admin/app/account/' + Ext.util.Inflector.pluralize(record.data.type) + '/delete',
                jsonData: record.data,
                success: function (response) {

                    var res = Ext.JSON.decode(response.responseText);
                    if (res.success) {
                        me.store.load();
                    } else {
                        Taco.MessageBox.alert('Error', 'There was a problem deleting the user/invite: ' + res.message);
                    }
                }
            });

        }
    }
});