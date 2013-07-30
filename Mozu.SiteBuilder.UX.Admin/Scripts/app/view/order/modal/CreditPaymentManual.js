/**
 * @class Taco.view.order.modal.CreditPaymentManual
 */
Ext.define('Taco.view.order.modal.CreditPaymentManual', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 400,
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
                    width: 150
                },
                items: [
                {
                    xtype: 'textfield',
                    name: 'gatewayInteractionId',
                    fieldLabel: 'Gateway Interaction Id'
                }]
            },
            {
                xtype: 'container',
                defaults: {
                    xtype: 'textfield',
                    labelSeparator: '',
                    labelAlign: 'top',
                    width: 150
                },
                items: [{
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount Credited',
                    value: me.record.data.amountCollected
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
                    html: 'Manual Transaction: Credit Payment'
                }
            }, 
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                var me = this,
                
                data = {
                    orderId: me.order.getId(),
                    paymentId: me.record.getId(),
                    amount: me.formpanel.getValues()['amount'],
                    gatewayInteractionId: me.formpanel.getValues()['gatewayInteractionId']
                },

                // pacakage up the data for the model to persist
                cfg = {
                    jsonData: data,
                    success: function (response) {
                        var json = Ext.decode(response.responseText, true);
                        if (!json || !json.success) {
                            // service didnt' return data properly
                            return;
                        }
                        me.order.reload();
                    },
                    failure: function (response) {

                    },
                    scope: this
                };

                // call the model method to persist the change
                this.order.creditPaymentManual(cfg);
                
                me.hide();
            },
            scope: this
        });

        this.actions = {
            xtype: 'container',
            items: [this.primaryButton, {
                xtype: 'action',
                text: 'Cancel',
                click: function () {
                    me.hide();
                }
            }]
        };

        this.callParent(arguments);
    }
});