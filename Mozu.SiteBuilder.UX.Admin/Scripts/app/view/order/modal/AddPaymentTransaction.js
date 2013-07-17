/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.AddPaymentTransaction', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 400,
    data: {},
    field: '',

    initComponent: function (eOpts) {
        var me = this;

       // transaction type, transaction id, amount, and other information that was used to process the transaction through the gateway on a selected order. 
        
        var options = Ext.create('Ext.data.Store', {
            fields: ['val', 'lbl'],
            data: [
                { "val": "payment", "lbl": "Payment" },
                { "val": "void", "lbl": "Void" },
                { "val": "credit", "lbl": "Credit" }
            ]
        });
      
        if (!me.transDate) {
            me.transDate = new Date();
        }
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
                },/*{
                    xtype: 'hidden',
                    name: 'transId',
                    value: me.transId
                },*/ {
                    xtype: 'combo',
                    fieldLabel: 'Type',
                    name: 'type',
                    store: options,
                    displayField: 'lbl',
                    valueField: 'val',
                    emptyText: 'type',
                    //record: me.record,
                    //parent: this,
                    listeners: {
                        //select: me.transactionAction  
                    },
                    scope: me
                }, {
                    name: 'paymentServiceTransactionId',
                    fieldLabel: 'Transaction Gateway Id',
                    value: me.transGatewayId
                }, {
                    xtype: 'unitfield',
                    name: 'amountCollected',
                    fieldLabel: 'Amount Collected',
                    unitString: '$',
                    emptyText: '0',
                    value: me.transAmount
                }, {
                    xtype: 'datetime',
                    name: 'createDate',
                    fieldLabel: 'Create Date',
                    value: new Date(me.transDate)
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
                    html: 'Transaction'
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