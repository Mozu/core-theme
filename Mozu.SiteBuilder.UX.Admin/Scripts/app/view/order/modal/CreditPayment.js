/**
 * @class Taco.view.order.modal.CreditPayment
 */
Ext.define('Taco.view.order.modal.CreditPayment', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',
    title: 'Issue Credit',

    initComponent: function (eOpts) {
        var amountCollected = this.record.get('amountCollected'),
            amountCredited = this.record.get('amountCredited'),
            amountRefunded = this.record.get('amountRefunded'),
            availableForCredit = Math.max(amountCollected - amountCredited - amountRefunded, 0);

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'auto'
            },
            items: [{
                xtype: 'currencyfield',
                currencyCode: this.order.getCurrencyCode(),
                name: 'amount',
                itemId : 'amount',
                fieldLabel: 'Amount',
                required: true,
                value: availableForCredit,
                maxValue: availableForCredit,
                width: 160
            }, {
                xtype: 'textarea',
                name: 'reason',
                fieldLabel: 'Reason',
                width: '100%'
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({            
            show: {
                scope: this,
                fn: function () {
                    var field = this.down('#amount');

                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },
    
    doSave: function () {
        var me = this,
            fmValues = this.form.getValues(),
            data = {
                orderId: me.order.getId(),
                paymentId: me.record.getId(),
                amount: fmValues.amount,
                reason: fmValues.reason
            };
        
        me.setLoading({
            msg: "Saving"
        }, me.body);

        this.order.issueCredit({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return;
                }
                me.order.reload();
                me.saveSuccess(json);
            },
            failure: function (response) {
                me.setLoading(false, me.body);
            },
            scope: this
        });
    }
});
