/**
 * @class Taco.view.order.modal.CapturePayment
 */
Ext.define('Taco.view.order.modal.CapturePayment', {
    extend: 'Ext.window.Window',
    requires: ['Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField'],
    cls: Taco.baseCSSPrefix + 'order-modal ' + Taco.baseCSSPrefix + 'window-plain',
    title: "Collect Payment",
    autoShow: true,
    width: 400,
    data: {},
    ghost:false,
    field: '',
    resizeable: false,
    modal:true,
    initComponent: function (eOpts) {
        var me = this;

        this.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            layout: { type: 'hbox' },
            defaults: {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                width: 300
            },
            items: [
                {
                    xtype: 'currencyfield',
                    labelClsExtra: "taco-firstField",
                    selectOnFocus:true,
                    name: 'amount',
                    width:150,
                    fieldLabel: 'Amount to Capture',
                    value: me.record.data.amountAuthorized
                }
            ]
        });
        
        

        this.items = [
            this.formpanel
        ];
        

        this.primaryButton = Ext.create('Ext.button.Button', {
            ui: "action-primary",
            scale:"medium",
            text: 'Save',
            handler: function () {
                var me = this,
                    fm = me.formpanel.getForm();
                
                if (!fm.findField("amount").isValid()) {
                    return;
                }
                
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
                        me.setLoading(false, me.body);
                        me.hide();
                        me.order.reload();
                    },
                    failure: function (response) {
                        me.setLoading(false, me.body);
                    },
                    scope: this
                };

                me.setLoading({
                    msg: "Saving"
                }, me.body);
                
                // call the model method to persist the change
                this.order.capturePayment(cfg);
            },
            scope: this
        });

        this.buttons = [
            {
                xtype: 'button',
                ui: "action",
                scale: "medium",
                text: 'Cancel',
                margin: {
                    right: 10
                },
                handler: function() {
                    me.hide();
                },
                scope: me
            },
            this.primaryButton
        ];


        // make the save button the default focus item so the user can just hit enter key to save the dialog;
        this.defaultFocus = me.primaryButton;
        
        this.callParent(arguments);
    },
    onDestroy: function () {
        this.callParent(arguments);
    }
});