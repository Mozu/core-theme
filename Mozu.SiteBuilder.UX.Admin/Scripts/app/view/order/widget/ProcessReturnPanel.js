/**
 * @class Taco.view.order.widget.PaymentPanel
 */
Ext.define('Taco.view.order.widget.ProcessReturnPanel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Taco.view.order.modal.AddRefund'
    ],
    margin: '10 0 10 0',
    initComponent: function (eOpts) {
        var me = this,
            returnActionButtons = new Ext.util.MixedCollection(),
                addButton = function (name, text) {
                    returnActionButtons.add(
                        name,
                        Ext.create('Taco.core.ux.action.SecondaryButton', {
                            actionName: name,
                            text: text || name,
                            hidden:true,
                            listeners: {
                                click: me.onActionClick,
                                scope: me
                            }
                        }));
                };
        me.returnActionButtons = returnActionButtons;
        me.itemsStore = me.record.getItems();
        me.orderItemsStore = me.order.items();
        
        
        addButton('Authorize');
        addButton('Await');
        
        addButton('Close');
        addButton('Create');
        addButton('Receive');
        addButton('Refund');
        addButton('Ship');
        addButton('Restock');
        addButton('Cancel');
        
        
        
        me.record.on('aftercommit', function () {
            me.initReturnActions();
        });
        me.record.on('aftercommit', function () {
            me.status.update(me.record.data);
        });

        me.addPaymentButton = Ext.create('Taco.core.ux.action.SecondaryButton', {
            text: 'Add Refund Amount',
            listeners:{
                click: me.onAddPaymentButtonClick,
                scope:me
                   
        }
        });

        me.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.itemsStore,
            viewConfig: {
                cls: 'editmode-enabled',
            },
            columns: [
                {
                    text: 'Name',
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
                    width: 200,
                    dataIndex: 'quantity',
                   
                },
                {
                    text: 'Recieved',
                    tdCls: "editableCell",
                    dataIndex: 'quantityReceived',
                    width: 200,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'Restockable',
                    tdCls: "editableCell",
                    width:200,
                    dataIndex: 'quantityRestockable',
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                }
            ],
            selType: 'cellmodel',
            listeners: {
                edit: me.onItemEdit,
                scope: me
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
        });

        me.initReturnActions();
        me.status = Ext.create( 'Ext.Component', {
            // cls: "orderform-payment-paymentDetails",
            tpl: [
                '<div class="statusField">',
                '<span class="status">Status: {status}</span>',
                '<span class="status"> Deadline:{rmaDeadline}</span>',

                '</div>'
            ],
            data: me.record.data
        })
        ;
        me.dockedItems = [
            {
                xtype: 'toolbar',
                
                // style: "padding:10px 10px 28px 10px;",
                dock: 'top',
                weight: 1,
                items: [
                    me.status, '->', me.addPaymentButton
                ]
            },
            {
                xtype: 'toolbar',
                dock: 'bottom',
                weight: 1,
                ui: 'footer',
                
                defaults: {
                    minWidth: 100,
                    margin: "0px 10px 0px 0px"
                },
                items: me.returnActionButtons.items
            }
        ];
        
        
        me.items = [
            me.grid
        ];


        this.callParent(arguments);
    },
    initReturnActions: function () {
        var me = this;
        me.returnActionButtons.each(function (button) {
            button.setVisible(Ext.Array.contains(me.record.data.availableActions, button.actionName));
        });
    },
    onAddPaymentButtonClick: function () {

        var me = this,
            modal = Ext.create('Taco.view.order.modal.AddRefund',
                {
                    order: me.order,
                    record: me.record
                });
        modal.show();
        modal.on('cancel', function () {
            modal.hide();
        });
        modal.on('save', function (_modal, payments) {
            modal.hide();
            me.setLoading(true);
            me.record.performPaymentAction(payments[0], {
                callback: function () {
                    me.setLoading(false);
                }
            });

        });
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
            button.setDisabled(true);
        });
        me.record.save({
            callback: function () {
                me.returnActionButtons.each(function (button) {
                    button.setDisabled(false);
                });
            }
        });

    }
});