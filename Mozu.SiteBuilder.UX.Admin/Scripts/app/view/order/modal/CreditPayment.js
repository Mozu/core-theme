/**
 * @class Taco.view.order.modal.CreditPayment
 */
Ext.define('Taco.view.order.modal.CreditPayment', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.issue_credit,
    height: 430,

    initComponent: function (eOpts) {
        var me = this;
        var payment = this.record.data;
        var paymentData = payment;

        // Defer to subpayment amounts if one exists that matches the id of this order. 
        if (payment.subpayments) {
            var subpaymentForThisOrder = payment.subpayments.filter(function (subpayment) {
                return subpayment.target.targetId == me.order.data.id;
            })[0];

            if (subpaymentForThisOrder) {
                paymentData = Ext.apply(payment, subpaymentForThisOrder);
            } 
        }

        var amountCollected = paymentData.amountCollected,
            amountCredited = paymentData.amountCredited,
            amountRefunded = paymentData.amountRefunded,
            // JavaScript is terrible at maintaining proper precision with floating point math, e.g. 0.1 + 0.2 = 0.30000000000000004
            availableForCredit = Math.max(0, Ext.Number.correctFloat(amountCollected - amountCredited - amountRefunded)),
            poCheckbox = this.record.get('paymentType') === 'PurchaseOrder'
                         ? {
                                xtype: 'checkbox',
                                name: 'creditToPurchaseOrders',
                                itemId: 'purchaseOrderCredit',
                                checked: true,
                                boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.apply_refund_for_purchase_orders
                            }
                         : null;

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: 'vbox',
            items: [{
                xtype: 'currencyfield',
                currencyCode: this.order.getCurrencyCode(),
                name: 'amount',
                itemId : 'amount',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.amount,
                required: true,
                allowBlank: false,
                value: availableForCredit,
                maxValue: availableForCredit,
                width: 160
            },
            poCheckbox,
            {
                xtype: 'textarea',
                name: 'reason',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.reason,
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
            shouldCreditPo = fmValues.creditToPurchaseOrders ? fmValues.creditToPurchaseOrders : null,
            data = {
                orderId: me.order.getId(),
                paymentId: me.record.getId(),
                amount: fmValues.amount,
                reason: fmValues.reason,
                refundToAvailableBalance: shouldCreditPo
            };
        
        me.setLoading({
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.saving
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
