/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.CapturePayment', {
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
                items: [{
                    xtype: 'hidden',
                    name: 'orderId',
                    value: me.orderId
                },{
                    xtype: 'hidden',
                    name: 'paymentId',
                    value: me.paymentId
                }, {
                    xtype: 'unitfield',
                    name: 'amountCollected',
                    fieldLabel: 'Amount Collected',
                    unitString: '$',
                    emptyText: '0'
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
                var me = this;
                
                // add the capture Amount
                data = {
                    orderId: me.formpanel.getValues()['orderId'],
                    paymentId: me.formpanel.getValues()['paymentId'],
                    amount: me.formpanel.getValues()['amountCollected']
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
                        this.record.reload();
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