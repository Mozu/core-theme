/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.ProcessReturnPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.modal.AddRefund',
        'Taco.view.order.widget.ReturnInternalNotesGrid',
        'Taco.view.order.widget.ReturnReplacementGrid'
    ],

    ui: 'subform-section-child',
    bodyPadding: '10 10 10 10',

    collapsible: true,

    config: {
        order: null,
        record: null,
        returnId: null,
    },

    initComponent: function () {
        var order = this.getOrder();
        var record = this.getRecord();

        // set up stores
        this.itemsStore = record.getItems();
        this.paymentsStore = record.getPayments();
        this.internalNoteStore = record.getInternalNotes();
        this.orderItemsStore = order.items('returnOrderId');
        // here we will need to get the orders that have 
        //this.replacementOrderStore = 

        // Sort the stores:
        this.itemsStore.sort({
            sorterFn: function (a, b) {
                if (a.get('orderLineId') === b.get('orderLineId')) {
                    return 0;
                }
                return (a.get('orderLineId') < b.get('orderLineId') ? -1 : 1);
            }
        });

        this.orderItemsStore.sort({
            sorterFn: function (a, b) {
                if (a.get('lineId') === b.get('lineId')) {
                    return 0;
                }
                return (a.get('lineId') < b.get('lineId') ? -1 : 1);
            }
        });

        // set up major components
        this.itemsGrid = this.initItemsGrid();
        this.paymentsGrid = this.initPaymentsGrid();
        this.replacementsGrid = this.initReplacementsGrid();
        this.internalNotesGrid = this.initInternalNotesGrid();
        this.status = this.initStatus(record);
        this.summary = this.initSummary(record);
        this.returnActions = this.initReturnActions();

        // set up other controls
        this.moveButton = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Move To',
            disabled: true,
            cls: 'fulfillment-move-to',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                items: [{
                    text: 'Remove',
                    handler: function () {
                        console.log('remove this item');
                    }
                }]
            }
        });

        this.rmaDeadline = Ext.create('Ext.form.field.Date', {
            name: 'rmaDeadline',
            fieldLabel: 'Return Due',
            width: 300,
            margin: '0 10 0 0',
            labelAlign: 'left',
            labelWidth: 80,
            value: this.getRecord().get('rmaDeadline'),
            listeners: {
                change: {
                    scope: this,
                    buffer: 500,
                    fn: function (field, newValue) {
                        if (field.isValid() && field.isDirty()) {
                            var origStr = (field.originalValue) ? Ext.Date.clearTime(field.originalValue).toString() : "";
                            var newStr = (newValue) ? newValue.toString() : "";

                            // check to make sure the date has changed by stripping out the time from the dates and compare them;
                            if (origStr === newStr) return;

                            var valueToPersist = "";
                            if (newValue) {
                                //clone of newValue with time removed - start of day
                                valueToPersist = Ext.Date.clearTime(newValue, true);
                                // add a single day;
                                valueToPersist = Ext.Date.add(valueToPersist, Ext.Date.DAY, 1);
                                // remove a millisecond so this is the end of the original day
                                valueToPersist = Ext.Date.subtract(valueToPersist, Ext.Date.MILLI, 1);
                            }

                            var record = this.getRecord();
                            record.set('rmaDeadline', valueToPersist);
                            this.onItemEdit();
                        }
                    }
                }
            }
        });

        Ext.apply(this, {
            id: this.returnId,
            name: this.returnId,
            items: [
                this.status,
                this.itemsGrid, {
                    xtype: 'container',
                    padding: '10 0 0 0',
                    layout: {
                        type: 'hbox',
                        align: 'top',
                        pack: 'end'
                    },
                    items: [this.rmaDeadline, {
                            xtype: 'tbfill'
                    },
                        this.moveButton]
                },
                this.paymentsGrid,
                this.replacementsGrid,
                this.internalNotesGrid
            ],
            tools: [
                this.summary,
                {
                    xtype: 'component',
                    flex: 1
                },
                this.returnActions
            ]
        });

        this.callParent(arguments);

        this.on({
            boxready: {
                scope: this,
                fn: function () {
                    var header = this.getHeader();
                    var titleCmp = header.titleCmp;

                    titleCmp.flex = 0;
                    titleCmp.hide();
                    header.move(0, 2);
                    header.doComponentLayout();
                    this.addCls('return-item return-process');

                    this.mon(this, 'update-return-buttons', function (r) {
                        //get the menu item that is 'Close' and set hidden to false!
                        var menuItems = this.returnFinishedButton.menu.items.items;
                        for (var item in menuItems) {
                            if (menuItems[item].hasOwnProperty('itemId')
                                && menuItems[item].itemId === "Close") {
                                menuItems[item].hidden = false;
                            }
                        }
                    });
                }
            }
        });

        this.mon(record, {
            aftercommit: {
                scope: this,
                fn: 'onAfterCommit'
            }
        });
    },

    handleActionClick: function (button) {
        var me = this;

        this.setLoading(true);
        var buttonId = button.getItemId();

        this.getRecord().performAction(buttonId, {
            success: function () {
                // if the user rejects or cancels the return we need to update the returnable items grid since the qty returned will change;
                // if the user closes a return, we need to update the order return status.
                if (buttonId === 'Cancel' || buttonId === 'Reject' || buttonId === 'Close') {
                    me.getOrder().reload({
                        success: function () {
                            me.fireEvent("refresh-returnable-items");
                        },
                        scope: me
                    });
                }
                // Fire an event here that will trigger the close button hide to display. This event would be called 'update-return-buttons'
                //  and would only fire when the buttonId === 'Authorize'
                if (buttonId === 'Authorize') {
                    me.fireEvent('update-return-buttons');
                }
            },
            callback: function () {
                me.setLoading(false);
            }
        });
    },

    handleRefundClick: function () {
        var me = this;
        var retRecord = me.getRecord();
        var payments = me.getOrder().get('payments');

        if (!Ext.isArray(payments)) {
            payments = [];
        }

        // dont allow Declined or Voided payments to be refunded
        payments = payments.filter(function(p) { 
            // Copied logic from CommerceRuntime CreditPayment.CanPerform()
            var isCreditedWithBalance = (p.status === 'Credited' || p.status === 'CreditPending') && (p.amountCollected > p.amountCredited);
            var isCollected = p.status === 'Collected';
            var isCheckOrStoreCredit = p.paymentType === 'Check' || p.paymentType === 'StoreCredit';
            return isCreditedWithBalance || isCollected || isCheckOrStoreCredit;
        });

        // ugh removing _keys
        // for bug #94350
        payments.forEach(function(p) {
            delete p._key;
        });

        var returnItems = retRecord.get('items');
        var key = retRecord.get('id');

        var containsNewPayments = payments.find(function(p) {
            return p && (p.paymentType === 'newStoreCredit' || p.paymentType === 'newCheck');
        });

        // adding new store credit to grid
        if (!containsNewPayments) {
            payments.push(
                { paymentType: 'newStoreCredit' },
                { paymentType: 'newCheck' }
            );
        }

        var config = {
            metadata: {
                orderPayments: payments,
                returnItems: returnItems,
                returnNumber: retRecord.get('returnNumber'),
                returnId: retRecord.get('id'),
                refundFailure: function() {
                    me.setLoading(false);
                    Taco.app.fireEvent('setmessage', 'There was an error processsing this refund', 'error');
                },
                refundSuccess: me.handleRefundSuccess.bind(me),
                refundDismiss: function() {
                    me.setLoading(false);
                }
            }
        };

        me.setLoading(true);

        // This is coming from mozu-adminui
        window.globalModalEmitter.emit('open', {
            modalType: 'ReturnRefundModal',
            key: key,
            config: config
        });
    },

    handleRefundSuccess: function (record) {
        var me = this;
        // update current record with new data.
        me.getOrder().reload({
            success: function() {
                me.getRecord().reload();
                me.setLoading(false);
            }
        });
    },

    handleShipClick: function () {
        var me = this;
        this.setLoading(true);
        this.getRecord().createReplacementOrder({
            success: function (response) {
                var json = Ext.decode(response.responseText, true).items;
                Taco.core.StateManager.attemptNavigate('s-' + json.siteId + '/orders/edit/' + json.id);
            },
            callback: function () {
                me.setLoading(false);
            }
        });
    },

    initItemsGrid: function () {
        var me = this;

        return Ext.create('Ext.grid.Panel', {
            title: 'Items',
            cls: 'return-item-grid',
            margin: '10 0 0 0',
            store: this.itemsStore,
            selModel: {
                selType: 'checkboxmodel',
                injectCheckbox: 'last',
                headerWidth: 37,
                checkOnly: true,
                showHeaderCheckbox: true
            },
            viewConfig: {
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false
            },
            columns: [{
                dataIndex: 'orderItemId',
                text: 'Code',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1,
                minWidth: 120,
                renderer: function (value, meta, record) {
                    // Why are we getting the order item if we have a product code?
                    var productCode = record.get('productCode'),
                        oItem = productCode ? me.orderItemsStore.getById(record.get('orderItemId')) : null;

                    if (productCode) return productCode;
                    return oItem ? oItem.get('productCode') : '--';
                }
            },
            {
                dataIndex: 'orderItemId',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1,
                minWidth: 120,
                renderer: function (value, meta, record) {
                    // This all seems a bit overly complex. The return item has the product name from the API, just need to add a field for it.
                    // This was using the order item product name. Why would that not exist but the return item product name would?
                    var productCode = record.get('productCode'),
                        orderItemId = record.get('orderItemId'),
                        oItem = orderItemId ? me.orderItemsStore.getById(orderItemId) : null,
                        rItem = !oItem && productCode ? Ext.Array.filter(me.order.data.returnableItems, function(ri) { return ri.productCode === productCode })[0] : null;

                    var productNameFromOrderItem = oItem ? oItem.get('productName') : null;
                    var productNameFromReturnItem = rItem ? rItem.productName : null;
                    return productNameFromOrderItem || productNameFromReturnItem ||  '--';
                }
            },
            {
                dataIndex: 'productTotal',
                text: 'Price & Tax',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                renderer: function (value, meta, record) {
                    return Taco.app.context.getCurrent().formatCurrency(value);
                }
            },
            {
                dataIndex: 'productLossAmount',
                text: 'Loss',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    showBorder: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    minValue: 0
                },
                renderer: function (value) {
                    return Taco.app.context.getCurrent().formatCurrency(value);
                }
            },
            {
                dataIndex: 'returnType',
                text: 'Return Type',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            },
            {
                dataIndex: 'returnReason',
                text: 'Reason',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 120
            },
            {
                dataIndex: 'quantity',
                text: 'Qty',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 80
            },
            {
                dataIndex: 'quantityReceived',
                text: 'Qty Ret\'d',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 80,
                editor: {
                    xtype: 'numberfield',
                    showBorder: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    minValue: 0
                }
            },
            {
                dataIndex: 'quantityRestockable',
                text: 'Restockable',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    showBorder: true,
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    minValue: 0
                }
            },
            {
                dataIndex: 'refundAmount',
                text: 'Refunded',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                renderer: function (value, meta, record) {
                    return Taco.app.context.getCurrent().formatCurrency(value);
                }
            },
            {
                dataIndex: 'quantityReplaced',
                text: 'Replaced',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 80
            }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            listeners: {
                beforeedit: {
                    scope: this,
                    fn: function () {
                        return !this.isAtEndState();
                    }
                },
                edit: {
                    scope: this,
                    fn: 'onItemEdit'
                },
                selectionchange: {
                    scope: this,
                    fn: function (selModel, selected) {
                        this.moveButton.setDisabled(Ext.isEmpty(selected));
                    }
                }
            }
        });
    },

    initReplacementsGrid: function() {
        var me = this;
        var repOrderId = this.getRecord().get('returnOrderId');

        me.replacementsStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.Order'
        });

        var repGrid = Ext.create('Taco.view.order.widget.ReturnReplacementGrid', {
            store: me.replacementsStore
        });

        if (repOrderId) {
            var config = {
                success: function (response) {
                    if (response) {
                        me.replacementsStore.add(response);
                    }
                }
            };
            Taco.model.Order.load(repOrderId, config);
        }

        return Ext.create('Ext.panel.Panel', {
            hidden: !repOrderId ? true : false,
            margin: '10 0 0 0',
            items: [
                repGrid
            ]
        });
    },

    initInternalNotesGrid: function () {
        var me = this;
        var notesGrid = Ext.create('Taco.view.order.widget.ReturnInternalNotesGrid', {
            store: this.internalNoteStore
        });
        return Ext.create('Ext.panel.Panel', {
            margin: '10 0 0 0',
            items: [
                  {
                    xtype: 'container',
                    padding: '10 0 0 0',
                    layout: {
                        type: 'hbox',
                        align: 'top',
                        pack: 'end'
                    },
                    items: [
                        {
                            xtype: 'button',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Add Internal Note',
                            name: 'addInternalNoteButton',
                            itemId: 'addInternalNoteButton',
                            scope: this,
                            handler: function() {
                                me.addInternalNoteDialog();
                            }
                        }
                    ]
                },
                notesGrid
            ]
        });
    },

    addInternalNoteDialog: function(callbackFn, callbackArgs) {
        var me = this;

        if (this.internalNotesDialog && !this.internalNotesDialog.isDestroyed) {
            this.internalNotesDialog.show();
        } else {
            this.internalNotesDialog = Ext.create('Taco.core.ux.window.Modal', {
                autoShow: true,
                scale: 'small',
                title: 'Add Internal Note',
                // overflowY: 'auto',
                closeOnSave: true,
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: 'textareafield',
                        name: 'noteText',
                        itemId: 'noteText',
                        fieldLabel: 'Internal Note',
                        allowBlack: false,
                        width: '100%',
                        height: '100%'
                    }
                ],
                doSave: function () {
                    var modal = this;
                    var newNote = modal.down('#noteText').getValue();
                    // If newNote is empty, don't make request.
                    if (newNote) {
                        var config = {
                            url: '/admin/app/return/internalnotes/create',
                            method: 'POST',
                            jsonData: [
                                {
                                    returnId: me.record.get('id'),
                                    text: newNote
                                }
                            ],
                            success: function(response) {
                                if (response && response.responseText) {
                                    var data = JSON.parse(response.responseText);
                                    for (var i in data.items) {
                                        var newModel = Ext.create('Taco.model.ReturnInternalNote', data.items[i]);
                                        me.internalNoteStore.add(newModel);
                                    }
                                }
                                modal.down('#noteText').setValue('');
                                if (callbackFn) {
                                    callbackFn.bind(me, callbackArgs)();
                                }
                                modal.saveSuccess(newNote);
                            },
                            failure: function(response) {
                                if (response && response.responseText) {
                                    var retData = JSON.parse(response.responseText);
                                    Taco.app.fireEvent('setmessage', retData.items[0].message, 'error');
                                }
                            }
                        }
                        Ext.Ajax.request(config);
                    } else {
                        modal.down('#noteText').setValue('');
                        me.internalNotesDialog.close();
                    }
                },
                listeners: {
                    cancel: {
                        fn: function () {
                            // DETERMINE THIS AND CLEAR TEXT ON CANCEL.
                            this.down('#noteText').setValue("");
                            if (callbackFn) {
                                callbackFn.bind(me, callbackArgs)();
                                return;
                            }
                        }
                    }
                }
            });
        }
    },

    initPaymentsGrid: function () {
        return Ext.create('Ext.grid.Panel', {
            title: 'Refunds',
            cls: 'return-item-grid',
            margin: '10 0 0 0',
            hidden: !(this.paymentsStore.getRange().length),
            store: this.paymentsStore,
            viewConfig: {
                emptyText: '<div class="empty-grid-message">No refunds to display</div>',
                trackOver: false,
                disableSelection: true,
                deferEmptyText: false
            },
            columns: [{
                dataIndex: 'paymentType',
                text: 'Payment Type',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1
            }, {
                dataIndex: 'cardType',
                text: 'Card Type',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1
            }, {
                dataIndex: 'cardNumber',
                text: 'Card Number',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1
            }, {
                dataIndex: 'amountRefunded',
                text: 'Amount Credited',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1,
                renderer: function (value) {
                    return Taco.app.context.getCurrent().formatCurrency(value);
                }
            }]
        });
    },

    initReturnActions: function () {
        var me = this;
        this.returnFinishedButton = Ext.widget('splitbutton', {
            cls: 'return-end-menu',
            menuAlign: 'tr-br?',
            itemId: 'Cancel',
            text: 'Cancel',
            handler: function (button) {
                me.addInternalNoteDialog(me.handleActionClick, button);
            },
            menu: new Ext.menu.Menu({
                items: [
                    {
                        itemId: 'Close',
                        text: 'Close',
                        handler: function (button) {
                            me.addInternalNoteDialog(me.handleActionClick, button);
                        },
                        hidden: me.getRecord().get('status') === 'Created',
                        scope: me
                    }, {
                        itemId: 'Reject',
                        text: 'Reject',
                        handler: function (button) {
                            me.addInternalNoteDialog(me.handleActionClick, button);
                        },
                        scope: me
                    }
                ]
            }),
            scope: me,
            ui: 'action',
            scale: 'medium'
        });
        
        return Ext.create('Ext.toolbar.Toolbar', {
            defaults: {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                margin: '0 0 0 10',
                hidden: true,
                scope: this,
                handler: this.handleActionClick
            },
            style: {
                backgroundColor: 'transparent'
            },
            items: [{
                itemId: 'Cancel',
                text: 'Cancel'
            }, {
                itemId: 'Reject',
                text: 'Reject'
            }, {
                itemId: 'Authorize',
                text: 'Authorize'
            }, {
                itemId: 'Refund',
                text: 'Refund',
                handler: this.handleRefundClick
            }, {
                itemId: 'Await',
                text: 'Await'
            }, {
                itemId: 'Receive',
                text: 'Receive'
            }, {
                itemId: 'Restock',
                text: 'Restock'
            }, {
                itemId: 'Ship',
                text: 'Replace',
                handler: this.handleShipClick
            },{
                itemId: 'RefundComplete',
                text: 'Refund Complete'
            },
            /*{
                itemId: 'Close',
                text: 'Close',
                listeners: {
                    boxready: {
                        scope: this,
                        fn: function (button) {
                            var id = this.getRecord().get('returnOrderId');

                            if (id) {
                                var orders = Ext.create('Taco.store.Orders', {
                                    autoLoad: true,
                                    filters: [{
                                        property: 'id',
                                        value: id
                                    }]
                                });

                                orders.on('load', function (store, records) {
                                    if (button) {
                                        button.setDisabled(records[0].get('orderStatus') !== 'Completed');
                                    }
                                });
                            }
                        }
                    }
                }
            },*/
            this.returnFinishedButton,
            {
                xtype:"resendemailbutton",
                itemId: "resendEmailButton",
                text: "Resend Email",
                emailUrl: '/admin/app/return/resendemail',
                handler: Ext.emptyFn,
                cls: 'fulfillment-move-to',
                listeners: {
                    menushow: function (button, menu) {
                        var status = this.record.get("status");
                        //iterate the child items and enable them and disable them based on the status of the rma entity;
                        Ext.Array.each(menu.items.items, function(item) {
                            var isEnabled = Ext.Array.contains(item.enabledWhen, status);
                            item.setVisible(isEnabled);
                        });
                    },
                    scope: this
                },
                menu: {
                    plain: true,
                    shadow: false,
                    items: [
                        {
                            text: "RMA Created",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Create"
                            },
                            enabledWhen: ["Created", "Authorized", "Pending", "Received", "Refunded", "Restocked", "Closed"]
                            
                        }, {
                            text: "RMA Authorized",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Authorize"
                            },
                            enabledWhen: ["Authorized", "Pending", "Received", "Refunded", "Restocked", "Closed"]
                        }, {
                            text: "RMA Received",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Receive"
                            },
                            enabledWhen: ["Received", "Restocked"]
                        }, {
                            text: "RMA Refunded",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Refund"
                            },
                            enabledWhen: ["Refunded", "Closed"]
                        }, {
                            text: "RMA Rejected",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Reject" 
                            },
                            enabledWhen: ["Rejected"]
                        }, {
                            text: "RMA Closed",
                            jsonData: {
                                returnIds: [this.record.getId()],
                                actionName: "Close"
                            },
                            enabledWhen: ["Closed"]
                        }

                        // disabling per #51821
                        //, {
                        //    text: "RMA Cancelled",
                        //    jsonData: {
                        //        returnIds: [this.record.getId()],
                        //        actionName: "Cancel"
                        //    },
                        //    enabledWhen: ["Cancelled"]
                        //}
                    ]
                }
            }],
            listeners: {
                afterlayout: {
                    scope: this,
                    single: true,
                    fn: 'updateReturnActions'
                }
            }
        });
    },

    initStatus: function (record) {
        var me = this;

        return Ext.create('Ext.Component', {
            cls: 'return-properties',
            data: record.getData(),
            tpl: [
                '<table><tbody>',
                    '<tr>',
                        '<tpl if="this.checkStatusColor(receiveStatus)">',
                            '<td><span class="label">Receive Status:<span><span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.receiveStatus)]}</span></span></span></td>',
                        '<tplelse>',
                            '<td><span class="label">Receive Status:<span><span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.receiveStatus)]}</span></span></span></td>',
                        '</tpl>',
                        '<tpl if="this.checkStatusColor(refundStatus)">',
                            '<td><span class="label">Refund Status:<span><span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.refundStatus)]}</span></span></span></td>',
                        '<tplelse>',
                            '<td><span class="label">Refund Status:<span><span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.refundStatus)]}</span></span></span></td>',
                        '</tpl>',
                        '<tpl if="this.checkStatusColor(replaceStatus)">',
                            '<td><span class="label">Replace Status:<span><span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.replaceStatus)]}</span></span></span></td>',
                        '<tplelse>',
                            '<td><span class="label">Replace Status:<span><span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.replaceStatus)]}</span></span></span></td>',
                        '</tpl>',
                        '<td><span class="label">Total Price & Tax:<span>{[Taco.app.context.getCurrent().formatCurrency(values.productTotal)]}</span></span></td>',
                        '<td><span class="label">Loss:<span>{[Taco.app.context.getCurrent().formatCurrency(Ext.Array.sum(Ext.Array.pluck(values.items, "productLossAmount")))]}</span></span></td>',
                '</tbody></table>', {
                    getUnitPriceTotal: function (items) {
                        var prices = Ext.Array.map(items, function (item) {
                            var oItem = this.orderItemsStore.getById(item.orderItemId);

                            return oItem ? oItem.get('unitPrice') : 0;
                        }, me);

                        return Taco.app.context.getCurrent().formatCurrency(Ext.Array.sum(prices));
                    },
                    checkStatusColor: function (status) {
                        var lowerCaseStatus = status.toLowerCase();
                        return lowerCaseStatus === 'fullyreceived'
                            || lowerCaseStatus === 'fullyrefunded'
                            || lowerCaseStatus === 'fullyreplaced'
                            || lowerCaseStatus === 'notrequested';
                    }
                }
            ]
        });
    },

    initSummary: function (record) {
        return Ext.create('Ext.Component', {
            cls: 'return-summary',
            data: record.getData(),
            style: {
                'white-space': 'nowrap'
            },
            tpl: [
                '<tpl if="status == ' + "'Authorized'" + '">',
                    '<span class="label">Return ID:<span>Return #{returnNumber} <span class="x-column-content-pill x-column-content-pill-true">{status}</span></span></span>',
                '<tplelse>',
                    '<span class="label">Return ID:<span>Return #{returnNumber} <span class="x-column-content-pill x-column-content-pill-false">{status}</span></span></span>',
                '</tpl>',
                '<span class="label">Created:<span>{createDate:date("m/d/Y g:ia")}</span></span>',
                '<span class="label">Amount Refunded:<span>{[Taco.app.context.getCurrent().formatCurrency(values.refundAmount)]}</span></span>',
                '<span class="label">Items:<span>{[values.items.length]}</span></span>'
            ]
        });
    },

    isAtEndState: function () {
        return Ext.isEmpty(this.getRecord().get('availableActions'));
    },

    onAfterCommit: function () {
        var data = this.getRecord().getData();

        this.updateReturnActions();
        this.status.update(data);
        this.summary.update(data);
        this.updatePaymentsGrid();
        this.setEditablity();
        var status = this.record.get("status");
        // if rejected or cancelled collapse the panel;        
        if (status === "Rejected" || status === "Cancelled") {
            this.collapse();
        }
    },

    onItemEdit: function () {
        var me = this,
            record = this.getRecord(),
            isRmaDateChange = (record.modified && record.modified.rmaDeadline);

        this.returnActions.items.each(function (button) {
            // make sure its a button and not a spacer "->"
            if (button.setDisabled) {
                button.setDisabled(true);
            }
        });

        // record.set('totalLossAmount', this.totalLossAmount.getValue());

        // Debounce Ext pattern
        // based on http://www.sencha.com/blog/tips-and-tricks-for-ext-js-component-developers/
        this.onItemEditTask = this.onItemEditTask || new Ext.util.DelayedTask(function () {
            this.getRecord().save({
                callback: function () {
                    me.returnActions.items.each(function (button) {
                        if (button.setDisabled) {
                            button.setDisabled(false);
                        }
                    });
                },
                success: function () {
                    if (isRmaDateChange) {
                        // need to update the fields original value so that changes will persist properly
                        me.rmaDeadline.resetOriginalValue();
                    }
                },
                failure: function (record, operation) {
                    var msg;

                    try {
                        msg = operation.error.remoteException.data.message;
                    } catch (e) {} finally {
                        msg = msg ? msg : 'An error occured while updating the return.';
                    }
                    // need to clear the field so that the subsequent calls dont' pass the invalid deadline;                    
                    // if the deadline is dirty we need to reset it to its previous value;
                    if (isRmaDateChange) {
                        // need to suspend events so that the reset doesn't make a call to persist (ie. fire change event on the field)
                        me.rmaDeadline.suspendEvents();
                        me.rmaDeadline.reset();
                        me.rmaDeadline.resumeEvents();
                    }
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            });
        }, this);

        this.onItemEditTask.delay(500);
    },

    setEditablity: function () {
        var isEndState = this.isAtEndState();

        this.rmaDeadline.setDisabled(isEndState);
    },

    updatePaymentsGrid: function () {
        this.paymentsGrid[Ext.isEmpty(this.paymentsStore.getRange()) ? 'hide' : 'show']();
    },

    updateReturnActions: function () {
        var record = this.getRecord();
        var returnStatus = record.get('status');
        //var validActions = record.get('availableActions');
        var validActions = ['Authorize', 'Refund', 'Ship'];

        validActions.push("resendEmailButton");

        if (returnStatus !== 'Cancelled' &&
            returnStatus !== 'Rejected' &&
            returnStatus !== 'Closed' &&
            returnStatus !== 'Completed') {
            validActions.push('Cancel');
        }

        if (returnStatus === 'Cancelled' ||
            returnStatus === 'Rejected' ||
            returnStatus === 'Closed' ||
            returnStatus === 'Completed' ||
            returnStatus === 'Created') {
            Ext.Array.remove(validActions, 'Refund');
            Ext.Array.remove(validActions, 'Ship');
        }

        /*
        // remove the Refund action if the return type is not Refund
        if (record.get('type') === 'Replace') {
            Ext.Array.remove(validActions, 'Refund');
        } else if (record.get('status') === 'Restocked') {
            validActions.push('Refund');
        }

        // if Refund is a valid action, Refund Complete must also be a valid action
        if (Ext.Array.contains(validActions, 'Refund')) {
            validActions.push('IssueRefund');
        }
        */

        if (returnStatus !== 'Created') {
            Ext.Array.remove(validActions, 'Authorize');
        }

        this.returnActions.items.each(function (button) {
            var name = button.getItemId();

            if (!name) return;

            button.setVisible(Ext.Array.contains(validActions, name));
        }, this);
    }
});