/**
 * @class Taco.view.order.subform.Detail
 * Shows the details of the order. Includes order items, disounts, shipping, totals
 * 
 */

Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.model.OrderItemDiscount',
        'Taco.view.order.widget.OrderTotalPanel',
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.modal.EditOrderDetail',
        'Taco.shared.view.form.ExtensibleAttribute',
        'Taco.view.order.subform.InternalNotes',
        'Taco.core.ux.form.ResendEmailButton'
    ],
    alias: 'widget.taco-orderdetail',
    itemId: 'orderDetailPanel',
    title: 'Order Details',    
    headerToolbar: true,

    bodyPadding: '0 0 0 0 ',

    config: {

        // order model
        record: null,
        
        // determines whether the detailGrid allows field editing
        editMode: false,       
        
        
        totalColumnWidth: 100,

        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 100,
        
        itemId:"orderDetails"
        
    },

    

    // width of the actionColumn. used to align the grid total container
    actionColumnWidth: 30,

    initComponent: function (eOpts) {
        var me = this,
            orderItemStore;
        
        // after the record is reloaded we will need to refresh the ui

        me.mon(me.record, "aftercommit", function () {            
            me.onRecordChange();
        }, me);
        
        //me.tools = me.getButtonActions();
        
        // var siteContext = Taco.app.context.getCurrent().urlToken;

        this.cls += ' ' + Taco.baseCSSPrefix + 'orderform-detail';
        
        
    
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
            actionColumnWidth: me.actionColumnWidth,
            autoHeight: true,
            listeners: {
                'draftOrderRemoved': {
                    fn: function (data) {
                        me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar, true);
                        me.detailGrid.hasDraftToolbar = null;
                    },
                    scope: me
                },
                'orderAccepted': {
                    fn: function () {
                        me.record.reload();
                    },
                },
                'orderCancelled': {
                    fn: function() {
                        me.record.reload();
                    },
                    scope:me
                }
            }
        });
        
        
        // subtotals, orderlevel discounts, tax shipping, and totals
        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            margin: '0 0 20 0',
            record: me.record,
            //data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            actionColumnWidth: me.actionColumnWidth
        });
        
        // customer notes class
        this.customerNoteRow = Ext.create('Ext.panel.Panel', {
            //cls: "orderform-detail-customerNotesRow",
            ui: "subform-section",
            title: "Customer Notes",
            margin: "0 0 20px 0 ",
            bodyStyle: "padding:20px 0px 40px 0px ",            
            tpl: [
                '<div class="customerNote">',
                    '<tpl if="values.customerNote">',
                        '{customerNote}',
                    '<tpl else>',
                        'None available',
                    '</tpl>',
                '</div>'
            ],
            data:this.record.getData()
        });

        me.internalNoteRow = Ext.create('Taco.view.order.subform.InternalNotes', {
            record: this.record,
            orderForm: this
        });
        
        this.orderAttrGrid = Ext.create('Taco.view.order.subform.Attributes', {
            ui: "subform-section",
            headerToolbar: true,
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderAttributes'),
            record: this.record,
            orderForm: this
        });

        //todo refactor attributes to encapsolate this form; and to make the dialog auto destroy;
        this.orderAttr = Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: 'Attributes',
            header:false,
            record: this.record,
            ui: "form",
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderAttributes')
        });
        
        Ext.apply(this, {
                items: [{
                    xtype: "panel",
                    ui: "subform-section",
                    headerToolbar: true,
                    tools: me.getButtonActions(),
                    title:"Items Ordered",
                    items:[
                        me.detailGrid,
                        this.totalRow                        
                    ]
                },
                
                this.orderAttrGrid,

                this.customerNoteRow,

                this.internalNoteRow


            ]
        });

        this.callParent(arguments);
    },
        
    
    
    editOrder: function (focusAfterCloseCmp) {
        var me = this,
            isDraft = me.orderForm.isEdit(),
            win;

        win = Ext.create('Taco.view.order.modal.EditOrderDetail', {
            // if we want to edit a draft only, pass recordId.
            // otherwise, pass the record.
            isDraftMode: isDraft, 
            record: isDraft ? null : me.record,
            recordId: isDraft ? me.record.getId() : null,

            listeners: {
                afterclose: function (view, e){
                    if (focusAfterCloseCmp) {
                        focusAfterCloseCmp.focus();
                    }
                },
                close: function (view, e) {
                    
                    if (isDraft && view.getHasDraft()) {
                        me.record.set('hasDraft',true);
                        me.updateHasDraftToolbar();
                    }
                    me.fireEvent('orderchange');
                },

                phoneOrderSaved: function () {
                    me.record.reload();
                    me.setLoading(false, this.body);
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
        me.totalRow.setRecord(me.record);
        
        me.customerNoteRow.update(me.record.data)
        

        // todo: update the internalNotes
        //me.internalNoteRow.setRecord(me.record);

        me.rebuildItems();
        me.updateHasDraftToolbar();
        me.updateButtonActions();
    },
    

    // sets up the action menu for the gear icon trigger;  Will be called every time the record loads since actions may become disabled and enabled after each change;

    //getMenuActions: function () {
    //    var me = this,
    //        availableActions = me.record.get("availableActions"),
    //        canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
    //        canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
    //        canEdit = !canAccept,
    //        menu;
        
    //    menu = [{
    //        text: 'Accept Order',
    //        handler: function () {
    //            this.detailGrid.acceptOrder();
    //        },
    //        scope: me,
    //        hidden: !canAccept
    //    }, {
    //        text: 'Edit Details',
    //        handler: function () {
    //            this.editOrder();
    //        },
    //        scope: me,
    //        disabled: !canEdit
    //    }, {
    //        text: 'Cancel Order',
    //        handler: function() {
    //            this.detailGrid.cancelOrder();
    //        },
    //        scope: me,
    //        disabled: !canCancel
    //    }];

    //    return menu;
        
    //},

    
    // removed temporarily. due to designer snerst

    // update whether the buttons are enabled or disabled with every update of the record;
    updateButtonActions: function () {
        var me = this,
            availableActions = me.record.get("availableActions"),
            canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
            canEdit = !Ext.Array.contains(['Completed', 'Cancelled'], me.record.get('orderStatus')),
            canSendEmail = !Ext.Array.contains(['Pending'], me.record.get('orderStatus')),
            acceptOrderButton = this.down("#acceptOrderButton"),
            cancelOrderButton = this.down("#cancelOrderButton"),
            editOrderButton = this.down("#editOrderButton"),
            resendEmailButton = this.down("#resendEmailButton");


        if (acceptOrderButton) {
            acceptOrderButton.setVisible(canAccept);
        }
        if (cancelOrderButton) {
            cancelOrderButton.setDisabled(!canCancel);
        }
        if (editOrderButton) {
            editOrderButton.setDisabled(!canEdit);
        }

        if (resendEmailButton) {
            resendEmailButton.setVisible(canSendEmail);
        }
    },

    getButtonActions: function () {
        var me = this,
            availableActions = me.record.get("availableActions"),
            canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
            canEdit = !Ext.Array.contains(['Completed', 'Cancelled'], me.record.get('orderStatus')),
            canSendEmail = !Ext.Array.contains(['Pending'], me.record.get('orderStatus')),
            buttons;
        
        buttons = [
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Accept Order',
                itemId: 'acceptOrderButton',
                handler: function () {
                    this.detailGrid.acceptOrder();
                },
                scope: me,
                hidden: !canAccept
            }, {
                text: 'Cancel Order',
                xtype: "button",
                ui: "action",
                itemId:"cancelOrderButton",
                scale: "medium",
                margin: {
                    right:2
                },
                handler: function () {
                    this.detailGrid.cancelOrder();
                },
                scope: me,
                disabled: !canCancel
            },{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Print Order',
                margin: {
                    right: 2
                },
                handler: me.openPrintWindow,
                scope: me
            }, {
                text: 'Edit Details',
                xtype: "button",
                ui: "action",
                itemId: "editOrderButton",
                scale: "medium",
                handler: this.editOrder,
                scope: me,
                disabled: !canEdit
            },{
                xtype: 'resendemailbutton',
                itemId: "resendEmailButton",
                margin: '0 0 0 10',
                emailUrl: '/admin/app/order/resendconfirmationemail',
                jsonData: {
                    orderId: this.record.getId()
                },
                hidden: !canSendEmail
            }
        ];

        return buttons;

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
    },

    openPrintWindow: function () {
        var siteId = this.record.get('siteId'),
            orderId = this.record.getId();
        window.open('/admin/s-' + siteId + '/orderdetails/' + orderId);
    }
});
