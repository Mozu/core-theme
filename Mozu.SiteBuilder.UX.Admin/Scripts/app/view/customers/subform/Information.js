Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Ext.ux.form.field.BoxSelect'
    ],

    title: 'Shopper ID',
    cls: Taco.baseCSSPrefix + 'customer-information',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    initComponent: function () {

        var me = this,
            data = this.record ? this.record.getData() : {
                createDate: new Date()
            };

        if (this.record) this.setTitle('Shopper ID: ' + this.record.getId());

        this.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            padding: '0 0 0 10',
            itemId: 'taxExemptIdField',
            flex: 1,
            name: 'taxId',
            cls: 'no-field-padding',
            hidden: !data.taxExempt
        });

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
            disabled: !data.isActive,
            text: 'Unlock Account',
            handler: function () {
                Ext.Ajax.request({
                    url: 'admin/app/customer/{accountId}/unlock',
                    params: {
                        accountId: data.id
                    },
                    success: function (response) {
                        var text = response.responseText;
                        //TODO: (JK) Update account status!
                    }
                });
            }
        });

        this.resetAccountBtn = Ext.create('Ext.button.Button', {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            disabled: !data.isActive,
            text: 'Reset Password',
            handler: function () {
                //TODO: (JK) Call popup, this will determine if the email is sent to the user.
            }
        });

        this.disabledField = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'checkboxfield',
                name: 'disabled',
                itemId: 'disabledCheckbox',
                boxLabel: 'Disable Account',
                checked: !data.isActive,
                handler: function (cmp, checked) {
                    this.unlockAccountBtn.setDisabled(checked);
                    this.resetAccountBtn.setDisabled(checked);
                    //TODO: (JK) Update Account status!
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
                    boxLabel: 'Yes, keep me up to date on store news and specials'
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
                    cls: 'customer-history',
                    data: data.accountStatus,
                    tpl: [
                        '<h2>{.}</h2>'
                    ]}, {
                        xtype: 'component',
                        flex: 1
                    },
                    this.resetAccountBtn
                ]
            }]
        }];

        this.callParent(arguments);
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
    }
});