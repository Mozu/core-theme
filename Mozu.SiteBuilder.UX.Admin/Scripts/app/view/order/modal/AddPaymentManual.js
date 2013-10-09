/**
 * @class Taco.view.order.modal.AddPaymentManual
 */
Ext.define('Taco.view.order.modal.AddPaymentManual', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    data: {},
    field: '',

    autoShow: true,
    overflowX: 'hidden',
    overflowY: 'auto',
    scale: 'large',
    title: 'Add Manual Payment',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'vbox'
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    margin: '0 25 0 0',
                    width: 230
                },
                items: [{
                    xtype: 'textfield',
                    name: 'gatewayTransactionId',
                    fieldLabel: 'Gateway Transaction Id'
                }, {
                    xtype: 'numberfield',
                    name: 'gatewayInteractionId',
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    fieldLabel: 'Gateway Interaction Id'
                }, {
                    xtype: 'combobox',
                    name: 'actionName',
                    fieldLabel: 'Interaction Type',
                    allowBlank: false,
                    forceSelection: true,
                    store: [['AuthorizePayment', 'Authorize Only'], ['AuthAndCapture', 'Authorize and Capture']],
                    value: 'AuthorizePayment',
                    margin: '0 0 0 0'
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    margin: '0 25 0 0',
                    width: 230
                },
                items: [{
                    xtype: 'datetime',
                    name: 'interactionDate',
                    fieldLabel: 'Transaction Date'
                }, {
                    xtype: 'combobox',
                    name: 'cardType',
                    fieldLabel: 'Card Type',
                    allowBlank: false,
                    forceSelection: true,
                    store: [['Visa', 'Visa'], ['Mastercard', 'Mastercard']],
                    value: 'Visa'
                }, {
                    xtype: 'textfield',
                    name: 'cardLastFour',
                    fieldLabel: 'Last 4 Digits',
                    emptyText: '1111',
                    margin: '0 20 0 0',
                    width: 105
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    emptyText: '0',
                    margin: '0 0 0 0',
                    width: 105
                }]
            }, {
                xtype: 'fieldcontainer',
                layout: 'fit',
                fieldLabel: 'Payment Address',
                items: [{
                    xtype: 'checkboxfield',
                    boxLabel: 'Use billing address',
                    name: 'sameAsBilling',
                    checked: true,
                    scope: this,
                    handler: this.toggleExtraInfo
                }]
            }, {
                xtype: 'container',
                itemId: 'extraInfo',
                hidden: true,
                layout: {
                    type: 'vbox'
                },
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 25 0 0',
                        width: 230
                    },
                    items: [{
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
                        fieldLabel: 'Last Name',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 170
                    },
                    items: [{
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
                        fieldLabel: 'Address 4',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 170
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'cityOrTown',
                        fieldLabel: 'City'
                    }, {
                        xtype: 'textfield',
                        name: 'state',
                        fieldLabel: 'State'
                    }, {
                        xtype: 'textfield',
                        name: 'zipCode',
                        fieldLabel: 'ZIP Code'
                    }, {
                        xtype: 'textfield',
                        name: 'countryCode',
                        fieldLabel: 'Country',
                        margin: '0 0 0 0'
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '0 20 0 0',
                        width: 170
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'email',
                        fieldLabel: 'Email'
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
                        fieldLabel: 'Mobile Phone',
                        margin: '0 0 0 0'
                    }]
                }]
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    save: function () {
        var me = this,
            formValues = this.form.getValues(),
            transactionId = formValues.gatewayTransactionId,
            interactionId = formValues.gatewayInteractionId,
            actionName = formValues.actionName,
            amount = formValues.amount,
            cardInfo;

        cardInfo = {
            nameOnCard: formValues.nameOnCard,
            cardType: formValues.cardType,
            cardNumber: '************' + formValues.cardLastFour,
            expireMonth: formValues.expireMonth,
            expireYear: formValues.expireYear
        };

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
                me.record.reload();
            }
        });
    },

    toggleExtraInfo: function (checkbox, isChecked) {
        var extraInfo = this.down('#extraInfo');

        extraInfo[isChecked ? 'hide' : 'show']();
    }
});