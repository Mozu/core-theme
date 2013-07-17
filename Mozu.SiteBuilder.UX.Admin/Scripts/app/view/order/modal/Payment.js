/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.Payment', {
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
                items: [{
                    xtype: 'hidden',
                    name: 'orderId',
                    value: me.record.data.orderNumber
                }, /*{
                    name: 'paymentServiceTransactionId',
                    fieldLabel: 'First Name'
                }, {
                    name: 'status',
                    fieldLabel: 'Middle Name'
                }, {
                    name: 'status',
                    fieldLabel: 'Last Name'
                }, */{
                    name: 'naemOnCard',
                    fieldLabel: 'Name on Card'
                }, {
                    xtype: 'unitfield',
                    name: 'amountCollected',
                    fieldLabel: 'Amount Collected',
                    unitString: '$',
                    emptyText: '0'
                }, {
                    xtype: 'datetime',
                    name: 'createDate',
                    fieldLabel: 'Create Date'
                }, {
                    xtype: 'numberfield',
                    name: 'expMonth',
                    fieldLabel: 'Exp Month',
                    maxValue: 12,
                    minValue: 1
                }, {
                    xtype: 'numberfield',
                    name: 'expYear',
                    fieldLabel: 'Exp Year'
                }]
            }, {
                xtype: 'container',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 300
                },
                items: [{
                    name: 'paymentType',
                    fieldLabel: 'Payment Type'
                }, {
                    name: 'cardType',
                    fieldLabel: 'Card Type'
                }, {
                    name: 'cardNumber',
                    fieldLabel: 'Card Number'
                }, {
                    name: 'nameOnCard',
                    fieldLabel: 'Name On Card'
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
                    html: 'Add Payment'
                }
            },
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            onClick: function () {
                console.log('TODO: payment action logic');
                console.log(me.formpanel.getValues());
                //debugger
                //Taco.model.OrderPayment

                //on success hide if no pop error

                me.hide();
            }
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