/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.CheckPayment', {
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
                    name: 'name',
                    fieldLabel: 'Name'
                },*/ {
                    name: 'checkNumber',
                    fieldLabel: 'Check Number'
                }, {
                    xtype: 'unitfield',
                    name: 'amountCollected',
                    fieldLabel: 'Amount Collected',
                    unitString: '$',
                    emptyText: '0'
                }/*, {
                    xtype: 'datetime',
                    name: 'createDate',
                    fieldLabel: 'Create Date'
                }*/]
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
                    html: 'Collect Check'
                }
            }, 
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                var me = this;
                
                console.log('TODO: payment action logic');
                console.log(me.formpanel.getValues());
                //debugger
                //Taco.model.OrderPayment
                
                //on success hide if no pop error
                
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