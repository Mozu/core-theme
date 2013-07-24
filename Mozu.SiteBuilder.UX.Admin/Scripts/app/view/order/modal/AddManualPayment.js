/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.AddManualPayment', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 700,
    data: {},
    field: '',

    initComponent: function (eOpts) {
        var me = this;

        this.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
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
                    xtype: 'combobox',
                    name: 'cardType',
                    fieldLabel: 'Card Type',
                    allowBlank: false,
                    forceSelection: true,
                    store: [['Visa', 'Visa'], ['NotVisa', 'Something that is not Visa']],
                    value: 'Visa'
                },
                {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    emptyText: '0'
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
                    name: 'nameOnCard',
                    fieldLabel: 'Name on Card',
                },
                {
                    name: 'cardLastFour',
                    fieldLabel: 'Last 4 Digits of Card',
                    emptyText: '1111'
                },
                {
                    xtype: 'numberfield',
                    name: 'expireMonth',
                    fieldLabel: 'Exp Month',
                    minValue: 1,
                    maxValue: 12
                }, {
                    xtype: 'numberfield',
                    name: 'expireYear',
                    fieldLabel: 'Exp Year',
                    minValue: 2013,
                    maxValue: 2022
                }]
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

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