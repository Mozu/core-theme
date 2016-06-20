/**
 * @class Taco.view.order.modal.CapturePayment
 */

Ext.define('Taco.view.order.modal.CapturePayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'small',
    height: 400,
    title: 'Collect Payment',

    initComponent: function () {
        var notes = null;

        if (this.record.get('paymentType') === 'PurchaseOrder') {
            notes = {
                xtype: 'textareafield',
                name: 'notes',
                fieldLabel: 'Notes',
                anchor: '100%'
            };
        }

        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Amount to Capture',
                    currencyCode: this.order.getCurrencyCode(),
                    selectOnFocus: true,
                    width: 170,
                    value: this.record.get('status') == 'Invoiced'
                        ? this.record.data.amountRequested
                        : Math.min(this.record.data.amountAuthorized, this.order.getCaptureAmountHint())
                },
                notes
            ]
        });

        this.items = [this.form];
        
        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            basic = this.form.getForm(),
            formValues = this.form.getValues(),
            data,
            cfg,
            notesValue = null;
        
        // if (!basic.findField('amount').isValid()) {
        //     return;
        // }
        if (this.record.get('paymentType') === 'PurchaseOrder') {
            notesValue = Ext.util.Format.htmlEncode(formValues.notes);
        }

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            amount: formValues.amount,
            notes: notesValue
        };

        me.down('#primaryAction').hide();

        cfg = {
            jsonData: data,
            callback: function () {
                var btn = me.down('#primaryAction');
                if (btn) btn.show();
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    return;
                }

                me.setLoading(false, me.body);
                me.order.reload();
                me.saveSuccess(json);
            },
            failure: function () {
                 me.setLoading(false, me.body);
            },
            scope: this
        };

        me.setLoading({
             msg: "Saving"
        }, me.body);

        this.order.capturePayment(cfg);
    }
});
