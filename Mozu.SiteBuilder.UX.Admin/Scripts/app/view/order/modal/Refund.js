/**
 * @class Taco.view.order.modal.Refund
 */

Ext.define('Taco.view.order.modal.Refund', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'large',
    title: 'Refund',

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
        var isExcess = nextState.proposed > (nextState.collected - nextState.refunded);

        // show or hide the credit card field and its help text
        form.getForm().findField('paymentId').setVisible(isCreditCard).setDisabled(!isCreditCard);

        // show or hide the refund amount field
        refundAmountField.setVisible(nextState.payment || (nextState.method === 'StoreCredit'));

        // set a hard maximum on the refund amount if refunding a credit card
        refundAmountField.emptyText = this.suggestRefund().toFixed(2);
        refundAmountField.applyEmptyText();
        refundAmountField.setMaxValue(isCreditCard ? this.suggestRefund() : Number.MAX_VALUE);
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
                return (
                    Ext.Array.contains(['CreditCard', 'Paypal', 'PaypalExpress'], record.get('paymentType'))
                        && Ext.Array.contains(record.get('availableActions'), 'CreditPayment')
                        && record.get('amountCollected') - (record.get('amountCredited') || 0) > 0
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
                { type: 'number', name: 'amountRefunded', defaultValue: 0 }
            ],
            data: store.getRange().map(function (record) {
                var data = record.getData();

                data.paymentId = data.id,
                data.id = 'payment-' + data.id;
                data.transactionType = 'Payment',
                data.transactionMethod = data.paymentType;
                data.amountRefunded = data.amountCredited;

                return data;
            }).concat(refunds.getRange().map(function (record) {
                var data = record.getData();

                data.id = 'refund-' + data.id;
                data.transactionType = 'Refund',
                data.transactionMethod = data.payment.paymentType;
                data.amountRefunded = data.amount;
                data.paymentId = data.transactionMethod === 'StoreCredit' ? data.orderId : data.payment.id;

                return data;
            }))
        });

        this.setModalState({
            collected: this.order.get('authorizationInfo').amountCollected,
            refunded: this.order.get('amountRefunded'),
            proposed: 0
        });

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            height: 240,
            title: 'Transaction Summary',
            store: transactionStore,
            features: [{
                ftype: 'grouping',
                collapsible: false,
                groupHeaderTpl: [
                    'Payment:',
                    '{[this.inspect(values)]}',
                    {
                        inspect: function (values) {
                            return 'hello world';
                        }
                    }
                ]
            }],
            viewConfig: {
                deferEmptyText: false,
                emptyText: 'No payments available to refund. Check to make sure the payments have been captured.'
            },
            tools: [{
                xtype: 'component',
                itemId: 'orderTotalCollected',
                data: this.getModalState(),
                tpl: [
                    '<span class="total-label">Total Collected: </span><span class="total-value">{collected:this.formatCurrency}</span>',
                    '<span class="total-label">Total Refunded: </span><span class="total-value">{refunded:this.formatCurrency}</span>',
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
                text: 'Type',
                width: 100,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true
            }, {
                dataIndex: 'transactionMethod',
                text: 'Payment Transaction',
                flex: 2,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber} ({expireMonth:leftPad(2, "0")}/{expireYear})'
                ]),
                renderer: function (value, metaData, record) {
                    var type = record.get('transactionType');

                    if (value === 'CreditCard') {
                        return metaData.column.cardTemplate.apply(type === 'Payment' ? record.raw : record.raw.payment);
                    }

                    return value;
                }
            }, {
                dataIndex: 'amountCollected',
                text: 'Amount Collected',
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
                dataIndex: 'amountRefunded',
                text: 'Amount Refunded',
                flex: 1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                renderer: function (value, metaData, record) {
                    var method = record.get('transactionMethod');
                    var type = record.get('transactionType');

                    if (method === 'Check' || (method === 'StoreCredit' && type === 'Payment')) {
                        return '--';
                    }

                    return me.order.formatCurrency(value);
                }
            }]
        });

        this.setForm(Ext.create('Taco.core.ux.form.Form', {
            layout: 'auto',
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
                    fieldLabel: 'Refund Method',
                    margin: 0,
                    allowOnlyWhitespace: false,
                    editable: false,
                    forceSelection: true,
                    queryMode: 'local',
                    store: [
                        ['CreditCard', 'Direct Refund'],
                        ['StoreCredit', 'Store Credit']
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
                    fieldLabel: 'Payment Transaction',
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
                            '<tpl if="paymentType == \'CreditCard\'">{[values.cardType]}: {[values.cardNumber]}',
                                ' ({amountCollected:siteCurrency(', me.order.get('siteId'), ')})',
                            '<tpl else>{[values.paymentType]}: {[values.billingContact.email]}',
                            '</tpl>',
                        '</tpl>'
                    ],
                    listConfig: {
                        getInnerTpl: function (displayField) {
                            var siteId = me.order.get('siteId');

                            var tpl = [
                                '<tpl if="paymentType == \'CreditCard\'">',
                                    '{cardType}: {cardNumber} ({amountCollected:siteCurrency(', siteId, ')})',
                                '<tpl else>',
                                    '{paymentType}: {billingContact.email}',
                                '</tpl>'
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
                        }
                    }
                }, {
                    xtype: 'currencyfield',
                    name: 'amount',
                    fieldLabel: 'Refund Amount',
                    margin: '0 0 0 20',
                    hidden: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    allowBlank: false,
                    minValue: Number.MIN_VALUE,
                    emptyText: this.suggestRefund().toFixed(2),
                    maxText: ('Amount must be less than or equal to ' + this.order.formatCurrency(this.suggestRefund())),
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
                        boxLabel: 'Allow credit to exceed amount collected',
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
                xtype: 'textarea',
                name: 'reason',
                fieldLabel: 'Reason',
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
                    boxLabel: 'Allow save',
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
        var state = this.getModalState();
        var payment = state.payment;
        var suggestion = parseFloat((payment ? payment.amountCollected - payment.amountCredited : state.collected - state.refunded).toFixed(2));

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
