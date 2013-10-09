/**
 * @class Taco.view.order.modal.AddRefund
 */

Ext.define('Taco.view.order.modal.AddRefund', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',
    title: 'Add Refund',

    layout: {
        type: 'fit'
    },
    
    initComponent: function () {
        var me = this;

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'cardType',
                'cardNumber',
                'amountCollected',
                'amountAuthorized',
                'amountCredited',
                'paymentType',
                'status',
                {
                    name: 'amountToRefund',
                    type: 'number',
                    defaultValue: 0
                }
            ],
            data: this.order.data.payments,
            filters: [
                function (item) {
                    return (item.raw.amountCollected);
                }
            ]
        });

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: this.store,
            viewConfig: {
                deferEmptyText: false,
                emptyText: 'No payments available to refund. Check to make sure the payments have been captured.',
                overItemCls: 'taco-grid-row-over',
                stripeRows: false
            },
            columns: [{
                text: 'Payment details',
                flex:1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'cardType',
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber}'
                ]),
                checkTemplate: new Ext.XTemplate([
                    'Check'
                ]),
                renderer: function (value, metaData, record) {
                    var str = '';

                    if (record.get('paymentType') === 'CreditCard') {
                        str = metaData.column.cardTemplate.apply(record.getData());
                    } else {
                        str = metaData.column.checkTemplate.apply(record.getData());
                    }

                    return str;
                }
            }, {
                text: 'Amount Collected',
                width:150,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'amountCollected',
                renderer: Ext.util.Format.usMoney
            }, {
                text: 'Refund Amount',
                width:150,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                tdCls: 'editableCell',
                dataIndex: 'amountToRefund',
                editor: {
                    xtype: 'numberfield',
                    hideTrigger: true,
                    selectOnFocus: true,
                    mouseWheelEnabled:false,
                    minValue: 0
                },
                renderer: Ext.util.Format.usMoney
            }],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        this.items = [this.grid];
        
        this.callParent(arguments);

        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });

        this.grid.on({
            edit: {
                scope: this,
                fn: 'checkValidity'
            },
            viewready: {
                scope: this,
                fn: 'checkValidity'
            }
        });
    },

    checkValidity: function () {
        var primaryAction = this.down('#primaryAction'),
            refundIndex;

        // determine if any record in the store has a refund of more than 0 dollars
        refundIndex = this.store.findBy(function (item) {
            return item.get('amountToRefund') > 0;
        });

        // if such a record was found, disable the save button
        primaryAction.setDisabled(refundIndex === -1);
    },
    
    save: function () {
        var me = this,
            payments = [];

        this.store.each(function (item) {
            if (item.get('amountToRefund') > 0) {
                payments.push({
                    orderId: this.order.getId(),
                    returnId: this.record.getId(),
                    paymentType: 'CreditCard',
                    amount: item.get('amountToRefund'),
                    paymentId: item.get('id')
                });
            }
        }, this);
        
        // me.setLoading(true, me.body);
        
        this.record.performPaymentAction(payments, {
            success: function () {
                // me.setLoading(false, me.body);
            }
        });
    }
});
