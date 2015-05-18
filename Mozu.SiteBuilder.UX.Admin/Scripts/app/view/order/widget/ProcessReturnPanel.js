/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.ProcessReturnPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.modal.AddRefund'
    ],

    ui: 'subform-section-child',
    bodyPadding: '10 10 10 10',

    collapsible: true,

    config: {
        order: null,
        record: null
    },

    initComponent: function () {
        var order = this.getOrder();
        var record = this.getRecord();

        // set up stores
        this.itemsStore = record.getItems();
        this.paymentsStore = record.getPayments();
        this.orderItemsStore = order.items();

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
        this.status = this.initStatus(record);
        this.summary = this.initSummary(record);
        this.returnActions = this.initReturnActions();

        // set up other controls
        this.moveButton = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Move To',
            disabled: true,
            menu: {
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
            items: [
                {
                    xtype: 'container',
                    padding: '0 0 10 0',
                    margin: '0 0 10 0',
                    layout: {
                        type: 'hbox',
                        align: 'middle'
                    },
                    style: {
                        'border-bottom': '1px solid rgb(191, 191, 191)'
                    },
                    items: [{
                            xtype: 'component',
                            html: ('Return #' + record.get('returnNumber')),
                            style: {
                                fontWeight: 'bold'
                            }
                    }, {
                            xtype: 'tbfill'
                    },
                        this.returnActions]
                },
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
                this.paymentsGrid
            ],
            tools: [this.summary]
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
                if (buttonId === 'Cancel' || buttonId === 'Reject') {
                    me.getOrder().reload({
                        success: function () {
                            me.fireEvent("refresh-returnable-items");
                        },
                        scope: me
                    });
                }
            },
            callback: function () {
                me.setLoading(false);
            }
        });
    },

    handleRefundClick: function () {
        this.refundDialog = Ext.create('Taco.view.order.modal.AddRefund', {
            order: this.getOrder(),
            record: this.getRecord()
        });

        this.refundDialog.show();
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
                renderer: function (value, meta, record) {
                    var productCode = record.get('productCode'),
                        oItem = productCode ? me.orderItemsStore.getById(record.get('orderItemId')) : null;

                    if (productCode) return productCode;
                    return oItem ? oItem.get('productCode') : '--';
                }
            }, {
                dataIndex: 'orderItemId',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                flex: 1,
                renderer: function (value, meta, record) {
                    var productCode = record.get('productCode'),
                        orderItemId = record.get('orderItemId'),
                        oItem = orderItemId ? me.orderItemsStore.getById(orderItemId) : null,
                        rItem = !oItem && productCode ? Ext.Array.filter(me.order.data.returnableItems, function(ri) { return ri.productCode === productCode })[0] : null;

                    var productNameFromOrderItem = oItem ? oItem.get('productName') : null;
                    var productNameFromReturnItem = rItem ? rItem.productName : null;
                    return productNameFromOrderItem || productNameFromReturnItem ||  '--';
                }
            }, {
                dataIndex: 'orderItemId',
                text: 'Price',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                renderer: function (value, meta, record) {
                    var oItem = me.orderItemsStore.getById(record.get('orderItemId'));

                    return oItem ? Taco.app.context.getCurrent().formatCurrency(oItem.get('unitPrice')) : '--';
                }
            }, {
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
            }, {
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
            }, {
                dataIndex: 'reason',
                text: 'Reason',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 120
            }, {
                dataIndex: 'quantity',
                text: 'Qty',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 80
            }, {
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
            }],
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
                dataIndex: 'amountCredited',
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
                itemId: 'IssueRefund',
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
                text: 'Ship'
            }, {
                itemId: 'Refund',
                text: 'Refund Complete'
            }, {
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
                                    button.setDisabled(records[0].get('orderStatus') !== 'Completed');
                                });
                            }
                        }
                    }
                }
            }, {
                xtype:"resendemailbutton",
                itemId: "resendEmailButton",
                text: "Resend Email",
                emailUrl: '/admin/app/return/resendemail',
                handler: Ext.emptyFn,
                listeners: {
                    menushow: function (button, menu) {
                        var status = this.record.get("status");
                        //iterate the child items and enable them and disable them based on the status of the rma entity;
                        Ext.Array.each(menu.items.items, function (item) {                            
                            var isEnabled = Ext.Array.contains(item.enabledWhen, status);                            
                            item.setVisible(isEnabled);
                        })
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
                        '<td><span class="label">Status:</span>{status}</td>',
                        '<td><span class="label">Returning:</span>{[Ext.Array.sum(Ext.Array.pluck(values.items, "quantity"))]} item(s)</td>',
                    '</tr><tr>',
                        '<td><span class="label">Type:</span>{type}</td>',
                        '<td><span class="label">Price:</span>{[this.getUnitPriceTotal(values.items)]}</td>',
                    '</tr><tr>',
                        '<td><span class="label">Created:</span>{createDate:date("m/d/Y g:ia")}</td>',
                        '<td><span class="label">Loss:</span>{[Taco.app.context.getCurrent().formatCurrency(Ext.Array.sum(Ext.Array.pluck(values.items, "productLossAmount")))]}</td>',
                    '</tr><tpl if="returnOrderId"><tr>',
                        '<td><span class="label">Return Order:</span><a href="/admin/s-{[Taco.app.context.getCurrent().id]}/orders/edit/{returnOrderId}">{returnOrderId}</a></td><td>&nbsp;</td>',
                    '</tr></tpl>',
                '</tbody></table>', {
                    getUnitPriceTotal: function (items) {
                        var prices = Ext.Array.map(items, function (item) {
                            var oItem = this.orderItemsStore.getById(item.orderItemId);

                            return oItem ? oItem.get('unitPrice') : 0;
                        }, me);

                        return Taco.app.context.getCurrent().formatCurrency(Ext.Array.sum(prices));
                    }
                }
            ]
        });
    },

    initSummary: function (record) {
        return Ext.create('Ext.Component', {
            cls: 'return-summary',
            data: record.getData(),
            margin: '0 0 0 8',
            style: {
                'white-space': 'nowrap'
            },
            tpl: [
                '{createDate:date("m/d/Y g:ia")}',
                '<span class="label">Return ID:</span>{returnNumber}',
                '<span class="label">Status:</span>{status}',
                '<span class="label">Type:</span>{type}',
                '<span class="label">Amount:</span>{[Taco.app.context.getCurrent().formatCurrency(Ext.Array.sum(Ext.Array.pluck(values.payments, "amountCredited")))]}',
                '<span class="label">Items:</span>{[values.items.length]}'
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
        var validActions = record.get('availableActions');


        if (record.get('status') != "Cancelled") {
            validActions.push("resendEmailButton");
        }

        // remove the Refund action if the return type is not Refund
        if (record.get('type') === 'Replace') {
            Ext.Array.remove(validActions, 'Refund');
        } else if (record.get('status') === 'Restocked') {
            validActions.push('Refund');
        }

        // if Refund is a valid action, Refund Complete must also be a valid action
        if (Ext.Array.contains(validActions, 'Refund')) {
            validActions.push('IssueRefund');

            if (record.get('status') === 'Authorized') {
                Ext.Array.remove(validActions, 'Refund');
            }
        }

        this.returnActions.items.each(function (button) {
            var name = button.getItemId();

            if (!name) return;

            button.setVisible(Ext.Array.contains(validActions, name));
        }, this);
    }
});