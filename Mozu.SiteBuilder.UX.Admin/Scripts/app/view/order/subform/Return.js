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
        returnsStore:null
    },

    initComponent: function (eOpts) {
        var me = this;
        var record = this.record;
        var store = record.getReturnsStore();
        var returnStatus = record.get('returnStatus');

        this.setReturnsStore(store);

        // if (returnStatus && returnStatus !== 'None') {
        store.load(function() {
                me.initProcessReturnPanels(store);
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
            setError: function(s) {
                s = Ext.util.Format.htmlEncode(s);
                if (this.rendered) {
                    this.messageEl.setHTML(s);
                } else {
                    this.renderData = {
                        message: s
                    }
                }
                if (this.ownerCt) this.ownerCt.doLayout();
            }
        });

        this.initCreateButton();
        
        this.returnableItems = Ext.create('Taco.view.order.widget.ReturnableItemGrid', {
            order: this.record,
            returnsStore: store
        });

        Ext.apply(this, {
            items: [
                this.returnableItems, {
                    xtype: 'container',
                    margin: '10px 0 20px 0',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'end'
                },
                items: [this.returnableItemsErrorEl, this.createButton]
            }]
        });


        this.callParent(arguments);

        this.mon(record, {
            aftercommit: {
                scope: this,
                fn: 'onOrderChange'
            }
        });
                
        this.on({
            boxready: {
                scope: this,
                fn: function () {
                    this.addCls(Taco.baseCSSPrefix + 'orderform-returns');
                    this.initHeader();
                }
            }
        });
    },
        
    addProcessReturnPanel: function (record, recordIndex) {
        var status = record.get('status');

        this.add(Ext.create('Taco.view.order.widget.ProcessReturnPanel', {
            order: this.record,
            record: record,
            collapsed: status === Taco.model.Return.constants.statuses.CANCELLED || status === Taco.model.Return.constants.statuses.REJECTED || status === Taco.model.Return.constants.statuses.CLOSED
        }));
    },
        
    initHeader: function() {

        this.setHeaderTitle("Status: <strong>" + Taco.core.util.Common.camelToSpace(this.record.get('returnStatus')) + "</strong>");

        // this.getHeader().add([
        //     {
        //         xtype: 'panelheaderstat',
        //         label: "Ordered",
        //         value: Ext.Array.sum(Ext.Array.map(this.record.items().getRange(), function(item) {
        //             return Math.max(Ext.Array.sum(Ext.Array.pluck(item.get('bundledProducts') || [], 'quantity')), 1) * item.get('quantity');
        //         })),
        //     },
        //     {
        //         xtype: 'panelheaderstat',
        //         label: "Fulfilled",
        //         value: Ext.Array.sum(Ext.Array.flatten(Ext.Array.map(Ext.Array.filter(this.record.get('packages'), function(pkg) { return pkg.status === Taco.model.Order.constants.packageStatuses.FULFILLED; }), function(pkg) {
        //             return Ext.Array.pluck(pkg.items, 'quantity');
        //         })))
        //     },
        //     {
        //         xtype: 'panelheaderstat',
        //         label: "Replaced",
        //         value: Ext.Array.sum(Ext.Array.flatten(Ext.Array.map(this.getReturnsStore().getRange(), function(rtn) {
        //             var status = rtn.get('status'),
        //                 statuses = Taco.model.Return.constants.statuses;
        //             return (status === statuses.CLOSED ||
        //                 status === statuses.SHIPPED) ? Ext.pluck(rtn.get('items'), 'quantity') : [];
        //         })))
        //     },
        //     {
        //         xtype: 'panelheaderstat',
        //         label: "Refunded",
        //         value: Ext.Array.sum(Ext.Array.flatten(Ext.Array.map(this.getReturnsStore().getRange(), function(rtn) {
        //             var status = rtn.get('status'),
        //                 statuses = Taco.model.Return.constants.statuses;
        //             return (status === statuses.CLOSED ||
        //                 status === statuses.REFUNDED) ? Ext.pluck(rtn.get('items'), 'quantity') : [];
        //         })))
        //     },
        //     {
        //         xtype: 'tbseparator'
        //     },
        //     {
        //         xtype: 'panelheaderstat',
        //         label: 'Order Total',
        //         value: this.record.formatCurrency(this.record.get('total')),
        //         width: 120
        //     },
        //     {
        //         xtype: 'panelheaderstat',
        //         label: 'Refund Total',
        //         value: this.record.formatCurrency(this.getReturnsStore().sum('refundAmount') || 0)
        //     }

        // ])
    },

    initCreateButton: function () {
        var orderStatus = this.record.get('orderStatus');
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        var enabled = orderStatus === 'Completed' || (orderStatus === 'Processing' && (fulfillmentStatus === 'Fulfilled' || fulfillmentStatus === 'PartiallyFulfilled'));
        
        this.createButton.setDisabled(!enabled);
        this.returnableItemsErrorEl.setError(enabled? "" : "This order must be at least partially fulfilled before a return can be initiated.");
    },
        
    initProcessReturnPanels: function (store) {
        Ext.Array.each(store.data.items, this.addProcessReturnPanel, this, true);
    },

    onOrderChange: function () {
        Ext.suspendLayouts();
        this.initCreateButton();
        Ext.resumeLayouts(true);
    },
        
    createReturn: function(type, items) {

        var parentBundles = {},
            newItems = [];

        Ext.Array.each(items, function(item) {
            if (item.parentItemId) {
                if (item.parentItemId in parentBundles) {
                    parentBundles[item.parentItemId].bundledProducts.push(item);
                } else {
                    parentBundles[item.parentItemId] = {
                        orderItemId: item.parentItemId,
                        quantity: 1,
                        reason: item.reason,
                        bundledProducts: [item]
                    };
                }
            } else {
                newItems.push(item);
            }
        });

        console.log(type, items);

        return this.getReturnsStore().add({
            originalOrderId: this.record.getId(),
            type: type,
            items: Ext.Array.map(newItems.concat(Ext.Object.getValues(parentBundles)), function(item) {
                if (item.reason === 'Other') {
                    item.rmaNote = 'Other';
                }

                item.reasons = [{
                    reason: item.reason,
                    quantity: item.quantity
                }];
                return item;
            })
        })[0];
    },

    handleCreateClick: function() {
        this.returnableItemsErrorEl.setError('');
        var returnsStore = this.getReturnsStore();
        var items, records = [],

            refundItems = [],
        
            replaceItems = [],

            selected = this.returnableItems.getSelectionModel().getSelection();


        if (selected.length === 0) {
            this.returnableItemsErrorEl.setError('Please select items to return.');
            return false;
        }

        if (Ext.Array.some(selected, function(item) {
            return !item.get('quantity')
        })) {
            this.returnableItemsErrorEl.setError('Please add a return quantity to all selected items.');
                return false;
        }

        Ext.Array.each(this.returnableItems.getSelectionModel().getSelection(), function (item) {
            var returnType = item.get('returnType');
            if (returnType === "Replace") replaceItems.push(item.getData());
            if (returnType === "Refund") refundItems.push(item.getData());
        }, this);

        if (refundItems.length > 0) records.push(this.createReturn("Refund", refundItems));
        if (replaceItems.length > 0) records.push(this.createReturn("Replace", replaceItems));
            
        if (records.length === 0) {
            this.returnableItemsErrorEl.setError('Sorry, an unknown error occurred. There were no items of return type "Replace" or "Refund".');
            return false;
        }

        this.setLoading(true);
        returnsStore.sync({
            callback: function() {
                this.setLoading(false);
                this.createButton.setDisabled(false);
            },
            success: function(batch) {
                Ext.Array.each(records, this.addProcessReturnPanel, this, true);
            },
            failure: function(batch) {
                returnsStore.remove(records);

                var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: this
        });
    },


    onDestroy: function () {
        this.mun(this.record, 'aftercommit', this.onOrderChange, this);

        this.callParent(arguments);
    }
});