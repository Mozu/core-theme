/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.RequestCheck', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.form.CurrencyField'],
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
                items: [
                {
                    name: 'firstName',
                    fieldLabel: 'First Name'
                }, {
                    name: 'lastName',
                    fieldLabel: 'Last Name'
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount Requested',
                    value: me.record.get('total')
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
                    html: 'Request Check'
                }
            }, 
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Save',
            click: function () {
                var data = Ext.apply(
                    {
                        orderId: me.record.getId()
                    },
                    me.formpanel.getValues()
                );
                me.record.requestCheck({
                    jsonData: data,
                    success: function() {
                        
                        me.record.reload();
                        me.hide();
                    }
                });
                
            }
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