/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-orderpayment',
    requires: [
        'Taco.view.order.modal.Refund',
        'Taco.view.order.modal.AddPurchaseOrder',
        'Taco.view.order.modal.CreditPayment',
        'Taco.view.order.modal.RequestCheck',
        'Taco.view.order.modal.ApplyCheck',
        // commenting out this unfinished code;
        //'Taco.view.order.modal.ApplyStoreCredit',
        'Taco.view.order.widget.PaymentPanel',
        'Taco.view.order.modal.AddPayment',
        'Taco.view.order.modal.AddPaymentManual',
        'Taco.view.order.modal.AddEcommerceGiftCard',
        'Taco.view.order.modal.AddGiftCard',
        'Taco.store.StoreCredits',
        'Taco.model.PaymentSettings'
    ],

    title: 'Payments',

    bodyPadding:"0 0 0 0",

    // optional override of the title to be used in Tabs.
    tabTitle: 'Payments',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config : {
        // order model
        originalRecord : null,
        record: null,
        itemId:"orderPayment"
    },
    
    getLastValidPayment: function() {
        return this.record.payments().queryBy(function(payment) { return payment.get('status') !== "Voided"; }).last();
    },

    addTools: function (){
        var me =this;
        var record = this.record;
        var isUnpaid = record.get("paymentStatus") === "Unpaid";

        me.tools = [
            Ext.widget('button', {
                itemId: 'refundButton',
                ui: 'action',
                scale: 'medium',
                text: 'Refund',
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update'
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'paymentUpdate'
                }],
                margin: '0 10 0 0',
                handler: function () {
                    Ext.create('Taco.view.order.modal.Refund', {
                        order: record
                    });
                },
                disabled: isUnpaid
            }),
            me.addPaymentButton = Ext.widget('splitbutton', {
                menuAlign: 'tr-br?',
                text: 'Add Payment',
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update'
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'paymentCreate'
                }],
                itemId: 'paymentSplitButton',
                handler: function () {
                    var action = me.paymentActions.addCreditCard;
                    var lastValidPayment = me.getLastValidPayment();
                    var paymentType;

                    if (me.isPurchaseOrderEnalbled()) {
                        action = me.paymentActions.addPurchaseOrder;
                    } else if (lastValidPayment) {
                        paymentType = lastValidPayment.get('paymentType');

                        if (paymentType === "Check") {
                            action = me.paymentActions.requestCheck;
                        } else if (paymentType === "PurchaseOrder") {
                            action = me.paymentActions.addPurchaseOrder;
                        }
                    }

                    return action.execute();
                },
                menu: me.getNewPaymentActions(),
                listeners: {
                    menushow: function (cmp, menu) {
                        var poEnabled = this.isPurchaseOrderEnalbled();
                        var purchaseOrder = cmp.down('#purchaseOrderOption');
                        purchaseOrder[poEnabled ? 'show' : 'hide']();

                        // TODO: configure this
                        // var gatewayGiftCardEnabled = this.isGatewayGiftcardEnabled();
                        //var gatewayGiftCardEnabled = true;
                        //var gatewayGiftCard = cmb.down('#giftCardOption');
                        //gatewayGiftCard[gatewayGiftCardEnabled ? 'show' : 'hide']();
                    }, scope: this
                },
                ui: 'action',
                scale: 'medium',
                margin: '0 2px 0 0'
            })
        ];
    },

    initComponent: function () {
        var me = this;
        

        Taco.model.CheckoutSettings.load(123, {
            scope: this,
            failure: function () {
                // there should be a message here
            },
            success: function (record) {
            },
            callback: function (record) {
                me.record.checkoutSettings = record;
                me.addTools();
            }
        });


        Taco.model.PaymentSettings.load(123, {
            scope: this,
            failure: function () {
                // there should be a message here
            },
            success: function (record) {
            },
            callback: function (record) {
                me.record.PaymentSettings = record;
                me.initPaymentsUI();
            }
        });

        this.refundGrid = Ext.create('Ext.grid.Panel', {
            hidden: true,
            title: 'Refunds',
            cls: 'taco-payments-refund-grid',
            margin: '10 0 0 0',
            emptyText: 'There are no refunds to display',
            viewConfig: {
                deferEmptyText: false
            },
            store: this.record.refunds(),
            columns: [{
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                text: 'Date',
                flex: 1,
                format: 'Y-m-d H:i:s'
            }, {
                dataIndex: 'amount',
                text: 'Amount',
                flex: 1,
                renderer: function (value, meta, record) {
                    if (!value) return "-Failure-";
                    return me.record.formatCurrency(value);
                }
            }, {
                dataIndex: 'payment',
                text: 'Refund Method',
                flex: 2,
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber}'
                ]),
                renderer: function (value, meta, record) {
                    var paymentType = value.paymentType;

                    if (paymentType === 'CreditCard') {
                        return meta.column.cardTemplate.apply(value);
                    } else if (value.storeCreditCode && paymentType === 'StoreCredit') {
                        return ('Store Credit: ' + value.storeCreditCode);
                    } else if (paymentType === 'GiftCard') {
                        return ('GiftCard: ' + value.cardNumber);
                    }

                    if (paymentType === 'token') {
                        return value.tokenType;
                    }

                    return value.paymentType;
                }
            }, {
                dataIndex: 'reason',
                text: 'Reason',
                flex: 2,
                renderer: function (value) {
                    return Ext.String.htmlEncode(value);
                }
            }, {
                dataIndex: 'createdBy',
                text: 'User',
                renderer: function(value) {
                    var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function (u) { return u.id === value; });

                    if (!user) return ' ';

                    return Ext.String.format('{0} {1}', user.firstName, user.lastName);
                },
                flex: 1
            }, {
                xtype: 'taco.menucolumn',
                menuItems: [{
                    text: 'Resend Email',
                    menuColumnHandler: function (item, eventData) {
                        var cfg = {
                            type:"refund",
                            jsonData: {
                                orderId: eventData.record.get('orderId'),
                                refundId: eventData.record.get('id')
                            }
                        };

                        this.record.resendEmail(cfg);
                    }
                }]
            }]
        });

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-payment'].join(' ');

        // after the record is reloaded we will need to refresh the ui
        this.mon( this.record,"aftercommit", this.onRecordChange, this);
        
        // initialize the ui
        // this will be called every time the record is updated
        me.bodyCont = Ext.create('Ext.container.Container', {
            items: []
        });
        me.initUI();
        
        
        me.items = [me.bodyCont, me.refundGrid];

        this.callParent(arguments);
        this.addEvents(['rerender']);

        this.refundGrid.mon(this, {
            boxready: {
                scope: this,
                fn: function () {
                    this.refundGrid.setVisible(!!this.refundGrid.getStore().getCount());
                }
            },
            rerender: {
                scope: this,
                fn: function () {
                    var store = this.refundGrid.getStore();
                    var refunds = this.record.refunds().getRange();

                    store.removeAll();
                    store.add(refunds);
                    this.refundGrid.setVisible(!!store.getCount());
                }
            }
        });
    },
    isGatewayGiftCardEnabled: function () {
        if (this.record.checkoutSettings) {
            return this.record.checkoutSettings.get('cardGatewayMap').find(function (card) {
                return card.cardType === 'GIFTCARD' && card.isEnabled
            });
        }
    },
    isPurchaseOrderEnalbled: function () {
        var checkoutSettings = this.record && this.record.checkoutSettings && this.record.checkoutSettings.get('purchaseOrder') ? this.record.checkoutSettings.get('purchaseOrder').isEnabled : false;
        var customerSettings = this.record.customer && this.record.customer.raw.purchaseOrderAccount ? this.record.customer.raw.purchaseOrderAccount.isEnabled : false;

        return checkoutSettings && customerSettings;
    },

    getNewPaymentActions: function() {
        var me = this;

        function makeAction(text, cls, itemId) {
            return Ext.create('Ext.Action', {
                text: text,
                itemId: itemId,
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

        var actions = me.paymentActions = {
            addPurchaseOrder: makeAction('Purchase Order', 'Taco.view.order.modal.AddPurchaseOrder', 'purchaseOrderOption'),
            addCreditCard: makeAction('Credit Card', 'Taco.view.order.modal.AddPayment', 'creditCardOption'),
            requestCheck: makeAction('Check', 'Taco.view.order.modal.RequestCheck', 'checkOptions'),
            addManualCreditCard: makeAction('Credit Card (Manual)', 'Taco.view.order.modal.AddPaymentManual', 'creditCardManualOption'),
            addEcommerceGiftCard: makeAction('eCommerce Gift Card', 'Taco.view.order.modal.AddEcommerceGiftCard', 'eCommerceGiftCardOption'),
            addStoreCredit: makeAction('Store Credit', 'Taco.view.order.modal.AddEcommerceGiftCard', 'storeCreditOption')
        };

        if (me.isGatewayGiftCardEnabled()) {
            actions.addGiftCard = makeAction('Gift Card', 'Taco.view.order.modal.AddGiftCard', 'giftCardOption');
        }

        return Ext.Object.getValues(actions);
    },
    
    // initialize the views and actions menu
    initUI: function () {
        var me = this;

        me.initHeader();
        //me.initPaymentsUI();
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

    initHeader: function () {
        var me = this,
            orderStatus = me.record.get('orderStatus'),
            canAddPayment = orderStatus !== 'Completed',
            paymentStatus = me.record.get('paymentStatus');
        
        this.setHeaderTitleStatus('Payments', paymentStatus);
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

        var isUnpaid = this.record.get("paymentStatus") === "Unpaid";
        var refundButton = this.down("#refundButton");
        if (refundButton) {
            refundButton.setDisabled(isUnpaid);
        }
        var refundsRefundButton = this.down("#refundsRefundButton");
        if (refundsRefundButton) {
            refundsRefundButton.setDisabled(isUnpaid);
        }

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