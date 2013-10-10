/**
 * @class Taco.view.order.modal.IssueCredit
 */
Ext.define('Taco.view.order.modal.IssueCredit', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',
    title: 'Issue Credit',

    initComponent: function (eOpts) {
        var amountCollected = this.record.get('amountCollected');

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'auto'
            },
            items: [{
                xtype: 'currencyfield',
                name: 'amount',
                itemId : 'amount',
                fieldLabel: 'Amount',
                required: true,
                value: amountCollected,
                maxValue : amountCollected,
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
            save: {
                scope: this,
                fn: 'save'
            },
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
    
    save: function () {
        var me = this,
            fmValues = this.form.getValues(),
            data = {
                orderId: me.order.getId(),
                paymentId: me.record.getId(),
                amount: fmValues.amount,
                reason: fmValues.reason
            };
        
        this.order.issueCredit({
            jsonData: data,
            success: function (response) {
                var json = Ext.decode(response.responseText, true),
                    errorDialog;

                if (!json || !json.success) {
                    Ext.message('error saving credit');
                    
                    errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                        html: 'Error saving credit'
                    });
                    errorDialog.show();

                    return;
                }
                this.fireEvent('aftersave');
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : 'Error saving credit',
                    errorDialog;
                
                errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                    html: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});
