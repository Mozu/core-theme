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

        console.log('order', order, '\nreturn', record);

        // set up stores
        this.itemsStore = record.getItems();
        this.paymentsStore = record.getPayments();
        this.orderItemsStore = order.items();

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
                    fn: 'onItemEdit'
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

        this.getRecord().performAction(button.getItemId(), {
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
                    var oItem = me.orderItemsStore.getById(record.getId());

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
                    var oItem = me.orderItemsStore.getById(record.getId());

                    return oItem ? oItem.get('productName') : '--';
                }
            }, {
                dataIndex: 'priceSnapshot',
                text: 'Cost',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            }, {
                dataIndex: 'priceSnapshot',
                text: 'Price',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            }, {
                dataIndex: 'productLossAmount',
                text: 'Loss',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                renderer: function (value, meta, record) {
                    console.log(record);
                    return value;
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
                    showBorder:true,
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
                flex: 1
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
                itemId: 'Authorize',
                text: 'Authorize'
            }, {
                itemId: 'Reject',
                text: 'Reject'
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
                itemId: 'Refund',
                text: 'Refund',
                handler: this.handleRefundClick
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
                        '<td><span class="label">Price:</span>--</td>',
                    '</tr><tr>',
                        '<td><span class="label">Created:</span>{createDate:date("m/d/Y g:ia")}</td>',
                        '<td><span class="label">Cost:</span>--</td>',
                    '</tr><tr>',
                        '<td colspan="2"><span class="label">Loss:</span>--</td>',
                    '</tr>',
                '</tbody></table>'
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
                '<span class="label">Amount:</span>--',
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
    },

    onItemEdit: function () {
        var me = this;
        var record = this.getRecord();

        this.returnActions.items.each(function (button) {
            // make sure its a button and not a spacer "->"
            if (button.setDisabled) {
                button.setDisabled(true);
            }
        });

        record.set('rmaDeadline', this.rmaDeadline.getValue());
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
                }
            });
        }, this);

        this.onItemEditTask.delay(500);
    },

    setEditablity: function () {
        var isEndState = this.isAtEndState();

        this.rmaDeadline.setDisabled(isEndState);
        // this.totalLossAmount.setDisabled(isEndState);
        // this.addPaymentButton.setDisabled(isEndState);
    },

    updatePaymentsGrid: function () {
        this.paymentsGrid[Ext.isEmpty(this.paymentsStore.getRange()) ? 'hide' : 'show']();
    },

    updateReturnActions: function () {
        this.returnActions.items.each(function (button) {
            var enabled = false;
            var name = button.getItemId();

            if (!name) return;

            button.setVisible(Ext.Array.contains(this.getRecord().get('availableActions'), name));
        }, this);
    },

    // replacing this function, bit by bit
    oldInitComponent: function () {
        // var me = this,
        //     recieveBut,
        //     returnActionButtons = new Ext.util.MixedCollection(),
        //     addButton = function (name, text) {

        //         returnActionButtons.add(
        //             name,
        //             Ext.create('Ext.button.Button', {
        //                 ui: "action",
        //                 scale:"medium",
        //                 actionName: name,
        //                 text: text || name,
        //                 hidden: true,
        //                 listeners: {
        //                     click: me.onActionClick,
        //                     scope: me
        //                 }
        //             }));
        //     };
        // me.returnActionButtons = returnActionButtons;
        // me.itemsStore = me.record.getItems();
        // me.paymentsStore = me.record.getPayments();
        // me.orderItemsStore = me.order.items();

        // returnActionButtons.add("->");

        // addButton('Cancel');
        // addButton('Authorize');
        // addButton('Await');

        // addButton('Close');
        // addButton('Create');
        // addButton('Receive');
        // addButton('Refund');
        // addButton('Ship');
        // addButton('Restock');


        // me.mon(me.record,'aftercommit', function () {
        //     me.initReturnActions();
        //     me.status.update(me.record.data);
        //     me.setEditablity();
        // });

        // me.addPaymentButton = Ext.create('Taco.core.ux.action.SecondaryButton', {
        //     text: 'Add Refund',
        //     listeners: {
        //         click: me.onAddPaymentButtonClick,
        //         scope: me
        //     }
        // });

        // me.grid = Ext.create('Taco.core.ux.grid.Panel', {
        //     store: me.itemsStore,
        //     title: 'Items',
        //     viewConfig: {
        //         emptyText: '<div class="empty-grid-message">No items to display</div>',
        //         deferEmptyText: false
        //     },
        //     margin: "10px 0px 0px 0px ",
        //     cls:"item-grid",
        //     columns: [
        //         {
        //             text: 'Name',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             renderer: function (value, meta, record) {
        //                 var oItem = me.orderItemsStore.getById(record.getId());
        //                 if (oItem) {
        //                     return oItem.get('productName');
        //                 }
        //                 return 'na';
        //             },
        //             width: 200
        //         }, {
        //             text: 'Customer Comments',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             renderer: function(value, meta, record) {
        //                 var notes = record.get('notes');

        //                 if (!notes || !notes.length || !notes[0].text) return '';

        //                 return notes[0].text
        //             },
        //             flex:1
        //         }, {
        //             text: 'Quantity',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 80,
        //             dataIndex: 'quantity'
        //         }, {
        //             text: 'Recieved',
        //             dataIndex: 'quantityReceived',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 80,
        //             editor: {
        //                 xtype: 'numberfield',
        //                 showBorder:true,
        //                 hideTrigger: true,
        //                 minValue: 0
        //             }
        //         }, {
        //             text: 'Restockable',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 80,
        //             dataIndex: 'quantityRestockable',
        //             editor: {
        //                 xtype: 'numberfield',
        //                 showBorder:true,
        //                 hideTrigger: true,
        //                 minValue: 0
        //             }
        //         }
        //     ],
        //     selType: 'cellmodel',
        //     listeners: {
        //         edit: me.onItemEdit,
        //         beforeedit: function () {
        //             return !me.isAtEndState();
        //         },
        //         scope: me
        //     },
        //     plugins: [
        //         Ext.create('Ext.grid.plugin.CellEditing', {
        //             clicksToEdit: 1
        //         })
        //     ]
        // });

        // me.paymentGrid = Ext.create('Taco.core.ux.grid.Panel', {
        //     store: me.paymentsStore,
        //     title: 'Refunds',
        //     viewConfig: {
        //         emptyText: '<div class="empty-grid-message">No refunds to display</div>',
        //         trackOver: false,
        //         disableSelection:true,
        //         deferEmptyText: false
        //     },
        //     cls: "payment-grid",
        //     dockedItems: [{
        //         xtype: 'toolbar',
        //         dock: 'top',
        //         cls: "payment-toolbar",
        //         items: ['->', me.addPaymentButton]
        //     }],
        //     columns: [
        //         {
        //             text: 'Payment Type',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 150,
        //             dataIndex: 'paymentType'
        //         },
        //         {
        //             text: 'Card Type',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 150,
        //             dataIndex: 'cardType'
        //         },
        //         {
        //             text: 'Card Number',
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             dataIndex: 'cardNumber',
        //             flex: 1
        //         },
        //         {
        //             text: 'Amount Credited',

        //             renderer: function (value) {
        //                 return me.order.formatCurrency(value);
        //             },
        //             draggable: false,
        //             sortable: false,
        //             resizable: false,
        //             menuDisabled: true,
        //             width: 150,
        //             dataIndex: 'amountCredited'
        //         }
        //     ]
        // });


        // me.status = Ext.create('Ext.Component', {
        //     // cls: "orderform-payment-paymentDetails",
        //     tpl: [
        //         '<div class="header">',
        //             '<span class="title-row">',
        //                 '<span class="status">RMA Status: {status}</span>',
        //                 '<span class="seperator">|</span>',
        //                 '<span class="create-date">Created: {createDate:date("F d Y g:ia")}</span>',
        //                 '<tpl if="returnOrderId">',
        //                     '<span class="seperator">|</span>',
        //                     ' <a class="action" rmaAction="returnOrder">View Return Order</a>',
        //                 '</tpl>',

        //             '</span>',
        //         '</div>'
        //     ],
        //     listeners: {
        //         click: {
        //             fn: function (e) {
        //                 e.stopEvent();
        //                 if (e.target.getAttribute("rmaAction") == "returnOrder") {
        //                     Taco.app.StateManager.attemptNavigate('orders/edit/' + me.record.data.returnOrderId);
        //                 }
        //             },
        //             element: 'el',
        //             scope: this 
        //         }
        //     },

        //     data: me.record.data
        // });

        // me.totalLossAmount = Ext.create('Taco.core.ux.form.CurrencyField', {
        //     name: 'totalLossAmount',

        //     currencyCode: Taco.app.context.getCurrent().currencyCode,
        //     forcePrecision:true,
        //     unitAtEnd:false,
        //     fieldLabel: 'Total Loss',
        //     width: 150,
        //     margin: "0 10 10 0",
        //     labelAlign: 'top',
        //     value: me.record.get('totalLossAmount'),
        //     listeners: {
        //         change: me.onItemEdit,
        //         scope:me
        //     }

        // });


        // me.rmaDeadline = Ext.create('Ext.form.field.Date', {
        //     name: 'rmaDeadline',
        //     fieldLabel: 'Deadline',
        //     labelAlign: 'top',
        //     width: 150,
        //     margin:"0 10 10 0",
        //     value: me.record.get('rmaDeadline'),
        //     listeners: {
        //         change: me.onItemEdit,
        //         scope: me
        //     }
        // });

        // me.dockedItems = [
        //     {
        //         xtype: 'container',
        //         dock: 'top',
        //         weight: 1,

        //         items: [
        //             me.status, 
        //             {
        //                 xtype:"container",
        //                 layout:'hbox',
        //                 items: [
        //                     me.rmaDeadline,
        //                     me.totalLossAmount
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         xtype: 'toolbar',
        //         dock: 'bottom',
        //         weight: 1,
        //         ui: 'footer',
        //         cls:"rma-footer",
        //         defaults: {
        //             minWidth: 100,
        //             margin: "0px 0px 0px 10px"
        //         },
        //         items: me.returnActionButtons.items
        //     }
        // ];


        // me.items = [
        //     me.grid,
        //     me.paymentGrid
        // ];

        // me.initReturnActions();
        // me.setEditablity();
    }
});