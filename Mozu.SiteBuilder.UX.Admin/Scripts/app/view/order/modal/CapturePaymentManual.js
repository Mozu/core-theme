/**
 * @class Taco.view.order.modal.CapturePaymentManual
 */
Ext.define('Taco.view.order.modal.CapturePaymentManual', {
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
                    width: 300
                },
                items: [
                {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount to Capture',
                    value: me.record.data.amountAuthorized
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
                    html: 'Collect Payment'
                }
            }, 
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                var me = this,
                    amount = me.formpanel.getValues()
                
                // add the capture Amount
                data = {
                    orderId: me.order.getId(),
                    paymentId: me.record.getId(),
                    amount: me.formpanel.getValues()['amount']
                };

                // pacakage up the data for the model to persist
                var cfg = {
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
        this.order.capturePayment(cfg);
                
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