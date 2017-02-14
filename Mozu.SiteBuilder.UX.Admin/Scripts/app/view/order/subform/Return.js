/**
 * @class Taco.view.order.subform.Return
 */
Ext.define('Taco.view.order.subform.Return', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ProcessReturnPanel',
        'Taco.view.order.widget.OrderReturns',
        'Taco.view.order.widget.ReturnableItemGrid',
        'Taco.view.order.widget.ReturnableItemTree',
        'Taco.core.ux.PanelHeaderStat',
        'Taco.model.Order'
    ],

    title: 'Returns',
    itemId: 'orderReturn',

    config: {
        originalRecord: null,
        record: null,
        returnsStore: null
    },

    beforeShow: function () {
        var me = this;
        var header = this.getHeader();
        var container = header.el.dom.parentElement.childNodes[1];

        header.el.dom.style.display = 'none';

        // Offset top style added by ext to container
        var container = document.getElementsByClassName('taco-orderform-returns')[0].children[1];
        container.style.marginTop = '-25px';

        this.setLoading(true);
        var store = this.record.getReturnsStore();

        store.load(function () {
            me.setLoading(false);
        });

        this.initCreateButton();
    },

    tabChange: function (tabPanel, newTab) {
        console.log(newTab);
    },

    initComponent: function () {
        this.cls += " " + Taco.baseCSSPrefix + 'orderform-returns';
        this.initUI();
        this.callParent(arguments);
    },

    destroyUI: function () {
        this.removeAll();
        this.createButton = this.returnableItemsErrorEl = this.returnableItems = null;
    },

    initUI: function () {        
        var me = this,
            record = this.record;

        var store = record.getReturnsStore();
        this.setReturnsStore(store);

        this.setLoading(true);

        // if (returnStatus && returnStatus !== 'None') {
        store.load(function () {
            me.orderReturns.store.loadData(arguments[0]);
            me.setLoading(false);
        });

        this.createButton = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Create Return',
            scope: this,
            handler: this.handleCreateClick
        });

        this.returnableItemsErrorEl = Ext.widget({
            xtype: 'component',
            renderTpl: '<div role="alert" aria-live="polite" class="x-form-invalid-under" colspan="2"><ul class="x-list-plain"><li id="{id}-messageEl">{message}</li></ul></div>',
            childEls: ['messageEl'],
            height: 14,
            setError: function (s) {
                s = Ext.util.Format.htmlEncode(s);
                if (this.rendered) {
                    this.messageEl.setHTML(s);
                } else {
                    this.renderData = {
                        message: s
                    };
                }
                if (this.ownerCt) this.ownerCt.doLayout();
            }
        });

        this.initCreateButton();

        //this.returnableItemsGrid = Ext.create('Taco.view.order.widget.ReturnableItemGrid', {
        //    order: this.record,
        //    returnsStore: store,
        //    //tools: [this.createButton],
        //    margin: '10px 0 10px 0',
        //    padding: '0 1px 0 0'
        //});
        
        this.returnableItems = Ext.create('Taco.view.order.widget.ReturnableItemTree', {
            order: this.record,
            returnsStore: store,
            tools: [this.createButton],
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0'
        });

        this.orderReturns = Ext.create('Taco.view.order.widget.OrderReturns', {
            store: store
        });

        this.items = [
            //this.returnableItemsGrid,
            this.returnableItems,
            {
                xtype: 'container',
                margin: '10px 0 0 0',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'end'
                },
                items: [this.returnableItemsErrorEl]
            },
            this.orderReturns
        ];
    },

    initCreateButton: function () {
        var orderStatus = this.record.get('orderStatus');
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        var enabled = orderStatus === 'Completed' || (orderStatus === 'Processing' && (fulfillmentStatus === 'Fulfilled' || fulfillmentStatus === 'PartiallyFulfilled'));

        this.createButton.setDisabled(!enabled);
        this.returnableItemsErrorEl.setError(enabled ? "" : "This order must be at least partially fulfilled before a return can be initiated.");
    },

    refreshReturnableItemsGrid: function () {
        this.returnableItems.reload();
    },

    createReturn: function (type, items) {
        return this.getReturnsStore().add({
            originalOrderId: this.record.getId(),
            returnType: type,
            items: Ext.Array.map(items, function (item) {
                return {
                    orderItemId: item.get('orderItemId'),
                    orderLineId: item.get('orderLineId'),
                    productCode: item.get('productCode'),
                    quantity: item.get('quantity'),
                    returnReason: item.get('reason'),
                    returnType: item.get('returnType'),
                    orderItemOptionAttributeFQN: item.get('orderItemOptionAttributeFQN'),
                    excludeProductExtras: item.get('excludeProductExtras')
                };
            })
        })[0];
    },

    handleCreateClick: function () {
        var me = this;

        this.returnableItemsErrorEl.setError('');
        var returnsStore = this.getReturnsStore();
        var erroredReturns = [],
            selected = this.returnableItems.getSelectionModel().getSelection();

        if (selected.length === 0) {
            this.returnableItemsErrorEl.setError('Please select items to return.');
            return;
        }

        if (Ext.Array.some(selected, function (item) {
            var qf = item.get('quantityFulfilled');
            var qr = item.get('quantityReturned');

            return (item.get('quantity') > (qf - qr));
        })) {
            this.returnableItemsErrorEl.setError('Item \'Quantity to Return\' exceeds \'Quantity Fulfilled\'.');
            return;
        }

        // if any items are checked for return, but have quantity == 0, reject this call.
        if (Ext.Array.some(selected, function (item) {
            return !item.get('quantity');
        })) {
            this.returnableItemsErrorEl.setError('Please add a return quantity to all selected items.');
            return;
        }

        erroredReturns = Ext.Array.filter(selected, function (item) { return item.get('reason') === 'Select'; });
        if (erroredReturns.length > 0) {
            this.returnableItemsErrorEl.setError('Please choose a return reason.');
            return;
        }

        erroredReturns = Ext.Array.filter(selected, function (item) { return item.get('returnType') === 'Select'; });
        if (erroredReturns.length > 0) {
            this.returnableItemsErrorEl.setError('Please choose a return resolution.');
            return;
        }

        // Adds a return to the store. Need to sync the store to save it.
        // The Return.ReturnType is deprecated in favor of specifying return type at the item level.
        // Use "Replace" for backward compatibility since it provided the most flexibility in the old return state machine.
        var newReturnRecord = this.createReturn("Replace", selected);

        this.setLoading(true);
        returnsStore.sync({
            callback: function () {
                this.setLoading(false);
                this.createButton.setDisabled(false);
            },
            success: function () {
                // after we add the new return we need to reload the order and regenerate the returnable items grid store
                this.record.reload({
                    success: me.refreshReturnableItemsGrid,
                    scope: me
                });
            },
            failure: function (batch) {
                returnsStore.remove(newReturnRecord);
                var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: this
        });
    },

    onDestroy: function () {
        this.callParent(arguments);
    }
});