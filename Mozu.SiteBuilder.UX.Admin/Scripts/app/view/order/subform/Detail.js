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
        'Taco.view.order.subform.InternalNotes'
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
            acceptOrderButton = this.down("#acceptOrderButton"),
            cancelOrderButton = this.down("#cancelOrderButton"),
            editOrderButton = this.down("#editOrderButton");

        if (acceptOrderButton) {
            acceptOrderButton.setVisible(canAccept);
        }
        if (cancelOrderButton) {
            cancelOrderButton.setDisabled(!canCancel);
        }
        if (editOrderButton) {
            editOrderButton.setDisabled(!canEdit);
        }
    },

    getButtonActions: function () {
        var me = this,
            availableActions = me.record.get("availableActions"),
            canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
            canEdit = !Ext.Array.contains(['Completed', 'Cancelled'], me.record.get('orderStatus')),
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
                handler: me.openPrintWindow2,
                scope: me
            },{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Print Order [Old]',
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

    openPrintWindow2: function () {
        var siteId = this.record.get('siteId'),
            orderId = this.record.getId();
        window.open('/admin/s-' + siteId + '/orderdetails/' + orderId);
    },

    openPrintWindow: function () {
        var me = this;
        var attributeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Attributes');
        var printWindow = window.open();
        var doc = printWindow.document;
        var styleEl = doc.createElement('style');
        var tpl, cssText;

        tpl = new Ext.XTemplate(
            '<table class="print-order-page">',
            '<thead class="header"><tr>',
            '<th class="company-info">&nbsp;</th>',
            '<th class="company-contacts">&nbsp;</th>',
            '<th class="order-essentials">',
                '<div class="order-number"><span class="label">Order #</span><span>{orderNumber}</span></div>',
                '<div class="order-date"><span class="label">Date: </span><span>{createDate:date("m/d/Y")}</span></div>',
            '</th>',
            '</tr></thead>',
            '<tfoot class="footer"><tr>',
                '<td colspan="3">&nbsp;</td>',
            '</tr></tfoot>',
            '<tbody><tr><td colspan="3">',
                '<div class="section section-contacts"><table class="panes"><tbody><tr>',
                    '<td clas="billing-address"><tpl for="billingContact">',
                        '<div class="label">Bill To</div>',
                        '<div>{firstName} {lastName}</div>',
                        '<div>{address1}</div>',
                        '<tpl if="address2"><div>{address2}</div></tpl>',
                        '<tpl if="address3"><div>{address3}</div></tpl>',
                        '<tpl if="address4"><div>{address4}</div></tpl>',
                        '<div>{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',
                        '<tpl if="homePhone"><div>{homePhone} (home)</div></tpl>',
                        '<tpl if="workPhone"><div>{workPhone} (work)</div></tpl>',
                        '<tpl if="mobilePhone"><div>{mobilePhone} (mobile)</div></tpl>',
                        '<div>{email}</div>',
                    '</tpl></td>',
                    '<td class="shipping-address"><tpl for="fulfillmentContact">',
                        '<div class="label">Ship To</div>',
                        '<div>{firstName} {lastName}</div>',
                        '<div>{address1}</div>',
                        '<tpl if="address2"><div>{address2}</div></tpl>',
                        '<tpl if="address3"><div>{address3}</div></tpl>',
                        '<tpl if="address4"><div>{address4}</div></tpl>',
                        '<div>{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',
                        '<tpl if="homePhone"><div>{homePhone} (home)</div></tpl>',
                        '<tpl if="workPhone"><div>{workPhone} (work)</div></tpl>',
                        '<tpl if="mobilePhone"><div>{mobilePhone} (mobile)</div></tpl>',
                        '<div>{email}</div>',
                    '</tpl></td>',
                    '<td class="order-totals">',
                        '<div class="label">Totals</div>',
                        '<div class="price-total">{[values.orderRecord.formatCurrency(values.total)]}</div>',
                        '<div class="item-total">{itemsOrdered} items</div>',
                    '</td>',
                '</tr></tbody></table></div>',
                '<div class="section section-orderitems">',
                    '<h2>Items Ordered</h2>',
                    '<table class="grid">',
                        '<thead><tr>',
                            '<th>Code</th>',
                            '<th>Product</th>',
                            '<th>Fulfillment</th>',
                            '<th>Price</th>',
                            '<th>Qty</th>',
                            '<th>Item Total</th>',
                        '</tr></thead>',
                        '<tbody><tpl for="items">',
                            '<tr>',
                                '<td>{productCode}</td>',
                                '<td>',
                                    '<div class="product-name">{productName}</div>',
                                    '<tpl for="options">',
                                        '<div class="product-option">',
                                            '<em class="product-option-label">[option]</em>{[this.getAttributeName(values)]}: {value}',
                                        '</div>',
                                    '</tpl>',
                                    '<tpl for="bundledProducts">',
                                        '<div class="bundled-product">',
                                            '<em class="product-option-label">[includes]</em>{productCode} - {name} (Qty. {quantity})',
                                        '</div>',
                                    '</tpl>',
                                '</td>',
                                '<td><tpl if="fulfillmentLocationCode">{fulfillmentMethod} ({fulfillmentLocationCode})</tpl></td>',
                                '<td>{[parent.orderRecord.formatCurrency(values.unitPrice)]}</td>',
                                '<td>{quantity}</td>',
                                '<td>{[parent.orderRecord.formatCurrency(values.subtotal)]}</td>',
                            '</tpl></tr>',
                        '</tbody>',
                    '</table>',
                '</div>',
                '<div class="section section-payment">',
                  '<h2>Payment Details</h2>',
                  '<table class="grid">',
                    '<thead>',
                      '<tr>',
                        '<th>Date</th>',
                        '<th>Payment Type</th>',
                        '<th>Payment Status</th>',
                        '<th>Expiration Date</th>',
                        '<th>Amount</th>',
                      '</tr>',
                    '</thead>',
                    '<tbody>',
                      '<tpl for="payments">',
                        '<tr>',
                          '<td>{createDate:date("m/d/Y")}</td>',
                          '<tpl if="paymentType == \'Check\'">',
                            '<td>Check</td>',
                            '<td>{status}</td>',
                            '<td>N/A</td>',
                          '</tpl>',
                          '<tpl if="paymentType == \'CreditCard\'">',
                            '<td>{cardType}</td>',
                            '<td>{cardNumber}</td>',
                            '<td><tpl if="expirationMonth">{expirationMonth}/{expirationYear}</tpl></td>',
                          '</tpl>',
                          '<td>{[parent.orderRecord.formatCurrency(values.amountCollected || values.amountAuthorized)]}</td>',
                        '</tr>',
                      '</tpl>',
                    '</tbody>',
                  '</table>',
                '</div>',
//              // attributes are supposed to be internal anwyay. Also, to display them, it requires another store lookup.
//              '<div class="section section-attributes">',
//                  '<h2>Order Attributes</h2>',
//                  '<tpl for="attributes"><div class="attribute">',
//                      '<span class="label">{fullyQualifiedName}</span>',
//                      '<span><tpl for="values" between=",">{.}</tpl></span>',
//                  '</div></tpl>',
//              '</div>',
                '<tpl if="customerNote"><div class="section section-notes">',
                    '<h2>Notes</h2>',
                    '<table class="grid">',
                        '<thead><tr>',
                            '<th>Date</th>',
                            '<th>Author</th>',
                            '<th>Comment</th>',
                        '</tr></thead>',
                        '<tbody>',
                            '<tr>',
                                '<td>{createDate:date("m/d/Y H:i a")}</td>',
                                '<td>Customer</td>',
                                '<td>{customerNote}</td>',
                            '</tr>',
                        '</tbody>',
                    '</table>',
                '</div></tpl>',
                '<tpl if="shippingMethodName || (packages && packages.length) || (pickups && pickups.length)">',
                    '<div class="section section-fulfillment">',
                        '<h2>Fulfillment</h2>',
                        '<tpl if="shippingMethodName">',
                            '<table class="grid">',
                            '<thead><tr><th>Customer Selected Shipping Method</th></tr><thead>',
                            '<tbody><tr><td>{shippingMethodName}</tr></td></tbody>',
                            '</table>',
                        '</tpl>',
                        '<tpl if="totalDirectShipItems && packages && packages.length"><div class="subsection-wrapper">',
                            '<h3>Shipping</h3>',
                            '<tpl for="packages"><table class="subsection"><tbody>',
                                '<tr>',
                                    '<td colspan="2">Package #{#}</td>',
                                    '<td colspan="2">Status: {status}</td>',
                                '</tr><tr>',
                                    '<td>',
                                        '<div class="label">Ship To</div>',
                                        '<tpl for="parent.fulfillmentContact">',
                                            '<div>{firstName} {lastName}</div>',
                                            '<div>{address1}</div>',
                                            '<tpl if="address2"><div>{address2}</div></tpl>',
                                            '<tpl if="address3"><div>{address3}</div></tpl>',
                                            '<tpl if="address4"><div>{address4}</div></tpl>',
                                            '<div>{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',
                                        '</tpl>',
                                    '</td><td>',
                                        '<div class="label">Shipping Method</div>',
                                        '<div>{shippingMethodName}</div>',
                                        '<div class="label">Total Weight</div>',
                                        '<div>{weight:currency(" lbs", 1, true)}</div>',
                                    '</td><td>',
                                        '<div class="label">Packaging Type</div>',
                                        '<div>{packagingType}</div>',
                                    '</td><td>',
                                        '<div class="label">Tracking Number</div>',
                                    '</td>',
                                '</tr><tr>',
                                    '<td colspan="4"><table class="grid">',
                                        '<thead><tr>',
                                            '<th>Code</th>',
                                            '<th>Products</th>',
                                            '<th>Weight</th>',
                                            '<th>Quantity</th>',
                                        '</tr></thead>',
                                        '<tbody><tpl for="items"><tr>',
                                            '<td>{productCode}</td>',
                                            '<td>{productName}</td>',
                                            '<td>{weight:currency(" lbs", 1, true)}</td>',
                                            '<td>{quantity}</td>',
                                        '</tr></tpl></tbody>',
                                    '</table></td>',
                                '</tr>',
                            '</tbody></table></tpl>',
                        '</div></tpl>',
                        '<tpl if="totalPickupItems && pickups && pickups.length"><div class="subsection-wrapper">',
                            '<h3>In-Store Pickup</h3>',
                            '<tpl for="pickups"><table class="subsection"><tbody>',
                                '<tr>',
                                    '<td>Pickup #{#}</td>',
                                    '<td>Status: {status}</td>',
                                '</tr><tr>',
                                    '<td>',
                                        '<div class="label">Location</div>',
                                        '<div>{fulfillmentLocationCode}</div>',
                                    '</td><td>',
                                        '<div class="label">Pickup Date</div>',
                                        '<div>{fulfillmentDate:date("m/d/Y")}</div>',
                                    '</td>',
                                '</tr><tr>',
                                    '<td colspan="4"><table class="grid">',
                                        '<thead><tr>',
                                            '<th>Code</th>',
                                            '<th>Products</th>',
                                            '<th>Weight</th>',
                                            '<th>Quantity</th>',
                                        '</tr></thead>',
                                        '<tbody><tpl for="items"><tr>',
                                            '<td>{productCode}</td>',
                                            '<td>{productName}</td>',
                                            '<td>N/A</td>',
                                            '<td>{quantity}</td>',
                                        '</tr></tpl></tbody>',
                                    '</table></td>',
                                '</tr>',
                            '</tbody></table></tpl>',
                        '</div></tpl>',
                    '</div>',
                '</tpl>',
            '</td></tr></tbody>',
            '</table>',
            {
                getAttributeName: function (val) {
                    var rec = attributeStore.getById(val.attributeFQN)
                    return (rec) ? rec.get("name") :  "";
                }
            }
        );

        cssText = 'body{font-family:"Source Sans Pro",tahoma,sans-serif;font-size:14px;line-height:1;margin:0;padding:0}h1,h2,h3{font-weight:600;margin:0}table{border-collapse:collapse;font-size:inherit;line-height:inherit}.section{border-bottom:1px solid #b3b3b3;padding-bottom:10px}.section>h2{border-bottom:1px solid #bfbfbf;font-size:17px;line-height:1;margin:0 2%;padding:17px 1% 16px}.subsection-wrapper{margin:10px 2%}.subsection-wrapper>h3{padding:7px 2%}.subsection-wrapper .grid{margin-left:0;margin-right:0;width:100%}.subsection{margin:0 2%;width:96%}.subsection .label{font-weight:600;margin:14px 0 7px}.subsection .label:nth-of-type(1){margin-top:0}.subsection td{padding:7px 7px 0 0;vertical-align:top}.grid{border:1px solid #bfbfbf;margin:10px 2%;width:96%}.grid th{background-color:#e5e5e5;font-weight:600;padding:8px 14px;text-align:left;white-space:nowrap}.grid td{border-top:1px solid #bfbfbf;padding:8px 14px;text-align:left}.grid tr:nth-of-type(1) td{border-top-width:0}.panes{margin:10px 2%;width:96%}.panes td{border-left:1px solid #bfbfbf;padding:2px 14px 8px;vertical-align:top;width:33%}.panes td:nth-of-type(1){border-left-width:0}.panes .label{color:#b3b3b3;font-size:13px;margin-bottom:7px}.panes .price-total{font-size:24px;margin-bottom:7px}.panes .item-total{font-size:16px}.print-order-page{width:100%}.header th{border-bottom:1px solid #b3b3b3;font-weight:400;padding:14px 2%;text-align:left;vertical-align:top;width:33%}.header .company-info h1{font-size:24px}.header .company-contacts{text-align:center;vertical-align:middle}.header .order-essentials{text-align:right}.header .order-essentials .order-number{font-size:17px;font-weight:600;margin-bottom:3px}.header .order-essentials .order-number .label{color:#b3b3b3;font-weight:400}.header .order-essentials .order-date .label{font-weight:600}.footer td{padding:14px 3%}.section-attributes .attribute{margin:10px 4%}.section-attributes .attribute span{font-style:italic;margin-right:10px}.section-attributes .attribute .label{font-style:normal;font-weight:600}.section-orderitems .product-name{margin-bottom:4px;}.section-orderitems .bundled-product,.section-orderitems .product-option{border-left:2px solid #ddd;line-height:1.2;margin-left:4px;padding-left:6px;}.section-orderitems .product-option-label{color:#b3b3b3;font-size:12px;font-style:normal;margin-right:8px;text-transform:uppercase;}';

        styleEl.setAttribute('type', 'text/css');

        if (Ext.isIE) {
            doc.head.appendChild(styleEl);
            styleEl.styleSheet.cssText = cssText;
        } else {
            try {
                styleEl.appendChild(doc.createTextNode(cssText));
            } catch (e) {
                styleEl.cssText = cssText;
            }
            doc.head.appendChild(styleEl);
        }

      
       

        tpl.overwrite(doc.body, Ext.apply( me.record.getData(), { orderRecord: me.record }), false);
    }
});
