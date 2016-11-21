/**
 * @class Taco.view.order.subform.Return
 */
Ext.define('Taco.view.order.subform.Return', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ProcessReturnPanel',
        'Taco.view.order.widget.ReturnableItemGrid',
        'Taco.core.ux.PanelHeaderStat',
        'Taco.model.Order'
    ],

    itemId: 'orderReturn',
    title: 'Returns',

    config: {
        originalRecord: null,
        record: null,
        returnsStore: null
    },

    beforeShow: function () {
        var me = this;
        this.setLoading(true);
        var store = this.record.getReturnsStore();

        store.load(function () {
            me.returnPanels.removeAll(true);
            me.initProcessReturnPanels(store);
            me.initHeader();
            me.setLoading(false);
        });

        this.returnPanels.removeAll(true);
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
        this.createButton = this.returnableItemsErrorEl = this.returnableItems = this.returnPanels = null;
    },

    initUI: function () {
        var me = this,
            record = this.record;

        this.initHeader();

        var store = record.getReturnsStore();
        this.setReturnsStore(store);

        this.setLoading(true);

        // if (returnStatus && returnStatus !== 'None') {
        store.load(function () {
            me.initProcessReturnPanels(store);
            me.initHeader();
            me.setLoading(false);
        });

        this.createButton = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Create Return',
            scope: this,
            handler: this.handleCreateClick,
            margin: '0 0 0 20px'
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


        this.returnableItems = Ext.create('Taco.view.order.widget.ReturnableItemGrid', {
            order: this.record,
            returnsStore: store
        });

        // container for holding all of the return panels
        this.returnPanels = Ext.widget({
            xtype: 'container',
            title: "return panels here"
        });

        this.items = [
            this.returnableItems, {
                xtype: 'container',
                margin: '10px 0 20px 0',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'end'
                },
                items: [this.returnableItemsErrorEl, this.createButton]
            },
            this.returnPanels
        ];

    },

    refreshReturnableItemsGrid: function () {
        this.returnableItems.reload();
        this.initHeader();
    },

    addProcessReturnPanel: function (record) {
        var status = record.get('status');
        this.returnPanels.add(Ext.create('Taco.view.order.widget.ProcessReturnPanel', {
            order: this.record,
            record: record,
            returnId: record.get('id'),
            listeners: {
                'refresh-returnable-items': this.refreshReturnableItemsGrid,
                scope: this
            },
            collapsed: status === Taco.model.Return.constants.statuses.CANCELLED || status === Taco.model.Return.constants.statuses.REJECTED || status === Taco.model.Return.constants.statuses.CLOSED
        }));
    },

    initHeader: function () {
        var returnStatus = Taco.core.util.Common.camelToSpace(this.record.get('returnStatus'));
        this.setHeaderTitleStatus('Returns', returnStatus);
    },

    initCreateButton: function () {
        var orderStatus = this.record.get('orderStatus');
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        var enabled = orderStatus === 'Completed' || (orderStatus === 'Processing' && (fulfillmentStatus === 'Fulfilled' || fulfillmentStatus === 'PartiallyFulfilled'));

        this.createButton.setDisabled(!enabled);
        this.returnableItemsErrorEl.setError(enabled ? "" : "This order must be at least partially fulfilled before a return can be initiated.");
    },

    initProcessReturnPanels: function (store) {
        Ext.suspendLayouts();
        Ext.Array.each(store.data.items, this.addProcessReturnPanel, this, true);
        Ext.resumeLayouts(true);
    },

    createReturn: function (type, items) {
        return this.getReturnsStore().add({
            originalOrderId: this.record.getId(),
            returnType: type,
            items: Ext.Array.map(items, function (item) {
                return {
                    orderItemId: item.get('orderItemId'),
                    orderLineId: item.get('orderLineId'),
                    productCode: item.get('orderItemId') ? null : item.get('productCode'), // only provide product code when there is no orderItemId
                    quantity: item.get('quantity'),
                    returnReason: item.get('reason'),
                    returnType: item.get('returnType'),
                    orderItemOptionAttributeFQN: item.get('orderItemOptionAttributeFQN')
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
            this.returnableItemsErrorEl.setError('Item \'Quantity to Return\' exceeds \'Quantity Fulfilled\'..');
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
                this.addProcessReturnPanel(newReturnRecord);
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