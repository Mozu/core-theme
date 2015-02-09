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
        var isExcess = nextState.proposed > nextState.collected;

        // show or hide the credit card field and its help text
        form.getForm().findField('paymentId').setVisible(isCreditCard).setDisabled(!isCreditCard);
        this.down('#amountAvailable').update(nextState);

        // set a hard maximum on the refund amount if refunding a credit card
        refundAmountField.emptyText = this.suggestRefund().toFixed(2);
        refundAmountField.applyEmptyText();
        refundAmountField.setMaxValue(isCreditCard ? this.suggestRefund() : Number.MAX_VALUE);
        refundAmountField.validate();

        // show or hide the excess store credit "override" checkbox
        excessGroup.setVisible(isExcess && !isCreditCard).setDisabled(isCreditCard || !isExcess);
        excessGroup.validate();
        this.down('#excessCreditError').update(nextState);
    },

    initComponent: function () {
        var me = this;
        var store = this.order.payments();
        var ccStore;

        this.setModalState({
            collected: this.order.get('authorizationInfo').amountCollected,
            refunded: this.order.get('amountRefunded'),
            proposed: 0
        });

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            height: 180,
            margin: '0 0 16 0',
            title: 'Order Payment History',
            store: store,
            viewConfig: {
                deferEmptyText: false,
                emptyText: 'No payments available to refund. Check to make sure the payments have been captured.'
            },
            columns: [{
                text: 'Payment Details',
                flex: 2,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'cardType',
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber}'
                ]),
                renderer: function (value, metaData, record) {
                    if (record.get('paymentType') === 'CreditCard') {
                        return metaData.column.cardTemplate.apply(record.getData());
                    }

                    return record.get('paymentType');
                }
            }, {
                text: 'Amount Collected',
                flex: 1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'amountCollected',
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                }
            }, {
                text: 'Amount Refunded',
                flex: 1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'amountCredited',
                renderer: function (value, metaData, record) {
                    if (record.get('paymentType') === 'Check') {
                        return '--';
                    }

                    return me.order.formatCurrency(value);
                }
            }]
        });

        ccStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.OrderPayment',
            data: store.queryBy(function (record) {
                return record.get('paymentType') === 'CreditCard' && record.get('amountCollected') - (record.get('amountCredited') || 0) > 0;
            }).getRange()
        });

        this.setForm(Ext.create('Taco.core.ux.form.Form', {
            title: 'Refund Method',
            layout: 'auto',
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                    xtype: 'radiogroup',
                    itemId: 'refundMethodGroup',
                    width: 140,
                    columns: 1,
                    vertical: true,
                    allowBlank: false,
                    items: [{
                        name: 'refundMethod',
                        boxLabel: 'Direct Refund',
                        inputValue: 'CreditCard'
                    }, {
                        name: 'refundMethod',
                        boxLabel: 'Store Credit',
                        inputValue: 'StoreCredit'
                    }],
                    listeners: {
                        change: {
                            scope: this,
                            fn: function (field, nextValue, prevValue) {
                                var method = nextValue.refundMethod;

                                this.setModalState({
                                    method: method,
                                    payment: method === 'StoreCredit' ? null : this.getModalState().payment
                                });
                            }
                        }
                    }
                }, {
                    xtype: 'container',
                    width: 200,
                    height: 30,
                    items: [{
                        xtype: 'combobox',
                        name: 'paymentId',
                        width: 200,
                        margin: 0,
                        hidden: true,
                        disabled: true,
                        allowBlank: false,
                        editable: false,
                        forceSelection: true,
                        queryMode: 'local',
                        displayField: 'cardNumber',
                        displayTpl: '<tpl for=".">{[values.cardType]}: {[values.cardNumber]}</tpl>',
                        valueField: 'id',
                        emptyText: 'Select Card',
                        msgTarget: 'side',
                        store: ccStore,
                        listConfig: {
                            getInnerTpl: function (displayField) {
                                return '{cardType}: {cardNumber}';
                            }
                        },
                        listeners: {
                            beforehide: {
                                scope: this,
                                fn: function (field) {
                                    field.clearValue();
                                }
                            },
                            show: {
                                scope: this,
                                fn: function (field) {
                                    if (ccStore.getCount() === 1) {
                                        field.setValue(ccStore.first());
                                    }
                                }
                            },
                            change: {
                                scope: this,
                                fn: function (field, nextValue, prevValue) {
                                    this.setModalState({
                                        payment: nextValue ? ccStore.getById(nextValue).getData() : null
                                    });
                                }
                            }
                        }
                    }]
                }, {
                    xtype: 'component',
                    itemId: 'amountAvailable',
                    height: 40,
                    flex: 1,
                    data: this.getModalState(),
                    tpl: [
                        '<div class="total-label">Available for refund</div>',
                        '<div class="total-value">{[this.asCurrency(values)]}</div>',
                        {
                            asCurrency: function () {
                                return me.order.formatCurrency(me.suggestRefund());
                            }
                        }
                    ],
                    style: {
                        'padding-left': '30px'
                    }
                }]
            }, {
                xtype: 'container',
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'bottom'
                    },
                    items: [{
                        xtype: 'currencyfield',
                        name: 'amount',
                        fieldLabel: 'Refund Amount',
                        hideTrigger: true,
                        mouseWheelEnabled: false,
                        allowBlank: false,
                        minValue: Number.MIN_VALUE,
                        emptyText: this.suggestRefund().toFixed(2),
                        msgTarget: 'side',
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
                        margin: '0 0 0 30',
                        columns: 1,
                        vertical: true,
                        allowBlank: false,
                        items: [{
                            name: 'allowExcessCredit',
                            boxLabel: 'Allow credit to exceed amount collected',
                            inputValue: true
                        }]
                    }, {
                        xtype: 'component',
                        itemId: 'excessCreditError',
                        height: 30,
                        padding: '9 0 7 30',
                        data: {},
                        tpl: [
                            '<tpl if="method == \'CreditCard\'">',
                                '<tpl if="this.getSuggestedRefund(proposed)">',
                                    'Amount must be less than or equal to {[this.getSuggestedRefund(values.proposed)]}',
                                '</tpl>',
                            '</tpl>',
                            {
                                getSuggestedRefund: function (proposed) {
                                    var refund = me.suggestRefund();
                                    
                                    return proposed > refund ? me.order.formatCurrency(refund) : false;
                                }
                            }
                        ],
                        style: {
                            'color': '#666',
                            'font-size': '14px',
                            'line-height': '1'
                        }
                    }]
                }, {
                    xtype: 'textarea',
                    name: 'reason',
                    fieldLabel: 'Notes',
                    width: 500,
                    rows: 2,
                    margin: 0
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

        return payment ? payment.amountCollected - payment.amountCredited : state.collected - state.refunded;
    },

    doSave: function () {
        var values = this.getForm().getValues();

        this.order.createRefund(values, {
            success: function () {
                this.order.reload();
                this.saveSuccess();
            },
            scope: this
        });
    }
});
