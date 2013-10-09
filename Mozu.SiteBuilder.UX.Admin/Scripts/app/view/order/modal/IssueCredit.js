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

        // basic = this.form.getForm();

        // if (basic) {
        //     basic.findField('amount').setValue(this.record.get('amountCollected'));
        // }

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
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Ext.message('error saving credit');
                    
                    var errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                        html: 'Error saving credit'
                    });
                    errorDialog.show();
                    return;
                }
                this.fireEvent('aftersave');
                me.hide();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : 'Error saving credit';
                
                var errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                    html: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});
