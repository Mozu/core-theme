/**
 * @class Taco.view.order.modal.AddPaymentManual
 */
Ext.define('Taco.view.order.modal.AddPaymentManual', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 700,
    height: 500,
    style: 'overflow-y: scroll;overflow-x: hidden;',
    data: {},
    field: '',

    initComponent: function (eOpts) {
        var me = this;
        me.extraInfoCont = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
            layout: { type: 'hbox' },
            hidden: true,
            items: [{
                xtype: 'container',
                style: 'padding-right: 10px;',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                {
                    xtype: 'textfield',
                    name: 'firstName',
                    fieldLabel: 'First Name'
                }, {
                    xtype: 'textfield',
                    name: 'middleName',
                    fieldLabel: 'Middle Name'
                }, {
                    xtype: 'textfield',
                    name: 'lastName',
                    fieldLabel: 'Last Name'
                }, {
                    xtype: 'textfield',
                    name: 'email',
                    fieldLabel: 'Email'
                }, {
                    xtype: 'textfield',
                    name: 'address1',
                    fieldLabel: 'Address 1'
                }, {
                    xtype: 'textfield',
                    name: 'address2',
                    fieldLabel: 'Address 2'
                }, {
                    xtype: 'textfield',
                    name: 'address3',
                    fieldLabel: 'Address 3'
                }, {
                    xtype: 'textfield',
                    name: 'address4',
                    fieldLabel: 'Address 4'
                }]
            }, {
                xtype: 'container',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [
                 {
                     xtype: 'textfield',
                     name: 'cityOrTown',
                     fieldLabel: 'City'
                 },
                {
                    xtype: 'textfield',
                    name: 'state',
                    fieldLabel: 'State'
                }, {
                    xtype: 'textfield',
                    name: 'zipCode',
                    fieldLabel: 'ZIP'
                }, {
                    xtype: 'textfield',
                    name: 'countryCode',
                    fieldLabel: 'Country'
                }, {
                    xtype: 'textfield',
                    name: 'homePhone',
                    fieldLabel: 'Home Phone'
                }, {
                    xtype: 'textfield',
                    name: 'workPhone',
                    fieldLabel: 'Work Phone'
                }, {
                    xtype: 'textfield',
                    name: 'mobilePhone',
                    fieldLabel: 'Mobile Phone'
                }]
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });
        
        this.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
            layout: { type: 'vbox' },
            items: [
                {
                    xtype: 'panel',
                    layout: { type: 'hbox' },
                    items: [{
                        xtype: 'container',
                        style: 'padding-right: 10px;',
                        defaults: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            labelAlign: 'top',
                            width: 300
                        },
                        items: [
                        {
                            /* one of three required field */
                            name: 'gatewayTransactionId',
                            fieldLabel: 'Gateway Transaction Id'
                        },
                        {
                            xtype: 'numberfield',
                            /* two of three required field */
                            mouseWheelEnabled: false,
                            hideTrigger:true,
                            name: 'gatewayInteractionId',
                            fieldLabel: 'Gateway Interaction Id'
                        },
                        {
                            /* three of three required field */
                            xtype: 'combobox',
                            name: 'actionName',
                            fieldLabel: 'Interaction Type',
                            allowBlank: false,
                            forceSelection: true,
                            store: [['AuthorizePayment', 'Authorize Only'], ['AuthAndCapture', 'Authorize and Capture']],
                            value: 'AuthorizePayment'
                        },
                        {
                            xtype: 'datetime',
                            name: 'interactionDate',
                            fieldLabel: 'Transaction Date'
                        }]
                    }, {
                        xtype: 'container',
                        defaults: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            labelAlign: 'top',
                            width: 300
                        },
                        items: [
                        {
                            name: 'cardLastFour',
                            fieldLabel: 'Last 4 Digits of Card',
                            emptyText: '1111'
                        },
                        {
                            xtype: 'combobox',
                            name: 'cardType',
                            fieldLabel: 'Card Type',
                            allowBlank: false,
                            forceSelection: true,
                            store: [['Visa', 'Visa'], ['Mastercard', 'Mastercard']],
                            value: 'Visa'
                        },
                        {
                            xtype: 'currencyfield',
                            name: 'amount',
                            fieldLabel: 'Amount',
                            emptyText: '0'
                        }, {
                            xtype: 'checkboxfield',
                            boxLabel: 'Address Same as billing',
                            name: 'sameAsBilling',
                            checked: true,
                            style: 'margin-top:50px;',
                            handler: function (it, status) {
                                console.log(status);
                                // me.extraInfoCont.show(!status);
                                if (!status) {
                                    me.extraInfoCont.show();
                                } else {
                                    me.extraInfoCont.hide();
                                }
                            }
                        }]
                    }]
                }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

        me.formpanel.add(me.extraInfoCont);

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    cls: 'order-modal-title',
                    html: 'Add Manual Payment'
                }
            },
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                var formValues = me.formpanel.getValues(),
                    cardInfo = {
                        nameOnCard: formValues.nameOnCard,
                        cardType: formValues.cardType,
                        cardNumber: '************' + formValues.cardLastFour,
                        expireMonth: formValues.expireMonth,
                        expireYear: formValues.expireYear
                    },
                    transactionId = formValues.gatewayTransactionId,
                    interactionId = formValues.gatewayInteractionId,
                    actionName = formValues.actionName,
                    amount = formValues.amount;

                me.record.addManualPayment({
                    jsonData: {
                        orderId: me.record.getId(),
                        billingInfo: cardInfo,
                        interactionDate: me.formpanel.getValues()['interactionDate'],
                        amount: amount,
                        gatewayTransactionId: transactionId,
                        gatewayInteractionId: interactionId,
                        actionName: actionName
                    },
                    success: function () {
                        me.hide();
                        me.record.reload();
                    }
                });
            },
            scope: this
        });

        this.actions = {
            xtype: 'container',
            items: [this.primaryButton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.hide();
                }
            }]
        };

        this.callParent(arguments);
    }
});