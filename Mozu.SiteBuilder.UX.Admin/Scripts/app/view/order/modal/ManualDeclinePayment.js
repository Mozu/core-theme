/**
 * @class Taco.view.order.modal.ManualDeclinePayment
 */

Ext.define('Taco.view.order.modal.ManualDeclinePayment', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',    
    title: 'Manual Transaction: Decline Payment',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {            
            items: [
                {
                    xtype: 'textfield',
                    name: 'declineCode',
                    anchor:'0',
                    fieldLabel: 'Decline Code'
                }, {
                    xtype: 'textarea',
                    name: 'amount',
                    fieldLabel: 'Comments'
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            formValues = this.form.getValues(),
            data,
            cfg;
        
        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            declineCode: formValues.declineCode,
            comments: formValues.comments,
            gatewayInteractionId: formValues.gatewayInteractionId,
            interactionDate: formValues.interactionDate
        };

        me.setLoading({
            msg: "Saving"
        }, me.body);

        cfg = {
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return;
                }                
                me.order.reload();
                me.saveSuccess(json)
            },
            failure: function () {
                me.setLoading(false, me.body);
            },
            scope: this
        };

        this.order.declinePaymentManual(cfg);
    }
});
