
/**
 * @class  Taco.view.order.widget.GiftCardGrid
 * @author James Zetlen
 * @description The grid for gift cards in the order gift card dialog.
 */
Ext.define('Taco.view.order.widget.GiftCardGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-order-gift-card-grid',
    //requires:['Taco.view.product.variant.Modal'],

    disableSelection: true,
    sortableColumns: false,
    enableColumnHide: false,
    overOrderBalanceError: "Gift cards cannot apply more than the total order balance.",
    overCardBalanceError: "You cannot apply more than the amount of a gift card's balance.",
    plugins: [
        {
            ptype: 'cellediting',
            clicksToEdit: 1,
            listeners: {
                beforeedit: function (editor, context) {
                    this.editingContext = context;
                    if (!context.value && context.field === "amtToApply") {
                        context.record.set('amtToApply', Math.min(context.record.get('currentBalance'), context.grid.getOrderBalance() - context.grid.getTotalCardBalance()));
                    }
                },
                edit: function (editor, e) {
                    e.grid.fireEvent('amountchanged', e.grid.getTotalCardBalance());
                }
            }
        }
    ],
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
    emptyText: "This customer has no gift cards or store credits.",
    initComponent: function () {
        var me = this;
        this.orderBalance = this.order.get('authorizationInfo').captureAmount || 0;

        this.columns = [
        {
            text: 'Card Code',
            dataIndex: 'code',
            flex: 1
        },
        {
            text: 'Balance',
            dataIndex: 'currentBalance',
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                }
        },
        {
            dataIndex: 'amtToApply',
            text: 'Amt. to Apply',
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                },
            editor: {
                xtype: 'currencyfield',
                    currencyCode: this.order.getCurrencyCode(),
                decimalPrecision: 2,
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
            text: 'Remainder to Acct.',
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
    startInitialEdit: function () {
        if (this.store.count() > 0) {
            this.findPlugin('cellediting').startEditByPosition({ row: 0, column: 2 });
        }
    },
    startEditAtCode: function (code) {
        this.findPlugin('cellediting').startEdit(this.store.getById(code), 2);
    },
    
    
});