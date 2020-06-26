/**
 * @class Taco.view.order.modal.Refund
 */

Ext.define('Taco.view.order.modal.Refund', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'large',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Buttons.refund,
    height: 640,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    actions: [{
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        disabled: true,
        formBind: true
    }],

    config: {
        modalState: {
            collected: 0,
            refunded: 0,
            proposed: 0,
            page: 0,
            method: null,
            payment: null
        }
    },

    applyModalState: function (nextState) {
        var prevState = this.getModalState();

        return Ext.apply({}, nextState, prevState);
    },

    updateModalState: function (nextState, prevState) {
        if (!prevState) return;

        var form = this.getForm();
        var refundAmountField = form.getForm().findField('amount');
        var excessGroup = this.down('#allowExcessCreditGroup');
        var isCreditCard = nextState.method === 'CreditCard';
        var isExcess = nextState.proposed > Ext.Number.correctFloat(nextState.collected - nextState.refunded);
        

        // show or hide the credit card field and its help text
        form.getForm().findField('paymentId').setVisible(isCreditCard).setDisabled(!isCreditCard);

        // show or hide the refund amount field
        refundAmountField.setVisible(nextState.payment || (nextState.method === 'StoreCredit'));

        // set a hard maximum on the refund amount if refunding a credit card
        refundAmountField.emptyText = this.suggestRefund().toFixed(2);
        refundAmountField.applyEmptyText();
        refundAmountField.setMaxValue(isCreditCard ? this.suggestRefund() : Number.MAX_VALUE);
        refundAmountField.maxText = Ext.String.format(refundAmountField.initialConfig.maxText, this.order.formatCurrency(this.suggestRefund()));
        refundAmountField.validate();

        // show or hide the excess store credit "override" checkbox
        excessGroup.setVisible(isExcess && !isCreditCard).setDisabled(isCreditCard || !isExcess);
        excessGroup.validate();
        // this.down('#excessCreditError').update(nextState);
    },

    initComponent: function () {
        var me = this;
        var store = this.order.payments();
        var refunds = this.order.refunds();

        var ccStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.OrderPayment',
            data: store.queryBy(function (record) {

                var paymentData = {
                    amountCredited: record.get('amountCredited'),
                    amountCollected: record.get('amountCollected')
                };

                if (record.get('subpayments')) {
                    var subpaymentForThisOrder = record.get('subpayments').filter(function (subpayment) {
                        return subpayment.target.targetId == me.order.data.id;
                    })[0];

                    if (subpaymentForThisOrder) {
                        paymentData = {
                            amountCredited: subpaymentForThisOrder.amountCredited,
                            amountCollected: subpaymentForThisOrder.amountCollected
                        }
                    }
                }
                return (
                    !Ext.Array.contains(['StoreCredit', 'Check'], record.get('paymentType'))
                        && Ext.Array.contains(record.get('availableActions'), 'CreditPayment')
                        && paymentData.amountCollected - (paymentData.amountCredited || 0) > 0
                );
            }).getRange()
        });

        var transactionStore = Ext.create('Ext.data.Store', {
            groupDir: 'ASC',
            groupField: 'createDate',
            getGroupString: function (record) {
                return record.get('paymentId');
            },
            fields: [
                'transactionType',
                'transactionMethod',
                'paymentId',
                { type: 'date', name: 'createDate' },
                { type: 'number', name: 'amountCollected', defaultValue: 0 },
                { type: 'number', name: 'amountCredited', defaultValue: 0 }
            ],
            data: Ext.Array.map(store.getRange(), function (record) {
                var data = record.getData();

                data.paymentId = data.id;
                data.id = 'payment-' + data.id;
                data.transactionType = 'Payment';
                data.transactionMethod = (data.paymentType == "token" ? data.tokenType : data.paymentType);

                
                if (data.subpayments) {
                    var subpaymentForThisOrder = data.subpayments.filter(function (subpayment) {
                        return subpayment.target.targetId == me.order.data.id;
                    })[0];
                    if (subpaymentForThisOrder) {
                        data.amountCollected = subpaymentForThisOrder.amountCollected;
                        data.amountCredited = subpaymentForThisOrder.amountCredited;
                    }
                }

                return data;
            }).concat(Ext.Array.map(refunds.getRange(), function (record) {
                var data = record.getData();

                data.id = 'refund-' + data.id;
                data.transactionType = 'Refund';
                data.transactionMethod = (data.payment.paymentType == "token" ? data.payment.tokenType : data.payment.paymentType);
                data.amountCredited = data.amount;
                data.paymentId = data.transactionMethod === 'StoreCredit' ? data.orderId : data.payment.id;

                return data;
            })),
            filters: [
                function (item) {
                    return (item.raw.status != 'Voided' && item.raw.status != 'Declined');
                }
            ]
        });


        this.setModalState({
            collected: this.order.get('authorizationInfo').amountCollected,
            refunded: this.order.get('amountRefunded'),
            proposed: 0
        });

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            height: 240,
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.transaction_summary,
            store: transactionStore,
            features: [{
                ftype: 'grouping',
                collapsible: false,
                groupHeaderTpl: [
                    'Payment'
                ]
            }],
            viewConfig: {
                deferEmptyText: false,
                emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.no_payments
            },
            tools: [{
                xtype: 'component',
                itemId: 'orderTotalCollected',
                data: this.getModalState(),
                tpl: [
                    '<span class="total-label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.total_collected + ': </span><span class="total-value">{collected:this.formatCurrency}</span>',
                    '<span class="total-label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.total_refunded + ': </span><span class="total-value">{refunded:this.formatCurrency}</span>',
                    {
                        formatCurrency: function (value) {
                            return me.order.formatCurrency(value);
                        }
                    }
                ],
                style: {
                    fontSize: '16px',
                    lineHeight: '30px'
                }
            }],
            columns: [{
                dataIndex: 'transactionType',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.type,
                width: 100,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true
            }, {
                dataIndex: 'transactionMethod',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.payment_transaction,
                flex: 2,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber} ({expireMonth:leftPad(2, "0")}/{expireYear})'
                ]),
                giftCardTemplate: new Ext.XTemplate([
                    'GiftCard: {cardNumber}'
                ]),
                renderer: function (value, metaData, record) {
                    var type = record.get('transactionType');

                    if (value === 'CreditCard') {
                        return metaData.column.cardTemplate.apply(type === 'Payment' ? record.raw : record.raw.payment);
                    }

                    if (value === 'GiftCard') {
                        return metaData.column.giftCardTemplate.apply(type === 'Payment' ? record.raw : record.raw.payment);
                    }

                    return value;
                }
            }, {
                dataIndex: 'amountCollected',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.amount_collected,
                flex: 1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                renderer: function (value, metaData, record) {
                    var type = record.get('transactionType');

                    if (type === 'Refund') {
                        return '--';
                    }

                    return me.order.formatCurrency(value);
                }
            }, {
                dataIndex: 'amountCredited',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.amount_credited,
                flex: 1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                renderer: function (value, metaData, record) {
                    var method = record.get('transactionMethod');
                    var type = record.get('transactionType');

                    if (!value) {
                        return '';
                    }

                    return me.order.formatCurrency(value);
                }
            }]
        });

        this.setForm(Ext.create('Taco.core.ux.form.Form', {
            layout: 'vbox',
            items: [{
                xtype: 'container',
                minHeight: 115,
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                items: [{
                    xtype: 'combobox',
                    name: 'refundMethod',
                    id : 'refundMethod',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Label.refund_method,
                    margin: 0,
                    allowOnlyWhitespace: false,
                    editable: false,
                    forceSelection: true,
                    queryMode: 'local',
                    store: [
                        ['CreditCard', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.direct_refund],
                        ['StoreCredit', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.store_credit]
                    ],
                    listeners: {
                        change: {
                            scope: this,
                            fn: function (field, nextValue, prevValue) {
                                this.setModalState({
                                    method: nextValue
                                });
                            }
                        }
                    }
                }, {
                    xtype: 'combobox',
                    name: 'paymentId',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Label.payment_transaction,
                    width: 300,
                    margin: '0 0 0 20',
                    hidden: true,
                    disabled: true,
                    allowBlank: false,
                    editable: false,
                    forceSelection: true,
                    queryMode: 'local',
                    store: ccStore,
                    valueField: 'id',
                    displayField: 'cardNumber',
                    displayTpl: [
                        '<tpl for=".">',
                            '<tpl if="paymentType == \'GiftCard\'">GiftCard: {cardNumber}',
                            '<tpl else>',
                                '<tpl if="paymentType == \'CreditCard\'">{[values.cardType]}: {[values.cardNumber]}',
                                 ' ({amountCollected:siteCurrency(', me.order.get('siteId'), ')})',
                                '<tpl elseif="paymentType ==\'token\'">',
                        '{tokenType} ({amountCollected:siteCurrency(', me.order.get('siteId'), ')})',
                                '<tpl else>{[values.paymentType]}: {[values.billingContact.email]}',
                                '</tpl>',
                            '</tpl>',
                        '</tpl>'
                    ],
                    listConfig: {
                        getInnerTpl: function (displayField) {
                            var siteId = me.order.get('siteId');

                            var tpl = [
                                '<tpl if="paymentType == \'GiftCard\'">',
                                '   GiftCard: {cardNumber} ({amountCollected:siteCurrency(', siteId, ')})',
                                '<tpl else>',
                                    '<tpl if="paymentType == \'CreditCard\'">',
                                        '{cardType}: {cardNumber} ({amountCollected:siteCurrency(', siteId, ')})',
                                    '<tpl elseif="paymentType == \'token\'">',
                                        '{tokenType} ({amountCollected:siteCurrency(', siteId, ')})',
                                    '<tpl else>',
                                        '{paymentType}: {billingContact.email}',
                                    '</tpl>',
                                '</tpl>',
                            ].join(' ');

                            return tpl;
                        }
                    },
                    listeners: {
                        beforehide: {
                            scope: this,
                            fn: function (field) {
                                field.clearValue();
                            }
                        },
                        // show: {
                        //     scope: this,
                        //     fn: function (field) {
                        //         if (ccStore.getCount() === 1) {
                        //             field.setValue(ccStore.first());
                        //         }
                        //     }
                        // },
                        change: {
                            scope: this,
                            fn: function (field, nextValue, prevValue) {
                                this.setModalState({
                                    payment: nextValue ? ccStore.getById(nextValue).getData() : null
                                });
                            }
                        },
                        select: {
                            scope: this,
                            fn: function (combo, rec, eOpts) {

                                if (rec[0].get('paymentType').toLowerCase() === 'purchaseorder'
                                        && combo.up().down('#refundMethod').rawValue === "Direct Refund") {
                                    // show text field below.
                                    combo.up().up().down('#poInformation').show();
                                }
                            }
                        }
                    }
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.refund_amount,
                    margin: '0 0 0 20',
                    hidden: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    allowBlank: false,
                    minValue: Number.MIN_VALUE,
                    emptyText: this.suggestRefund().toFixed(2),
                    maxText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.amount_less_equal_zero,
                    minText: (Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.amount_greater_than + ' ' + this.order.formatCurrency(0)),
                    listeners: {
                        change: {
                            scope: this,
                            fn: function (field, nextValue, prevValue) {
                                this.setModalState({
                                    proposed: nextValue > 0 ? nextValue : 0
                                });
                            }
                        }
                    }
                }, {
                    xtype: 'checkboxgroup',
                    itemId: 'allowExcessCreditGroup',
                    hidden: true,
                    disabled: true,
                    flex: 1,
                    margin: '41 0 0 20',
                    // columns: 1,
                    // vertical: true,
                    allowBlank: false,
                    msgTarget: 'side',
                    items: [{
                        name: 'allowExcessCredit',
                        boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Label.allow_credit_exceed,
                        inputValue: true
                    }]
                // }, {
                //     xtype: 'component',
                //     itemId: 'excessCreditError',
                //     height: 30,
                //     padding: '9 0 7 30',
                //     data: {},
                //     tpl: [
                //         '<tpl if="method == \'CreditCard\'">',
                //             '<tpl if="this.getSuggestedRefund(proposed)">',
                //                 'Amount must be less than or equal to {[this.getSuggestedRefund(values.proposed)]}',
                //             '</tpl>',
                //         '</tpl>',
                //         {
                //             getSuggestedRefund: function (proposed) {
                //                 var refund = me.suggestRefund();
                                
                //                 return proposed > refund ? me.order.formatCurrency(refund) : false;
                //             }
                //         }
                //     ],
                //     style: {
                //         'color': '#666',
                //         'font-size': '14px',
                //         'line-height': '1'
                //     }
                }]
            }, {
                xtype: 'component',
                name: 'poInformation',
                id: 'poInformation',
                width: '100%',
                html: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.purchase_order_msg,
                hidden: true
            }, {
                xtype: 'textarea',
                name: 'reason',
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.reason,
                width: '100%',
                rows: 3,
                margin: 0
            }, {
                xtype: 'checkboxgroup',
                itemId: 'allowSaveGroup',
                hidden: true,
                allowBlank: false,
                items: [{
                    name: 'allowSave',
                    boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.GridHeader.allow_save,
                    checked: true
                }]
            }]
        }));

        this.items = [this.grid, this.getForm()];

        this.callParent(arguments);
    },

    onBoxReady: function () {
        this.addCls('taco-refund-modal');
    },

    suggestRefund: function () {
        var me = this;
        var state = this.getModalState();
        var payment = state.payment;

        if (payment && payment.subpayments) {
            var subpaymentForThisOrder = payment.subpayments.filter(function (subpayment) {
                return subpayment.target.targetId == me.order.data.id;
            })[0];
            if (subpaymentForThisOrder) {
                payment = subpaymentForThisOrder;
            }

        }
        var suggestion = parseFloat((payment ? payment.amountCollected - payment.amountCredited - payment.amountRefunded : state.collected - state.refunded).toFixed(2));
        return suggestion > 0 ? suggestion : 0;
    },

    toggleSave: function (enable) {
        this.getForm().down('#allowSaveGroup').setValue({
            allowSave: !!enable
        });
    },

    doSave: function () {
        var values = this.getForm().getValues();

        this.toggleSave(false);
        this.setLoading(true, this.body);

        this.order.createRefund(values, {
            success: function () {
                this.toggleSave(true);
                this.setLoading(false, this.body);
                this.order.reload();
                this.saveSuccess();
            },
            failure: function () {
                this.toggleSave(true);
                this.setLoading(false, this.body);
            },
            scope: this
        });
    }
});
