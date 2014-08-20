/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-orderpayment',
    requires: [
        'Taco.view.order.modal.CreditPayment',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.ApplyCheck',
        // commenting out this unfinished code;
        //'Taco.view.order.modal.ApplyStoreCredit',
        'Taco.view.order.widget.PaymentPanel',
        'Taco.view.order.modal.AddPayment',
        'Taco.view.order.modal.AddPaymentManual',
        'Taco.view.order.modal.AddGiftCard',
        'Taco.store.StoreCredits'
    ],

    title: 'Payments',

    bodyPadding:"0 0 0 0",

    // optional override of the title to be used in Tabs.
    tabTitle:"Payments",

    config : {
        // order model
        originalRecord : null,
        record: null,
        itemId:"orderPayment"
    },
    
    getLastValidPayment: function() {
        return this.record.payments().queryBy(function(payment) { return payment.get('status') !== "Voided"; }).last();
    },

    initComponent: function (eOpts) {
        var me = this;

        this.tools = [
            me.addPaymentButton = Ext.widget('splitbutton', {
                text: 'Add Payment',
                handler: function() {
                    var action = me.paymentActions.addCreditCard;
                    var lastValidPayment = me.getLastValidPayment();
                    if (lastValidPayment && lastValidPayment.get('paymentType') === "Check") action = me.paymentActions.requestCheck;
                    return action.execute();
                },
                menu: me.getNewPaymentActions(),
                ui: 'action',
                scale: 'medium',
                margin: '0 2px 0 0'
            })
        ];

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');

        // after the record is reloaded we will need to refresh the ui
        this.mon( this.record,"aftercommit", this.onRecordChange, this);
        
        // initialize the ui
        // this will be called every time the record is updated
        me.bodyCont = Ext.create('Ext.container.Container', {
            items: []
        });
        me.initUI();
        
        
        me.items = [me.bodyCont];
        this.callParent(arguments);
        this.addEvents(['rerender']);
    },

    getNewPaymentActions: function() {

        function makeAction(text, cls) {
            return Ext.create('Ext.Action', {
                text: text,
                handler: function() {
                    Ext.create(cls, {
                        record: me.record,  listeners: {
                            afterclose: {
                                scope: me,
                                fn: function () {                                    
                                    if (this.addPaymentButton) {
                                        this.addPaymentButton.focus();
                                    }

                                }
                            }
                        }
                    }).show();
                }
            });
        }

        var me = this,
            actions = me.paymentActions = {
                addCreditCard: makeAction('Credit Card', 'Taco.view.order.modal.AddPayment'),
                requestCheck: makeAction('Check', 'Taco.view.order.modal.RequestCheck'),
                addManualCreditCard: makeAction('Credit Card (Manual)', 'Taco.view.order.modal.AddPaymentManual'),
                addGiftCard: makeAction('Gift Card', 'Taco.view.order.modal.AddGiftCard'),
                addStoreCredit: makeAction('Store Credit', 'Taco.view.order.modal.AddGiftCard')
            };

        return Ext.Object.getValues(actions);
    },
    
    // initialize the views and actions menu
    initUI: function () {
        var me = this;

        me.initHeader();
        me.initPaymentsUI();
    },

    initPaymentsUI: function() {
        var me = this;

        me.paymentPanels = [];

        this.record.payments().each( function (payment) {
            var panel = Ext.create('Taco.view.order.widget.PaymentPanel',
                {
                    order: me.record,
                    record: payment
                });
            me.paymentPanels.push(panel);
        });
        
        // add the panels all at once to speed up layout.
        me.bodyCont.add(me.paymentPanels);

    },

    // clear out the payment panels
    destroyPaymentsUI: function() {
        var me = this;

        if (me.paymentPanels)
        {
            Ext.Array.each(me.paymentPanels, function(panel) { panel.destroy(); } );
            delete me.paymentPanels;
        }
    },

    initHeader: function (){
        var me = this,
           orderStatus = me.record.get('orderStatus'),
           canAddPayment = orderStatus !== 'Completed' && orderStatus !== "PendingReview",
           paymentAuthInfo = me.record.get('authorizationInfo'),
           total = paymentAuthInfo.totalAmount,
           amountCollected = paymentAuthInfo && paymentAuthInfo.amountCollected,
           paymentStatus = "Unpaid";

        if (amountCollected > 0  && amountCollected >= total) paymentStatus = "Fully Paid";
        if (amountCollected < total && amountCollected > 0) paymentStatus = "Partially Paid";

        this.setHeaderTitle('<span class="label">Status:</span><span data-handle="order-payment-status">' + paymentStatus + '</span>');

        Ext.Object.each(me.paymentActions, function(k, paymentAction) {
            paymentAction.setDisabled(!canAddPayment);
        });
    },

    // called when the record has been updated
    onRecordChange : function() {
        var me = this;
        Ext.suspendLayouts();
        
        // re-build the record.payments() store.
        me.rebuildPayments();

        // we need to make this more selective.

        
        //re-build the ui components
        //me.destroyHeader();
        me.initHeader();
        me.destroyPaymentsUI();
        me.initPaymentsUI();
        //me.setActionsMenuVisibility();
        Ext.resumeLayouts(true);
        //this.fireEvent('orderchange');
        this.fireEvent('rerender');
    },

    /*
     * ExtJS doesn't handle reload of data with sub-stores well.
     * So we manually re-populate the order.payments() and the payment.interactions() stores.
     */
    rebuildPayments: function() {
        var me = this;

        me.record.payments().removeAll();
        Ext.each(me.record.data.payments, function (paymentRaw) {
            var paymentRecord = Ext.create('Taco.model.OrderPayment', paymentRaw);
            paymentRecord.interactions().removeAll();
            Ext.each(paymentRecord.data.interactions, function (interactionRaw) {
                var paymentInteractionRecord = Ext.create('Taco.model.PaymentInteraction', interactionRaw);
                paymentRecord.interactions().add(paymentInteractionRecord);
            });
            me.record.payments().add(paymentRecord);
        });
    },

    isValid: function () {
        var payments = this.record.get('payments');

        return payments && payments.length;
    }

});