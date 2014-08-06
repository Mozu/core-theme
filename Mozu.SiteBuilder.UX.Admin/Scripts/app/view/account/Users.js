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
            hidden: true,
            defaults: {
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'left'
                },
                cls: Taco.baseCSSPrefix + 'toolbar-form-cell'
            },
            items: [{
                width: 400,
                defaults: {
                    layout: 'vbox'
                },
                items: [{
                    xtype: 'label',
                    html: 'Email'
                 }, {
                    xtype: 'textfield',
                    name: 'email'
                 }]
             }, {
                width: 300,
                layout: {
                    type: 'vbox'
                },
                items: [{
                    xtype: 'label',
                    html: '&nbsp;'
                 }, {
                    xtype: 'selectfield',
                    name: 'accessLevel',
                    mode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    allowBlank: false,
                    emptyText: 'Select access',
                    store: me.roles
                 }]
             }, {
                width: 300,
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                items: [{
                    xtype: 'secondaryaction',
                    text: 'Cancel',
                    margin: '5 15 5 15',
                    click: function () {
                        me.addbutton.show();
                        me.addform.hide();
                    },
                    scope: this
                 }, {
                    xtype: 'secondarybutton',
                    text: 'Send Invite',
                    listeners: {
                        click: {
                            element: 'el',
                            fn: function () {
                                var form = me.addform.getForm();
                                me.fireEvent('adduser', form.getFieldValues());
                                form.reset();
                            },
                            scope: this
                        }
                    }
                 }]
             }]
        });

        me.addbutton = Ext.widget('secondarybutton', {
            text: '+ Add new User',
            listeners: {
                click: {
                    element: 'el',
                    fn: function () {
                        me.addform.show();
                        me.addbutton.hide();
                    },
                    scope: this
                }
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
            columns: [{
                xtype: 'gridcolumn',
                dataIndex: 'email',
                text: 'Email',
                width: 400
                }, {
                xtype: 'gridcolumn',
                dataIndex: 'roleIds',
                text: 'Roles',
                width: 200,
                renderer: function (value, metaData, record) {
                    return Ext.Array.pluck(record.data.roles || [], 'name').join(', ');
                },
                editor: me.rolesEditor
                }, {
                xtype: 'gridcolumn',
                dataIndex: 'activity',
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