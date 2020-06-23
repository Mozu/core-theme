/**
 * @class Taco.view.order.subform.Detail
 * Shows the details of the order. Includes order items, disounts, shipping, totals
 * 
 */

Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.model.OrderItemDiscount',
        'Taco.store.PriceLists',
        'Taco.store.RuntimePriceLists',
        'Taco.view.order.widget.OrderTotalPanel',
        'Taco.view.order.widget.OrderItemGrid',
        'Taco.view.order.modal.EditOrderDetail',
        'Taco.shared.view.form.ExtensibleAttribute',
        'Taco.view.order.subform.InternalNotes',
        'Taco.core.ux.form.ResendEmailButton',
        'Ext.tip.QuickTipManager'
    ],
    alias: 'widget.taco-orderdetail',
    itemId: 'orderDetailPanel',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.order_details,
    headerToolbar: true,

    bodyPadding: '0 0 0 0 ',

    config: {
        // order model
        record: null,

        // determines whether the detailGrid allows field editing
        editMode: false,

        totalColumnWidth: 100,

        // width of the row total Column. used to align the grid total container
        rowTotalColumnWidth: 150,

        itemId: "orderDetails"
    },
    orderUpdateBehaviors: [
        { model: 'Taco.model.Order', behavior: 'update' },
        { model: 'Taco.model.Order', behavior: 'updateItem' },
        { model: 'Taco.model.Order', behavior: 'updatePrice' },
        { model: 'Taco.model.Order', behavior: 'updateDiscount' },
        { model: 'Taco.model.Order', behavior: 'updateAttribute' },
        { model: 'Taco.model.Order', behavior: 'manualAdjustment' }
    ],


    // width of the actionColumn. used to align the grid total container
    actionColumnWidth: 120,
    priceListStore: null,
    priceListName: '',

    initComponent: function(eOpts) {
        var me = this;
        this.titleTemplate = new Ext.XTemplate(
            Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.order_details + '<tpl if="priceListAvail"> | {priceListName}' +' '+ Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.pricing + '</tpl>' +
            '<tpl if="parentCheckoutAvail">' +
            '<div class="order-detail-parentCheckoutId-container">' +
            '<div class="order-detail-parentCheckoutId-text">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.order_reference_number + '{parentCheckoutNumber}</div>' +
            '<i id="order-reference-tool-tip-icon" data-qtip="<p class=order-reference-top-line > ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.this_is_part + ' {partialOrderNumber} ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.of + ' {partialOrderCount} ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.for_order_reference_number + ' {parentCheckoutNumber}</p><p class=order-reference-bottom-line > ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.order_is_displayed_in_parts_because_it_contains_items_shipping_to_multiple_addresses + '</p>" class="parentCheckoutTooltip mozu-c-tooltip__icon mozu-c-tooltip__icon--switch mozu-c-tooltip__icon--dense mozu-c-tooltip__icon--left">' +
            '</i>' +
            '</div>' +
            '</tpl>'
        );
        Ext.tip.QuickTipManager.init();

        // Create the PriceListStore.
        this.priceListStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.RuntimePriceLists',
            createOnly: true,
            autoLoad: false,
            clearFilters: true,
            remoteFilter: false,
            filterOnLoad: true,
            clearSort: false,
            remoteSort: false,
            sorters: [{ property: 'name' }]
        });

        this.priceListStore.load(
            {
                callback: function(records, operation, success) {
                    // Add a "None" option to the top to clear the price list.
                    me.priceListStore.insert(0,
                        Ext.create(me.priceListStore.model,
                            {
                                name: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none,
                                code: '',
                                filteredInStorefront: false,
                                isSiteDefault: false
                            }));

                    // Hacky crap to grab an inactive price list from ProductAdmin, then convert it to a "runtime" pricelist.
                    var currentCode = me.record.get('priceListCode');
                    if (currentCode) {
                        var foundRecord = me.priceListStore.findRecord('code', me.record.get('priceListCode'), 0, false, false, true);
                        if (!foundRecord) {
                            var adminPriceListStore = Taco.core.data.StoreManager.getOrCreate({
                                type: 'Taco.store.PriceLists',
                                autoLoad: false
                            });
                            adminPriceListStore.load({
                                params: {
                                    id: currentCode
                                },
                                callback: function(records, operation, success) {
                                    if (!success) return;

                                    var adminRecord = records[0];
                                    me.priceListStore.add(
                                        Ext.create(me.priceListStore.model, {
                                            name: adminRecord.get('name'),
                                            code: adminRecord.get('code'),
                                            filteredInStorefront: adminRecord.get('filteredInStorefront'),
                                            isSiteDefault: adminRecord.get('defaultForSites').indexOf(me.record.get('siteId')) > 0 ? true : false,
                                            isActive: false
                                        })
                                    );
                                    me.retrievePricelistName(me.priceListStore);
                                    me.setTitle(me.constructTitle());
                                }
                            });
                        }
                    }

                    me.retrievePricelistName(me.priceListStore);
                    me.setTitle(me.constructTitle());
                },
                scope: this
            }
        );

        // after the record is reloaded we will need to refresh the ui
        me.mon(me.record, "aftercommit", function() {
            me.onRecordChange();
        }, me);

        this.cls += ' ' + Taco.baseCSSPrefix + 'orderform-detail';

        // Sort this store by LineId first!
        this.record.itemsStore.sort({
            sorterFn: function(a, b) {
                if (a.get('lineId') === b.get('lineId')) {
                    return 0;
                }
                return (a.get('lineId') < b.get('lineId') ? -1 : 1);
            }
        });

        // store that contains the orderItems for this order model
        var orderItemStore = this.record.itemsStore;

        // plugin to add suppourt to the grid for editing the price and quantity columns
        var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        // readonly list of products and discounts;
        me.detailGrid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            editMode: this.getEditMode(),
            record: this.record,
            store: orderItemStore,
            actionColumnWidth: me.actionColumnWidth,
            autoHeight: true,
            listeners: {
                'draftOrderRemoved': {
                    fn: function(data) {
                        me.detailGrid.removeDocked(me.detailGrid.hasDraftToolbar, true);
                        me.detailGrid.hasDraftToolbar = null;
                    },
                    scope: me
                },
                'orderAccepted': {
                    fn: function() {
                        me.record.reload();
                    }
                },
                'reOrder': {
                    fn: function () {
                        me.record.reload();
                    }
                },
                'orderCancelled': {
                    fn: function() {
                        me.record.reload();
                    },
                    scope: me
                }
            }
        });

        // subtotals, orderlevel discounts, tax shipping, and totals
        this.totalRow = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
            margin: '0 0 20 0',
            record: me.record,
            //data: me.record.getData(),
            totalColumnWidth: me.getRowTotalColumnWidth(),
            //actionColumnWidth: me.actionColumnWidth
        });

        // customer notes class
        this.customerNoteRow = Ext.create('Ext.panel.Panel', {
            //cls: "orderform-detail-customerNotesRow",
            ui: "subform-section",
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.customer_notes,
            margin: "0 0 20px 0 ",
            bodyStyle: "padding:20px 0px 40px 0px ",
            tpl: [
                '<div class="customerNote">',
                    '<tpl if="values.customerNote">',
                        '{customerNote:htmlEncode}',
                    '<tpl else>',
                        '<span class="order-no-content">N/A</span>',
                    '</tpl>',
                '</div>'
            ],
            data: this.record.getData()
        });

        this.giftMessageRow = Ext.create('Ext.panel.Panel', {
            //cls: "orderform-detail-customerNotesRow",
            ui: "subform-section",
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.gift_message,
            margin: "0 0 20px 0 ",
            bodyStyle: "padding:20px 0px 40px 0px ",
            tpl: [
                '<div class="customerNote">',
                '<tpl if="values.giftMessage">',
                '{giftMessage:htmlEncode}',
                '<tpl else>',
                '<span class="order-no-content">N/A</span>',
                '</tpl>',
                '</div>'
            ],
            data: this.record.getData()
        });

        me.internalNoteRow = Ext.create('Taco.view.order.subform.InternalNotes', {
            record: this.record,
            orderForm: this
        });

        var attributeGridStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.OrderAttributes',
            createOnly: true
        });

        this.orderAttrGrid = Ext.create('Taco.view.order.subform.Attributes', {
            ui: "subform-section",
            headerToolbar: true,
            attributeDefinitionStore: attributeGridStore,
            record: this.record,
            orderForm: this
        });

        //todo refactor attributes to encapsolate this form; and to make the dialog auto destroy;
        this.orderAttr = Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.attributes,
            header: false,
            record: this.record,
            ui: "form",
            attributeDefinitionStore: attributeGridStore
        });

        Ext.apply(this, {
            items: [
                {
                    padding: '0 40 0 0',
                    height: 20,
                    cls: '',
                    html: '<div class="order-detail-pill"> <span class="x-column-content-pill x-column-content-pill-true order-detail-pill-size">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.perform_operations + '</span></div>',
                    hidden: this.record.get('isUnified')
                },
                {
                    xtype: "panel",
                    ui: "subform-section",
                    headerToolbar: true,
                    tools: this.record.get('isUnified') ? me.getButtonActions() : null,
                    title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.items_ordered,
                    items: [
                        me.detailGrid,
                        this.totalRow
                    ]
                },
                this.orderAttrGrid,
                this.customerNoteRow,
                this.giftMessageRow,
                this.internalNoteRow
            ]
        });

        this.callParent(arguments);
    },
    constructTitle: function () {
        var me = this;
        return this.titleTemplate.apply({
            orderNumber: me.record ? me.record.get('orderNumber') : '<New>',
            priceListAvail: me.record && me.record.get('priceListCode').length > 0 ? true : false,
            priceListName: me.priceListName && me.priceListName.length > 0 ? me.priceListName : me.record.get('priceListCode'),
            parentCheckoutAvail: me.record && me.record.get('partialOrderCount') > 1 ? true : false,
            parentCheckoutNumber: me.parentCheckoutNumber && me.parentCheckoutNumber.length > 0 ? me.parentCheckoutNumber : me.record.get('parentCheckoutNumber'),
            partialOrderNumber: me.record.get('partialOrderNumber'),
            partialOrderCount: me.record.get('partialOrderCount'),
            parentOrderNumber: me.parentOrderNumber && me.parentOrderNumber.length > 0 ? me.parentOrderNumber : me.record.get('parentOrderNumber')
        });
    },

    retrievePricelistName: function (store) {
        var me = this;
        // This searches the store and finds an exact match!
        var foundRecord = store.findRecord('code', me.record.get('priceListCode'), 0, false, false, true);
        if (foundRecord) {
            me.priceListName = foundRecord.get('name');
        }
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
            priceListStore: me.priceListStore,
            priceListName: me.priceListName,
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
        // Update the title:
        me.retrievePricelistName(this.priceListStore);
        me.setTitle(me.constructTitle());
        // Record is reloaded, need to update the ui.
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

        me.customerNoteRow.update(me.record.data);
        me.giftMessageRow.update(me.record.data);

        me.detailGrid.record = me.record;
        // todo: update the internalNotes
        //me.internalNoteRow.setRecord(me.record);

        me.rebuildItems();
        me.updateHasDraftToolbar();
        me.updateButtonActions();
    },

    // update whether the buttons are enabled or disabled with every update of the record;
    updateButtonActions: function () {
        var me = this,
            partialOrderCount = me.record.get('partialOrderCount') || 0,
            availableActions = me.record.get("availableActions"),
            canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
            canEdit = !Ext.Array.contains(['Completed', 'Cancelled'], me.record.get('orderStatus')) && partialOrderCount < 2,
            canSendEmail = !Ext.Array.contains(['Pending'], me.record.get('orderStatus')),
            acceptOrderButton = this.down("#acceptOrderButton"),
            cancelOrderButton = this.down("#cancelOrderButton"),
            editStorefrontButton = this.down ("#editStorefrontButton"),
            editOrderButton = this.down("#editOrderButton"),
            canEditInStoreFront = !(me.record.get('items') && me.record.get('items').length ),
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
        if ( editStorefrontButton){
            editStorefrontButton.setDisabled(!canEditInStoreFront);
        }

        if (resendEmailButton) {
            resendEmailButton.setVisible(canSendEmail);
        }
    },

    getButtonActions: function () {
        var me = this,
            partialOrderCount = me.record.get('partialOrderCount') || 0,
            availableActions = me.record.get("availableActions"),
            canAccept = Ext.Array.indexOf(availableActions, "AcceptOrder") != -1,
            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
            canEdit = !Ext.Array.contains(['Completed', 'Cancelled', 'Abandoned'], me.record.get('orderStatus')) && partialOrderCount < 2,
            canSendEmail = !Ext.Array.contains(['Pending', 'Abandoned'], me.record.get('orderStatus')),
            canEditInStoreFront = !(me.record.get('items') && me.record.get('items').length ),
            buttons;

        buttons = [
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.accept_order,
                itemId: 'acceptOrderButton',
                requiredBehaviors: me.orderUpdateBehaviors,
                handler: function () {
                    this.detailGrid.acceptOrder();
                },
                scope: me,
                hidden: !canAccept
            },
            {
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.cancel_order,
                xtype: "button",
                ui: "action",
                itemId: "cancelOrderButton",
                scale: "medium",
                margin: {
                    right: 2
                },
                requiredBehaviors: me.orderUpdateBehaviors,
                handler: function () {
                    this.detailGrid.cancelOrder();
                },
                scope: me,
                disabled: this.record.get('orderStatus') == Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Statuses.pendingreview ? false : true
            },
            {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.print_order,
                requiredBehaviors: me.orderUpdateBehaviors,
                margin: {
                    right: 2
                },
                handler: me.openPrintWindow,
                scope: me
            }, {
                xtype: 'resendemailbutton',
                itemId: "resendEmailButton",
                margin: '0 0 0 10',
                requiredBehaviors: me.orderUpdateBehaviors,
                emailUrl: '/admin/app/order/resendconfirmationemail',
                jsonData: {
                    orderId: this.record.getId()
                },
                disabled: !canSendEmail
            },{
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.edit_details,
                xtype: "button",
                ui: "action",
                itemId: "editOrderButton",
                scale: "medium",
                handler: this.editOrder,
                requiredBehaviors: me.orderUpdateBehaviors.concat([{
                    model: 'Taco.model.Order',
                    behavior: 'fulfill'
                }]),
                scope: me,
                disabled: !canEdit
            },
            {
                // Deprecated by the "View User's Cart" link in the order's Header.js.
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.edit_in_storefront,
                xtype: "button",
                ui: "action",
                itemId: "editStorefrontButton",
                scale: "medium",
                handler: function (){
                    Taco.core.StateManager.attemptNavigate('/orders/storefront/' + me.record.get('customerId') +'/' + me.record.getId());
                },
                requiredBehaviors: me.orderUpdateBehaviors,
                scope: me,
                disabled: !canEditInStoreFront,
                hidden: !Taco.tenantSettings.enableOrderEditInStorefront
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
