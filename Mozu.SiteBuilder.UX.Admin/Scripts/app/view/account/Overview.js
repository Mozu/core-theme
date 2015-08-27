/**
 * @class Taco.view.account.Overview
 */

/*

deprecated

Ext.define('Taco.view.account.Overview', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.model.AccountInformation',
        'Taco.core.ux.window.Modal',
        'Taco.core.ux.form.Form'
    ],

    initComponent: function () {
        var button;

        button = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Edit Account Information',
            scope: this,
            handler: this.launchModal
        });

        Ext.apply(this.header, {
            title: 'My Account'
        });

        Ext.apply(this.body, {
            layout: {
                type: 'hbox'
            },
            items: [button]
        });

        this.callParent(arguments);
    },

    launchModal: function () {
        var record,
            form;

        if (!this.modal) {
            record = Ext.create('Taco.model.AccountInformation', {
                firstName: this.recordId.get('firstName'),
                lastName: this.recordId.get('lastName'),
                email: this.recordId.get('email')
            });

            form = Ext.create('Taco.core.ux.form.Form', {
                record: record,
                header: false,
                requireDirty: true,
                items: [{
                    xtype: 'textfield',
                    name: 'email',
                    fieldLabel: 'Log in email',
                    width: 230
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'firstName',
                        fieldLabel: 'First Name',
                        margin: '0 20 0 0',
                        width: 230
                    }, {
                        xtype: 'textfield',
                        name: 'lastName',
                        fieldLabel: 'Last Name',
                        width: 230
                    }]
                }, {
                    xtype: 'textfield',
                    name: 'oldPassword',
                    fieldLabel: 'Old Password',
                    inputType: 'password',
                    width: 230
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'newPassword',
                        fieldLabel: 'New Password',
                        inputType: 'password',
                        margin: '0 20 0 0',
                        width: 230
                    }, {
                        xtype: 'textfield',
                        name: 'confirmPassword',
                        fieldLabel: 'Confirm',
                        inputType: 'password',
                        width: 230
                    }]
                }]
            });

            this.modal = Ext.create('Taco.core.ux.window.Modal', {
                scale: 'medium',
                title: 'Edit Account Information',
                form: form,
                items: [form]
            });

            this.modal.on({
                save: {
                    scope: this,
                    fn: function () {
                        var me = this;

                        Ext.Ajax.request({
                            url: '/admin/app/account/information/update',
                            method: 'POST',
                            success: Ext.emptyFn,
                            failure: Ext.emptyFn,
                            jsonData: me.getValues()
                        });
                    }
                }
            });
        }

        this.modal.show();
    },

    onDestroy: function () {
        Ext.destroy(this.modal);

        this.callParent(arguments);
    }
});


*/