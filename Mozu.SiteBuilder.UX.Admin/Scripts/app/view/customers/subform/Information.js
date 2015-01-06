Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Ext.ux.form.field.BoxSelect'
    ],

    title: 'Customer ID',
    cls: Taco.baseCSSPrefix + 'customer-information',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    config: {
        accountStatus: 'Active',
    },

    initComponent: function () {

        var me = this,
            data = this.record ? this.record.getData() : {
                createDate: new Date()
            };

        var isAnonymous = this.record.get('isAnonymous');

        if (this.record) {
            var titleString = 'Customer ID: ' + this.record.getId();
            if (!isAnonymous) {
                titleString += '  |  Shopper ID: ' + this.record.get('userName');
            }
            this.setTitle(titleString);
        }

        this.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            padding: '0 0 0 10',
            itemId: 'taxExemptIdField',
            flex: 1,
            name: 'taxId',
            cls: 'no-field-padding',
            hidden: !data.taxExempt
        });

        this.updateAccountStatus(data.accountStatus);

        this.taxExamptField = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'checkboxfield',
                name: 'taxExempt',
                itemId: 'taxExemptCheckbox',
                boxLabel: 'Tax Exempt',
                listeners: {
                    change: function (field, newValue, oldValue, eOpts) {
                        this.taxExemptIdField.setVisible(newValue);
                    },
                    scope: this
                }
            },
                this.taxExemptIdField
            ]
        });

        this.unlockAccountBtn = Ext.create('Ext.button.Button', {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            disabled: data.isDisabled || isAnonymous || !data.isLocked,
            text: 'Unlock Account',
            handler: function () {
                this.unlockAccountAjax(this.record.getId());
            },
            scope: this
        });

        this.resetAccountBtn = Ext.create('Ext.button.Button', {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            disabled: data.isDisabled || isAnonymous,
            text: 'Reset Password',
            handler: function () {
                var id = this.record.getId();
                Ext.MessageBox.show({
                    title: 'Reset Passowrd',
                    // pushes the buttons to the right to be consistant with our dialog ux.
                    rightJustifyButtons: true,
                    // reverses the order of the buttons
                    reverseOrder: true,
                    msg: "Are you sure? This will generate an email that notifies the customer that they will need to create a new password on their next login attempt.",
                    closable: false,
                    buttons: Ext.Msg.YESNO,
                    fn: function (val) {
                        if (val === 'yes') {
                            Ext.Ajax.request({
                                url: '/admin/app/customer/' + id + '/resetpassword',
                                method: 'GET',
                                success: function (response) {
                                    if(me.record.get('isLocked')) {
                                        me.unlockAccountBtn.setDisabled(true);
                                        me.record.set('isLocked', false);
                                        me.updateAccountStatus('Active', 'Locked');
                                    }
                                }
                            });
                        }
                    }
                });
            }, scope: this
        });

        this.disabledField = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'checkboxfield',
                name: 'isDisabled',
                disabled: isAnonymous,
                boxLabel: 'Disable Account',
                listeners: {
                    change: function (field, newValue, oldValue, eOpts) {
                        if (this.record.get('isLocked')) {
                            this.unlockAccountBtn.setDisabled(newValue);
                        }
                        this.resetAccountBtn.setDisabled(newValue);
                        // updateAccountStatus(newValue, oldValue);
                        this.updateAccountStatus(newValue?'Disabled':'Active', newValue?'Active':'Disabled');
                    },
                    scope: this
                },
                scope: this
            }]
        });

        this.resetPopup = Ext.create('widget.taco-window', {
            title: 'Reset Password',
            height: 200,
            width: 400,
            layout: 'fit',
            items: {

            }
        });

        this.items = [{
            xtype: 'container',
            defaults: {
                width: '100%'
            },
            flex: 1,
            padding: '0 10 0 0',
            items: [{
                xtype: 'textfield',
                cls: 'no-field-padding',
                name: 'firstName',
                fieldLabel: 'First Name',
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                name: 'lastName',
                fieldLabel: 'Last Name',
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                padding: '0 0 16 0',
                name: 'emailAddress',
                fieldLabel: 'Email',
                allowOnlyWhitespace: false
            }, {
                xtype: 'checkboxfield',
                name: 'isAnonymous',
                boxLabel: 'Create shopper account',
                itemId: 'createAccountCheckbox',
                checked: !this.record,
                hidden: this.record
            }, {
                xtype: 'checkboxfield',
                name: 'acceptsMarketing',
                boxLabel: 'Opt-in to Marketing'
            },
                this.taxExamptField,
                this.disabledField
            ]
        }, {
            xtype: 'container',
            cls: 'customer-settings',
            flex: 1,
            padding: '0 0 0 10',
            items: [{
                xtype: 'component',
                cls: 'customer-history',
                data: data,
                tpl: [
                    '<table width="100%">',
                    '<tr>',
                    '<td>',
                    '<label>Lifetime Value</label>',
                    '<h2 data-handle="customer-total-spent"><tpl if="typeof totalSpent === \'number\'">{totalSpent:currency}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>Fulfilled Orders</label>',
                    '<h2 data-handle="customer-order-count"><tpl if="typeof orderCount === \'number\'">{orderCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>Total Visits</label>',
                    '<h2 data-handle="customer-visit-count"><tpl if="typeof visitCount === \'number\'">{visitCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '</table>',
                    '<div>Customer Since: <span data-handle="customer-since">{createDate:date("m/d/Y")}</span></div>'
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                padding: '48 10 16 0',
                width: '100%',
                items: [{
                    xtype: 'boxselect',
                    padding: '0 5 0 0',
                    fieldLabel: 'Customer Segments',
                    itemId: 'customerSegments',
                    store: this.segmentStore,
                    getStore: function () {
                        return me.segmentStore;
                    },
                    name: 'segmentIds',
                    valueField: 'id',
                    displayField: 'code',
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: true,
                    disableKeyFilter: true,
                    flex: 1
                }, {
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Add',
                    scope: this,
                    handler: function () {
                        this.launchSegmentModal();
                    }
                }]
            }, {
                xtype: 'button',
                scale: 'medium',
                ui: 'link',
                text: 'View Wishlist',
                hidden: !(this.record),
                handler: function () {
                    Ext.create('Taco.shared.view.modal.Wishlist', {
                        record: this.record
                    });
                },
                scope: this
            }, {
                xtype: 'button',
                scale: 'medium',
                ui: 'link',
                text: 'View Gift Cards & Store Credits',
                hidden: !(this.record),
                handler: function () {
                    Ext.create('Taco.shared.view.modal.StoreCredit', {
                        record: this.record
                    });
                },
                scope: this
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width: '100%',
                padding: '5 0 5 0',
                items: [{
                    xtype: 'component',
                    cls: 'customer-history',
                    data:data,
                    tpl: [
                        '<div>Account Status:</div>'
                    ]}, {
                        xtype: 'component',
                        flex: 1
                    },
                    this.unlockAccountBtn
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width: '100%',
                padding: '5 0 5 0',
                items: [{
                    xtype: 'component',
                    itemId: 'accountStatus',
                    cls: 'customer-history',
                    data: data,
                    tpl: [
                        '<h2>{accountStatus}</h2>'
                    ]
                }, {
                        xtype: 'component',
                        flex: 1
                    },
                    this.resetAccountBtn
                ]
            }]
        }];

        this.callParent(arguments);

        this.on({
            accountstatuschanged: {
                scope: this, fn: function (cmp, newStatus, oldStatus) {
                    this.down('#accountStatus').update({ accountStatus: newStatus });
                }
            }
        });
    },

    launchSegmentModal: function () {
        var list = this.down('#customerSegments'),
            listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.CustomerSegments',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    },

    updateAccountStatus: function (newStatus, oldStatus) {
        if (newStatus !== oldStatus) {
            this.fireEvent('accountstatuschanged', this, newStatus, oldStatus);
        }
    },

    unlockAccountAjax: function (id) {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/customer/' + id + '/unlock',
            method: 'GET',
            success: function (response) {
                //Update account status!
                me.unlockAccountBtn.setDisabled(true);
                me.record.set('isLocked', false);
                me.updateAccountStatus('Active','Locked');
            }
        });
    }
});