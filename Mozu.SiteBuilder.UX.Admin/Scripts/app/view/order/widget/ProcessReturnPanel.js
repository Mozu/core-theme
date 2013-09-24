/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.ProcessReturnPanel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Taco.view.order.modal.AddRefund'
    ],
    //super ugly border stuff.. somebody remove please
    //border: 1,
    //style: {
    //    borderColor: '#cccccc',
    //    borderStyle: 'solid',
    //    borderWidth: '1px'
    //},
    cls: "return-item return-process",

    //padding: '5 5 5 5',
    //margin: '20 20 20 20',
    
    initComponent: function (eOpts) {
        var me = this,
            recieveBut,
            returnActionButtons = new Ext.util.MixedCollection(),
            addButton = function (name, text) {
                
                returnActionButtons.add(
                    name,
                    Ext.create('Ext.button.Button', {
                        ui: "action",
                        scale:"medium",
                        actionName: name,
                        text: text || name,
                        hidden: true,
                        listeners: {
                            click: me.onActionClick,
                            scope: me
                        }
                    }));
            };
        me.returnActionButtons = returnActionButtons;
        me.itemsStore = me.record.getItems();
        me.paymentsStore = me.record.getPayments();
        me.orderItemsStore = me.order.items();

        returnActionButtons.add("->");

        addButton('Cancel');
        addButton('Authorize');
        addButton('Await');

        addButton('Close');
        addButton('Create');
        addButton('Receive');
        addButton('Refund');
        addButton('Ship');
        addButton('Restock');
        


     

        me.record.on('aftercommit', function () {
            me.initReturnActions();
            me.status.update(me.record.data);
            me.setEditablity();
        });
        
        me.addPaymentButton = Ext.create('Taco.core.ux.action.SecondaryButton', {
            text: 'Add Refund',
            listeners: {
                click: me.onAddPaymentButtonClick,
                scope: me
            }
        });

        me.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.itemsStore,
            title: 'Items',
            viewConfig: {
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false
            },
            margin: "10px 0px 0px 0px ",
            cls:"item-grid",
            columns: [
                {
                    text: 'Name',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    renderer: function (value, meta, record) {
                        var oItem = me.orderItemsStore.getById(record.getId());
                        if (oItem) {
                            return oItem.get('productName');
                        }
                        return 'na';
                    },
                    flex: 1
                },
                {
                    text: 'Quantity',
                    tdCls: "editableCell",
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    dataIndex: 'quantity'
                },
                {
                    text: 'Recieved',
                    tdCls: "editableCell",
                    dataIndex: 'quantityReceived',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    editor: {
                        xtype: 'numberfield',
                        hideTrigger: true,
                        minValue: 0
                    }
                },
                {
                    text: 'Restockable',
                    tdCls: "editableCell",
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    dataIndex: 'quantityRestockable',
                    editor: {
                        xtype: 'numberfield',
                        hideTrigger: true,
                        minValue: 0
                    }
                }
            ],
            selType: 'cellmodel',
            listeners: {
                edit: me.onItemEdit,
                beforeedit: function () {
                    return !me.isAtEndState();
                },
                scope: me
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        me.paymentGrid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.paymentsStore,
            title: 'Refunds',
            viewConfig: {
                emptyText: '<div class="empty-grid-message">No refunds to display</div>',
                trackOver: false,
                disableSelection:true,
                deferEmptyText: false
            },
            cls: "payment-grid",
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                cls: "payment-toolbar",
                items: ['->', me.addPaymentButton]
            }],
            columns: [
                {
                    text: 'Payment Type',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    dataIndex: 'paymentType'
                },
                {
                    text: 'Card Type',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    dataIndex: 'cardType'
                },
                {
                    text: 'Card Number',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    dataIndex: 'cardNumber',
                    flex: 1
                },
                {
                    text: 'Amount Credited',
                    renderer: Ext.util.Format.usMoney,
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    dataIndex: 'amountCredited'
                }
            ]
        });


        
        me.status = Ext.create('Ext.Component', {
            // cls: "orderform-payment-paymentDetails",
            tpl: [
                '<div class="header">',
                    '<span class="title-row">',
                        '<span class="status">RMA Status: {status}</span>',
                        '<span class="seperator">|</span>',
                        '<span class="create-date">Created: {createDate:date("F d Y g:ia")}</span>',
                        '<tpl if="returnOrderId">',
                            '<span class="seperator">|</span>',
                            ' <a class="action" rmaAction="returnOrder">View Return Order</a>',
                        '</tpl>',
                
                    '</span>',
                '</div>'
            ],
            listeners: {
                click: {
                    fn: function (e) {
                        e.stopEvent();
                        if (e.target.getAttribute("rmaAction") == "returnOrder") {
                            Taco.app.StateManager.attemptNavigate('orders/edit/' + me.record.data.returnOrderId);
                        }
                    },
                    element: 'el',
                    scope: this 
                }
            },
            
            data: me.record.data
        });
        
        me.totalLossAmount = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'totalLossAmount',
            unitString: '$',
            unitAtEnd:false,
            fieldLabel: 'Total Loss',
            width: 150,
            margin: "0 10 10 0",
            labelAlign: 'top',
            value: me.record.get('totalLossAmount'),
            listeners: {
                change: me.onItemEdit,
                scope:me
            }
            
        });


        me.rmaDeadline = Ext.create('Ext.form.field.Date', {
            name: 'rmaDeadline',
            fieldLabel: 'Deadline',
            labelAlign: 'top',
            width: 150,
            margin:"0 10 10 0",
            value: me.record.get('rmaDeadline'),
            listeners: {
                change: me.onItemEdit,
                scope: me
            }
        });
        
        me.dockedItems = [
            {
                xtype: 'container',
                dock: 'top',
                weight: 1,

                items: [
                    me.status, 
                    {
                        xtype:"container",
                        layout:'hbox',
                        items: [
                            me.rmaDeadline,
                            me.totalLossAmount
                        ]
                    }
                ]
            },
            {
                xtype: 'toolbar',
                dock: 'bottom',
                weight: 1,
                ui: 'footer',
                cls:"rma-footer",
                defaults: {
                    minWidth: 100,
                    margin: "0px 0px 0px 10px"
                },
                items: me.returnActionButtons.items
            }
        ];


        me.items = [
            me.grid,
            me.paymentGrid
        ];

        me.initReturnActions();
        me.setEditablity();
        this.callParent(arguments); 
    },
    setEditablity:function () {
        var isEndState = this.isAtEndState();
        this.rmaDeadline.setDisabled(isEndState);
        this.totalLossAmount.setDisabled(isEndState);
        this.addPaymentButton.setDisabled(isEndState);

    },
    initReturnActions: function () {
        var me = this;
        me.returnActionButtons.each(function (button) {
            var enabled = false;
            
            if (!button.actionName) {
                return;
            }
            
            button.setVisible(Ext.Array.contains(me.record.data.availableActions, button.actionName));
            if (button.actionName == 'Refund') {
                enabled = false;
                me.itemsStore.each(function (record) {
                    if (record.get('quantityReceived') > 0) {
                        enabled = true;
                    }
                });
                button.setDisabled(!enabled);
            }
            if (button.actionName == 'Refund') {
                enabled = false;
                me.paymentsStore.each(function (record) {
                    if (record.get('amountCredited') > 0) {
                        enabled = true;
                    }
                });
                button.setDisabled(!enabled);
            }
        });
    },
    isAtEndState:function () {
        return this.record.data.availableActions == null || this.record.data.availableActions.length == 0;
    },
    onAddPaymentButtonClick: function () {
        
        var me = this,
            modal = Ext.create('Taco.view.order.modal.AddRefund', {
                order: me.order,
                record: me.record
            });
        
        modal.show();
        /*
        modal.on('save', function (_modal, payments) {
        });
        */
    },
    onActionClick: function (button) {
        var me = this;
        me.setLoading(true);
        me.record.performAction(button.actionName, {
            callback: function () {
                me.setLoading(false);
            }
        });

    },

    onItemEdit: function () {
        //todo:validate
        var me = this;
        me.returnActionButtons.each(function (button) {
            // make sure its a button and not a spacer "->"
            if (button.setDisabled) {
                button.setDisabled(true);
            }
        });
        me.record.set('rmaDeadline', me.rmaDeadline.getValue());
        me.record.set('totalLossAmount', me.totalLossAmount.getValue());

        // Debounce Ext pattern, based on http://www.sencha.com/blog/tips-and-tricks-for-ext-js-component-developers/
        me.onItemEditTask = me.onItemEditTask || new Ext.util.DelayedTask(function () {
            me.record.save({
                callback: function () {
                    me.returnActionButtons.each(function (button) {
                        if (button.setDisabled) {
                            button.setDisabled(false);
                        }
                    });
                }
            });
        }, this);
        me.onItemEditTask.delay(500);
    }
});