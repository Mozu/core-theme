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
                items: [
                {
                    name: 'nameOnCard',
                    fieldLabel: 'Name on Card',
                    value: 'Bob Boberson'
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount',
                    emptyText: '0',
                    value: '223'
                }, {
                    xtype: 'numberfield',
                    name: 'expireMonth',
                    fieldLabel: 'Exp Month',
                    minValue: 1,
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
                items: [
                {
                    xtype: 'combobox',
                    name: 'cardType',
                    fieldLabel: 'Card Type',
                    allowBlank: false,
//                    editable: false,
                    forceSelection: true,
//                    listConfig: { shadow: false },
//                    shrinkWrap: 3,
                    store: [['Visa', 'Visa'], ['NotVisa', 'Something that is not Visa']],
                    value: 'Visa'
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
            click: function () {
                var me = this,
                    order = me.record,
                    billingInfo = me.formpanel.getValues(),
                    amount = billingInfo.amount;

                delete billingInfo.amount;

                order.addPayment({
                    jsonData: {
                        orderId: order.getId(),
                        amount: amount,
                        billingInfo: billingInfo
                    },
                    success: function() {
                        this.hide();
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