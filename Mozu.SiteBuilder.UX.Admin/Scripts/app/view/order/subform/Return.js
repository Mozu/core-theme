/**
 * @class Taco.view.order.subform.Return
 */
Ext.define('Taco.view.order.subform.Return', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ProcessReturnPanel',
        'Taco.view.order.widget.OrderReturns',
        'Taco.view.order.widget.ReturnableItemGrid',
        'Taco.core.ux.PanelHeaderStat',
        'Taco.model.Order'
    ],

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.title,
    itemId: 'orderReturn',

    config: {
        originalRecord: null,
        record: null,
        returnsStore: null
    },

    beforeShow: function() {
        var me = this;
        var header = this.getHeader();
        var container = header.el.dom.parentElement.childNodes[1];

        header.el.dom.style.display = 'none';

        // Offset top style added by ext to container
        var container = document.getElementsByClassName('taco-orderform-returns')[0].children[1];
        container.style.marginTop = '-25px';

        // Only reload data if we need to. If the order hasn't changed, don't bother.
        if (this.needToReload) {
            this.setLoading(true);
            var store = this.record.getReturnsStore();
            this.returnableItems.reload();

            store.load(function() {
                me.setLoading(false);
            });
            this.needToReload = false;
        }

        this.initCreateButton();
    },

    tabChange: function(tabPanel, newTab) {
       // console.log(newTab);
    },

    initComponent: function () {
        this.cls += " " + Taco.baseCSSPrefix + 'orderform-returns';
        this.initUI();
        this.callParent(arguments);

        this.needToReload = true;
        this.mon(this.record, 'reload', function() {
            // Only bother reloading if the order has changed.
            this.needToReload = true;
        }, this);
    },

    destroyUI: function() {
        this.removeAll();
        this.createButton = this.returnableItemsErrorEl = this.returnableItems = null;
    },

    initUI: function() {
        var me = this,
            record = this.record;

        var store = record.getReturnsStore();
        this.setReturnsStore(store);

        this.setLoading(true);

        // if (returnStatus && returnStatus !== 'None') {
        store.load(function () {
            if(me.orderReturns) {
                me.orderReturns.store.loadData(arguments[0]);
            }
            me.setLoading(false);
        });

        this.createButton = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.create_return_button,
            scope: this,
            handler: this.handleCreateClick
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
                    };
                }
                if (this.ownerCt) this.ownerCt.doLayout();
            }
        });

        this.initCreateButton();
       
        this.returnableItems = Ext.create('Taco.view.order.widget.ReturnableItemGrid', {
            itemId:'returnableItemGrid',
            order: this.record,
            returnsStore: store,
            tools: [this.createButton],
            createButtonId: this.createButton.id,
            returnableItemsErrorEl: me.returnableItemsErrorEl,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
        });

        this.returnableItems.on({
            beforeedit: function (editor, e) {
                if (e.record.get('quantityReturnable') === 0) {
                    if (e.record.get('quantityReturned') > 0) {
                        me.returnableItemsErrorEl.setError('That item has already been returned');
                    }
                    return false;
                } else {
                    me.returnableItemsErrorEl.setError('');
                    return true;
                }
            },
            scope: me
        });

        this.returnableItems.on({
            beforeselect: function (row, model, index) {
                if (model.data.quantityReturnable === 0) {
                    if (model.data.quantityReturned > 0) {
                        me.returnableItemsErrorEl.setError('That item has already been returned');
                    }
                    return false;
                } else {
                    me.returnableItemsErrorEl.setError('');
                    return true;
                }
            },
            scope: me
        });

        this.orderReturns = Ext.create('Taco.view.order.widget.OrderReturns', {
            store: store
        });

        this.items = [
            {
                html: '<div class="x-column-content-pill x-column-content-pill-true">This is an old return. To perform operations please switch to Classic Admin.</div>',
                margin: '0 0 0 900px',
                hidden: this.record.get('isUnified')
            },
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
        var ReturnableItemsStore = Ext.getStore('ReturnableItemsStore');
        var orderStatus = this.record.get('orderStatus');
        var fulfillmentStatus = this.record.get('fulfillmentStatus');
        var isShowCreateReturn = false;
        
        if (ReturnableItemsStore) {
            isShowCreateReturn = this.isShowCreateReturn(ReturnableItemsStore.data.items);
        }
        var enabled = orderStatus === 'Completed' || (orderStatus === 'Processing' && (fulfillmentStatus === 'Fulfilled' || fulfillmentStatus === 'PartiallyFulfilled')) || isShowCreateReturn;
        this.createButton.setDisabled(!this.record.get('isUnified') || !enabled);
        
        this.returnableItemsErrorEl.setError(enabled ? "" : Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.return_error_msg);
    },

    refreshReturnableItems: function() {
        this.returnableItems.loadReturnableItemsData();
    },

    createReturnableItem: function(item, quantity){
        return {
            orderLineId: item.get('orderLineId'),
            productCode: item.get('productCode'),
            shipmentNumber: item.get('shipmentNumber'), 
            shipmentItemId: item.get('shipmentItemId'), 
            quantity: quantity,
            returnReason: item.get('reason'),
            returnType: item.get('returnType'),
            orderItemOptionAttributeFQN: item.get('orderItemOptionAttributeFQN'),
            excludeProductExtras: item.get('excludeProductExtras')
        };
    },

    createReturn: function(type, items) {
        var me = this;
        var returnItems = [];

        Ext.Array.each(items, function(item) {
            //Need to split by shippingItems here
            
            if(item.raw){
                var quantity = item.get('quantity');
                var shipmentQuantityReturnable = item.get('quantityReturnable');
                if (quantity < shipmentQuantityReturnable) {
                    shipmentQuantityReturnable = quantity;
                };
                if (quantity && shipmentQuantityReturnable) {
                    returnItems.push(me.createReturnableItem(item, shipmentQuantityReturnable));
                }

            } else {
                returnItems.push(
                    {
                        orderItemId: item.get('orderItemId'),
                        orderLineId: item.get('orderLineId'),
                        productCode: item.get('productCode'),
                        quantity: item.get('quantity'),
                        returnReason: item.get('reason'),
                        returnType: item.get('returnType'),
                        orderItemOptionAttributeFQN: item.get('orderItemOptionAttributeFQN'),
                        excludeProductExtras: item.get('excludeProductExtras')
                    }
                )
            }
        });

        return this.getReturnsStore().add({
            originalOrderId: this.record.getId(),
            returnType: type,
            items: returnItems
        })[0];
    },

    handleCreateClick: function() {
        var me = this;

        this.returnableItemsErrorEl.setError('');
        var returnsStore = this.getReturnsStore();
        var erroredReturns = [],
            selected = this.returnableItems.getSelectionModel().getSelection();     
        if (selected.length === 0) {
            this.returnableItemsErrorEl.setError(Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.select_return_error);
            return;
        }

        if (Ext.Array.some(selected, function(item) {
            var qf = item.get('quantityFulfilled');
            var qr = item.get('quantityReturned');

            return (item.get('quantity') > (qf - qr));
        })) {
            this.returnableItemsErrorEl.setError('Item \'Quantity to Return\' exceeds \'Quantity Fulfilled\'.');
            return;
        }

        // if any items are checked for return, but have quantity == 0, reject this call.
        if (Ext.Array.some(selected, function(item) {
            return !item.get('quantity');
        })) {
            this.returnableItemsErrorEl.setError(Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.add_return_quantity);
            return;
        }

        erroredReturns = Ext.Array.filter(selected, function(item) { return item.get('reason') === 'Select'; });
        if (erroredReturns.length > 0) {
            this.returnableItemsErrorEl.setError(Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.choose_return_reason);
            return;
        }
  
        erroredReturns = Ext.Array.filter(selected, function(item) { return item.get('returnType') === 'Select'; });
        if (erroredReturns.length > 0) {
            this.returnableItemsErrorEl.setError(Localizer.langResources.ORDERS.Orders.OrderEdit.Returns.choose_return_resolution);
            return;
        }

        // Adds a return to the store. Need to sync the store to save it.
        // The Return.ReturnType is deprecated in favor of specifying return type at the item level.
        // Use "Replace" for backward compatibility since it provided the most flexibility in the old return state machine.
        var newReturnRecord = this.createReturn("Replace", selected);

        this.setLoading(true);
        returnsStore.sync({
            callback: function() {
                // Interesting note... callback is called AFTER success/failure.
                this.setLoading(false);
                this.createButton.setDisabled(false);
            },
            success: function() {
                // Once the new return is created, navigate to it.
                Taco.core.StateManager.attemptNavigate('/returns/edit/' + newReturnRecord.data.id);
                // after we add the new return we need to reload the order and regenerate the returnable items grid store
                //this.record.reload({
                //    success: me.refreshReturnableItems,
                //    scope: me
                //});
            },
            failure: function(batch) {
                returnsStore.remove(newReturnRecord);
                var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: this
        });
    },

    isShowCreateReturn: function (items) { 
        for (var i = 0; i < items.length; i++) {
            if (items[i].data.quantityReturnable > 0)
                return true;
        }
        return false;
    },

    onDestroy: function() {
        this.callParent(arguments);
    }
});