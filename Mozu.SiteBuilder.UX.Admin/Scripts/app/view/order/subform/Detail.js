/**
 * @class Taco.view.order.subform.Detail
 * Shows the details of the order. Includes order items, disounts, shipping, totals
 * 
 */

Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.OrderTotalPanel',
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.modal.EditOrderDetail'
    ],
    
    title: 'Order Details',
    alias: 'widget.taco-orderdetail',
    
    config: {
        
        // order model
        record: null,
        
        // determines whether the detailGrid allows field editing
        editMode: false,
        
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 100,
        
        itemId:"orderDetails",
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
        
    initComponent: function (eOpts) {
        var me = this,
            orderItemStore;
        
        // after the record is reloaded we will need to refresh the ui
        me.record.on("aftercommit", function () {
            me.onRecordChange();
        }, me);
        
        // var siteContext = Taco.app.context.getCurrent().urlToken;
        

        this.cls += ' ' + Taco.baseCSSPrefix + 'orderform-detail';

        this.actionTrigger = Ext.create('Taco.core.ux.action.Button', {
            width: 50,
            height: 30,
            text: ' ',
            menuAlign: 'tr-br',
            cls: Taco.baseCSSPrefix + 'editcontainer-menu-button',
            autoEl: {
                tag: 'a'
            },
            menu: {
                plain: true,
                items: [
                    {
                    text: 'Edit Details',
                        handler: function (button, e) {
                            var animationTarget = this.actionTrigger.el;
                            this.editOrder(animationTarget);
                        },
                        scope: me
                }, {
                    text: 'Cancel Order',
                    disabled: true
            }
                ]
            }
        });
    
        // add the action trigger icon in header;
        this.setTools([this.actionTrigger]);
    
        // store that contains the orderItems for this order model
        orderItemStore = this.record.itemsStore;
        
        // plugin to add suppourt to the grid for editing the price and quantity columns
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        // readonly list of products and discounts;
        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: this.getEditMode(),
            record : this.record,
            store: orderItemStore,
            autoHeight: true,
            listeners: {
                'draftOrderRemoved': {
                    fn: function (data) {
                        me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar, true);
                        me.detailGrid.hasDraftToolbar = null;
                    },
                    scope: me
                }
            }
        });
        
        
        // subtotals, orderlevel discounts, tax shipping, and totals
        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.getActionColumnWidth()
        });
        
        // customer notes class
        this.customerNoteRow = Ext.create('Ext.Component', {
            cls: "orderform-detail-customerNotesRow",
            tpl: [
                '<div class="customerNote">',
                    '<span class="label">Customer Notes:</span> {customerNote}',
                '</div>'
            ],
            data:this.record.getData()
        });
        
        Ext.apply(this, {
            items: [
                me.detailGrid,
                this.totalRow,
                this.customerNoteRow
            ]
        });

        this.callParent(arguments);
    },
        
    
    
    editOrder: function (animationTarget) {
        var me = this,
            isDraft = me.orderForm.isEdit(),
            win = Ext.create('Taco.view.order.modal.EditOrderDetail', {

            // if we want to edit a draft only, pass recordId.
            // otherwise, pass the record.
            isDraftMode: isDraft, 
            record: isDraft ? null : me.record,
            recordId: isDraft ? me.record.getId() : null,

            listeners: {
                close: function (view, e) {
                    
                    if (isDraft && view.getHasDraft()) {
                        me.record.set('hasDraft',true);
                        me.updateHasDraftToolbar();
                    }
                    me.fireEvent('orderchange');
                },

                draftOrderSaved: function () {
                        me.record.reload();
                        me.setLoading(false, this.body);
                },

                draftOrderRemoved: function (data) {
                        //me.setLoading(true, this.body);
                        // hide the toolbar
                    me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar, true);
                    me.detailGrid.hasDraftToolbar = null;

                    //todo: need to determine if we need to reload the data object aftetr this operation;
                }
            }
        });

        // now we sit back and let autoShow do the rest..
    },

    /*
    loadRecord: function () {
        var me = this,
            orderId = (me.record) ? me.record.get('id') : me.orderId;
        me.orderModel.load(orderId, {
            scope: me,
            failure: function (record, operation) {
                //do something if the load failed
                this.setLoading(false, this.body);
            },
            success: function (record, operation) {
                me.record = record;
                me.onLoadRecord();
            },
            callback: function (record, operation) {
                //do something whether the load succeeded or failed
            }
        });
    },

    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord: function () {
        var me = this;
        // initialize the ui when the record loads the first time.
        //me.updateUi();
        //this.setLoading(false, this.body);
        me.record.reload();
    },
    
    */

    // when the record changes we will need to update the order details
    onRecordChange: function () {
        var me = this;
        Ext.suspendLayouts();
        // need to reload the record;
        me.updateUi();
        Ext.resumeLayouts(true);        
        me.setLoading(false, this.body);
    },
    
    updateHasDraftToolbar : function() {
        var me = this;
        //hide or show the toolbar accordingly
        if (me.record.get("hasDraft")) {
            me.detailGrid.showHasDraftToolbar();
        } else {
            me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar);
            me.detailGrid.hasDraftToolbar = null;
        }
    },
    
    /*
     * ExtJS doesn't handle reload of data with sub-stores well.
     * So we manually re-populate the order.items()
     */
    rebuildItems: function() {
        var me = this;
        
        me.record.items().removeAll();
        var itemsToAdd = [];
        Ext.each(me.record.data.items, function (itemRaw) {
            var itemRecord = Ext.create('Taco.model.OrderItem', itemRaw);
            
            var discountsToAdd = [];
            Ext.each(itemRecord.data.discounts, function (raw) {
                var discountRecord = Ext.create('Taco.model.OrderItemDiscount', raw);
                discountsToAdd.push(discountRecord);
            });

            // for some reason the discounts store is only present when the discounts:[] has values;
            if (itemRecord.discounts) {
                itemRecord.discounts().removeAll();
                itemRecord.discounts().add(discountsToAdd);
            }
            
            var shippingDiscountsToAdd = [];
            Ext.each(itemRecord.data.shippingDiscounts, function (raw) {
                var shippingDiscountRecord = Ext.create('Taco.model.OrderShippingDiscount', raw);
                shippingDiscountsToAdd.push(shippingDiscountRecord);
            });
            
            if (itemRecord.shippingDiscounts) {
                itemRecord.shippingDiscounts().removeAll();
                itemRecord.shippingDiscounts().add(shippingDiscountsToAdd);
            }
            
            itemsToAdd.push(itemRecord);
        });
        
        me.record.items().add(itemsToAdd);


    },
    
    updateUi: function () {
        var me = this;
        me.totalRow.setData(me.record.getData());
        me.rebuildItems();
        me.updateHasDraftToolbar();
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function () {
       
        this.callParent(arguments);
    },

    isValid: function () {
        var items = this.record.get('items');
        return items && items.length;
    }
});
