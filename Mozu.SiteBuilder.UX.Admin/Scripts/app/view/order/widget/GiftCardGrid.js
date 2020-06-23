
/**
 * @class  Taco.view.order.widget.GiftCardGrid
 * @author James Zetlen
 * @description The grid for gift cards in the order gift card dialog.
 */
Ext.define('Taco.view.order.widget.GiftCardGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-order-gift-card-grid',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Taco.core.ux.form.CurrencyField',
        'Ext.grid.column.Boolean'
    ],
    
    sortableColumns: false,
    enableColumnHide: false,
    overOrderBalanceError: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.gift_card_cant_apply,
    overCardBalanceError: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.more_than_gift_balance,
    
    getOrderBalance: function () {
        return this.orderBalance;
    },
    getTotalCardBalance: function () {
        return this.store.sum('amtToApply');
    },

    viewConfig: {
        stripeRows: false,
        onRowFocus: Ext.emptyFn,
        markDirty: false,
        deferEmptyText: false
    },
    deferEmptyText: false,
    emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.no_gift_cards,
    // the index of the column to pass focus too by default when the grid gains focus via keyboard tab key;
    defaultFocusColumn: 2,
    initComponent: function () {
        var me = this;
        this.orderBalance = this.order.getNewPaymentAmountHint();

        this.selModel = Ext.create('Ext.selection.CellModel', {
            enableFieldTabbing: true
            //    enableKeyNav: false // to disable cell traversal when clicks on keys(es: TAB) 
        });

        Ext.apply(me, {
            plugins: [
                    Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 1,
                        listeners: {
                            beforeedit: function (editor, context) {
                                this.editingContext = context;
                                if (!context.value && context.field === "amtToApply") {
                                    context.record.set('amtToApply', Math.min(context.record.get('currentBalance'), context.grid.getOrderBalance() - context.grid.getTotalCardBalance()));
                                }
                            },
                            canceledit: function (editor, e) {                                
                                e.record.set('amtToApply', 0);
                            },
                            edit: function (editor, e) {
                                e.grid.fireEvent('amountchanged', e.grid.getTotalCardBalance());
                            }
                        }
                    })
            ]
        });

        this.columns = [
        {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.card_code,
            dataIndex: 'code',
            flex: 1
        },
        {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.balance,
            dataIndex: 'currentBalance',
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                }
        },
        {
            dataIndex: 'amtToApply',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amt_to_apply,
            renderer: function (value) {
                return me.order.formatCurrency(value);
            },
            
            editor: {
                xtype: 'currencyfield',
                currencyCode: this.order.getCurrencyCode(),
                decimalPrecision: 2,
                showBorder: true,
                selectOnFocus:true,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                msgTarget: 'giftCardErrorEl',
                    validator: function (val) {
                    var context = this.findParentByType('grid').findPlugin('cellediting').editingContext,
                        record = context.record,
                        grid = context.grid,
                        orderBalance = grid.getOrderBalance();

                    val = parseFloat(val);
                    if (val > orderBalance) return grid.overOrderBalanceError;
                    if (val > record.get('currentBalance')) return grid.overCardBalanceError;
                    // optimizing for the upper two calls reduces the amount of times this expensive call is made
                    if (grid.getTotalCardBalance() + val - record.get('amtToApply') > orderBalance) return grid.overOrderBalanceError;
                    return true;

                }
            }
        },
        {
            dataIndex: 'remainderToAccount',
            align: 'center',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.remainder_to_acct,
            xtype: 'booleancolumn',
            width: 180,
            trueText: 'Yes',
            falseText: 'No',

            editor: {
                xtype: 'checkbox'
            }

        }
        ];
        this.callParent(arguments);
    },
    startInitialFocus: function () {
        var me = this;
        if (me.rendered && this.store.count() > 0) {
            me.getSelectionModel().setCurrentPosition({ row: 0, column: 2 });
            me.view.focusRow(0);
        }
    }
});