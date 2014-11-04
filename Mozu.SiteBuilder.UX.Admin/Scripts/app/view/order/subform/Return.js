/**
 * @class Taco.view.order.subform.Payment
 */
Ext.define('Taco.view.order.subform.Return', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.CreateReturnPanel',
        'Taco.view.order.widget.ProcessReturnPanel',
        'Taco.view.order.widget.ReturnableItemGrid',
        'Taco.core.ux.PanelHeaderStat',
        'Taco.model.Order',
    ],

    itemId: 'orderReturn',
    title: 'Returns',

    config: {
        originalRecord: null,
        record: null,
        returnsStore: null
    },

    initComponent: function () {

        this.cls += " " + Taco.baseCSSPrefix + 'orderform-returns';

        // initialize and tear down the ui when the view becomes active;
        this.mon(this, {
            'activate': this.initUI,
            'deactivate': this.destroyUI
        }, this);

        this.callParent(arguments);
    },

    destroyUI: function () {

        this.removeAll();

        this.createButton.destroy();
        this.returnableItemsErrorEl.destroy();
        this.returnableItems.destroy();
        this.returnPanels.destroy();

        this.createButton = this.returnableItemsErrorEl = this.returnableItems = this.returnPanels = null;

    },

    initUI: function () {
        var me = this;
        var record = this.record;

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

        this.add(
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
        );
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
            listeners: {
                'refresh-returnable-items': this.refreshReturnableItemsGrid,
                scope: this
            },
            collapsed: status === Taco.model.Return.constants.statuses.CANCELLED || status === Taco.model.Return.constants.statuses.REJECTED || status === Taco.model.Return.constants.statuses.CLOSED
        }));
    },

    initHeader: function () {
        var returnsStore = this.getReturnsStore();
        var returnCount = returnsStore ? Ext.valueFrom(returnsStore.count(), 0) : 0;
        // var returnStatus = Taco.core.util.Common.camelToSpace(this.record.get('returnStatus'));

        this.setHeaderTitle("Status: <strong>" + (returnCount ? returnCount : 'No') + " Return" + (returnCount === 1 ? "" : "s") + "</strong>");
    },

    initCreateButton: function () {
        var orderStatus = this.record.get('orderStatus');
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        var enabled = orderStatus === 'Completed' || (orderStatus === 'Processing' && (fulfillmentStatus === 'Fulfilled' || fulfillmentStatus === 'PartiallyFulfilled'));


        /*
        // disable the create button if we have no returnable items;
        this.mon(this.returnableItems, 'viewready', function () {
            if (!this.returnableItems.store.count()) {
                this.createButton.disable();
            } else {
                this.createButton.enable();
            }
        }, me);

        */


        this.createButton.setDisabled(!enabled);
        this.returnableItemsErrorEl.setError(enabled ? "" : "This order must be at least partially fulfilled before a return can be initiated.");
    },

    initProcessReturnPanels: function (store) {
        Ext.suspendLayouts();
        Ext.Array.each(store.data.items, this.addProcessReturnPanel, this, true);
        Ext.resumeLayouts(true);
    },

    /*
    onOrderChange: function () {
        Ext.suspendLayouts();
        //this.initCreateButton();
        Ext.resumeLayouts(true);
    },
    */

    createReturn: function (type, items) {
        return this.getReturnsStore().add({
            originalOrderId: this.record.getId(),
            returnType: type,
            items: Ext.Array.map(items, function (item) {
                return {
                    orderItemId: item.data.orderItemId,
                    productCode: item.data.orderItemId ? null : item.data.productCode, // only provide product code when there is no orderItemId
                    returnReason: item.data.reason,
                    quantity: item.data.quantity,
                    rmaNote: item.data.returnReason === 'Other' ? 'Other' : null
                };
            })
        })[0];
    },

    handleCreateClick: function () {
        var me = this;

        this.returnableItemsErrorEl.setError('');
        var returnsStore = this.getReturnsStore();
        var records = [],

            refundItems = [],

            replaceItems = [],

            selected = this.returnableItems.getSelectionModel().getSelection();

        if (selected.length === 0) {
            this.returnableItemsErrorEl.setError('Please select items to return.');
            return false;
        }

        // if any items are checked for return, but have quantity == 0, reject this call.
        if (Ext.Array.some(selected, function (item) {
            return !item.get('quantity');
        })) {
            this.returnableItemsErrorEl.setError('Please add a return quantity to all selected items.');
            return false;
        }

        replaceItems = Ext.Array.filter(selected, function (item) { return item.get('returnType') === 'Replace' } );
        refundItems  = Ext.Array.filter(selected, function (item) { return item.get('returnType') === 'Refund' } );

        if (refundItems.length > 0) records.push(this.createReturn("Refund", refundItems));
        if (replaceItems.length > 0) records.push(this.createReturn("Replace", replaceItems));

        if (records.length === 0) {
            this.returnableItemsErrorEl.setError('Sorry, an unknown error occurred. There were no items of return type "Replace" or "Refund".');
            return false;
        }

        this.setLoading(true);
        returnsStore.sync({
            callback: function () {
                this.setLoading(false);
                this.createButton.setDisabled(false);
            },
            success: function () {
                Ext.Array.each(records, this.addProcessReturnPanel, this, true);
                //after we add the new return we need to reload the returnable items grid data;
                me.refreshReturnableItemsGrid();
            },
            failure: function (batch) {
                returnsStore.remove(records);
                var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: this
        });
    },


    onDestroy: function () {
        //this.mun(this.record, 'aftercommit', this.onOrderChange, this);

        this.callParent(arguments);
    }
});