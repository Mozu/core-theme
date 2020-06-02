Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Ext.ux.form.field.BoxSelect'
    ],

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.customer_id,
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

        var isAnonymous = true;

        var titleString = '';
        if (this.record) {
            isAnonymous = this.record.get('isAnonymous');
            titleString = Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.customer_id + ': ' + this.record.getId();
            if (!isAnonymous) {
                titleString += '  |  ' + Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.shopper_id +': ' + this.record.get('userName');
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
                boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.tax_exempt,
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
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.unlock_account,
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
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.reset_password,
            handler: function () {
                var id = this.record.getId();
                Ext.MessageBox.show({
                    title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.reset_password,
                    // pushes the buttons to the right to be consistant with our dialog ux.
                    rightJustifyButtons: true,
                    // reverses the order of the buttons
                    reverseOrder: true,
                    msg: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.reset_pws_msg,
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
                boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.disable_account,
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
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.reset_password,
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.first_name,
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                name: 'lastName',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.last_name,
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                name: 'emailAddress',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.email,
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                name: 'userName',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.user_name,
                disabled: isAnonymous,
                maxLength: 180,
                hidden: !this.record,
                allowOnlyWhitespace: isAnonymous
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                padding: '0 0 16 0',
                width: '100%'
            }, {
                xtype: 'checkboxfield',
                name: 'isAnonymous',
                boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.create_shopper_account,
                itemId: 'createAccountCheckbox',
                checked: !this.record,
                hidden: this.record
            }, {
                xtype: 'checkboxfield',
                name: 'acceptsMarketing',
                boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.opt_in_to_marketing
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
                    '<label>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.lifetime_value+'</label>',
                    '<h2 data-handle="customer-total-spent"><tpl if="typeof totalSpent === \'number\'">{totalSpent:currency}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.fulfilled_orders+'</label>',
                    '<h2 data-handle="customer-order-count"><tpl if="typeof orderCount === \'number\'">{orderCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.total_visits+'</label>',
                    '<h2 data-handle="customer-visit-count"><tpl if="typeof visitCount === \'number\'">{visitCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '</table>',
                    '<div>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.customer_since+': <span data-handle="customer-since">{customerSinceDate:date("m/d/Y")}</span></div>'
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                padding: '71 0 5 0',
                width: '100%',
                hidden: !this.record
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
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.customer_segments,
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
                    text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.add,
                    scope: this,
                    handler: function () {
                        this.launchSegmentModal();
                    }
                }]
            }, {
                xtype: 'button',
                scale: 'medium',
                ui: 'link',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.view_wishlist,
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
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.view_gift_cards,
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
                        '<div>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.account_status+'</div>'
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