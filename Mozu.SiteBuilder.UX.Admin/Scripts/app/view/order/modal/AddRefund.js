/**
 * @class Taco.view.order.modal.AddRefund
 */
Ext.define('Taco.view.order.modal.AddRefund', {
    extend: 'Ext.window.Window',
    requires: [],
    cls: Taco.baseCSSPrefix + 'add-refund-modal ' + Taco.baseCSSPrefix + 'window-plain',
    ghost: false,
    resizeable: false,
    modal: true,
    title: "Add Refund",
    width: 700,
    //height: 530,
    autoShow: true,
    //destroyOnHide: true,
    
    constrain: true,
    
    layout:"fit",
    
    initComponent: function (eOpts) {
        var me = this;

        me.store = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'cardType',
                'cardNumber',
                'amountCollected',
                'amountAuthorized',
                'amountCredited',
                'paymentType',
                'status',
                {
                    name: 'amountToRefund',
                    type: 'number',
                    defaultValue: 0
                    
                }
            ],
            data: me.order.data.payments,
            filters: [
                function (item) {
                    return (item.raw.amountCollected);
                }
            ]
        });

        
        me.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.store,
            viewConfig: {
                //cls: 'editmode-enabled',
                deferEmptyText:false,
                emptyText:"No payments available to refund. Check to make sure the payments have been captured;",
                overItemCls: 'taco-grid-row-over',
                stripeRows: false
            },
            columns: [
                {
                    text: 'Payment details',
                    flex:1,
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    dataIndex: 'cardType',
                    cardTemplate: new Ext.XTemplate([
                        "{cardType}: {cardNumber}"
                    ]),
                    checkTemplate: new Ext.XTemplate([
                        "Check"
                    ]),
                    renderer: function (value, metaData, record) {
                        var str = "";

                        if (record.get("paymentType") == "CreditCard") {
                            str =  metaData.column.cardTemplate.apply(record.getData());
                        } else {
                            str = metaData.column.checkTemplate.apply(record.getData());
                        }

                        return str;

                        /*
                        //raw credit card

                        NameOnCard: "asdf"
                          amountAuthorized: 0
                          amountCollected: 33
                          amountCredited: 0
                        availableActions: Array[2]
                        cardNumber: "************1111"
                        cardType: "Visa"
                          createDate: "2013-09-20T15:05:21.631Z"
                        id: "96db63f2eecf40d1a43da88494de4bce"
                        interactions: Array[2]
                          isManual: false
                        orderId: "0330d2264fdce026f46c6d9100000059"
                        paymentServiceTransactionId: "479797a566214ab292693f9774e8f8ea"
                        paymentType: "CreditCard"
                        status: "Collected"




                        //raw check
                          amountAuthorized: 0
                          amountCollected: 90.99
                          amountCredited: 0
                        availableActions: Array[3]
                          createDate: "2013-09-20T15:01:56.575Z"
                        id: "df843c583a214ff8ad515d8da950a355"
                        interactions: Array[2]
                          isManual: false
                        orderId: "0330d2264fdce026f46c6d9100000059"
                        paymentType: "Check"
                        status: "Collected"






                        */

                    }
                },
                {
                    text: 'Amount Collected',
                    width:150,
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    dataIndex: 'amountCollected',
                    renderer: Ext.util.Format.usMoney
                },
                {
                    text: 'Refund Amount',
                    width:150,
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    tdCls: "editableCell",
                    dataIndex: 'amountToRefund',
                    editor: {
                        xtype: 'numberfield',
                        hideTrigger: true,
                        selectOnFocus: true,
                        mouseWheelEnabled:false,
                        minValue: 0
                    },
                    renderer: Ext.util.Format.usMoney
                }
            ],
            //selType: 'cellmodel',
            listeners: {
                select: function (view, record, index, eOpts) {
                    var me =this;
                    
                    // pass focus to the editable sell when the row is selected
                    Ext.Function.defer(function () {
                        //me.grid.getPlugin().startEditByPosition({ row: index, column: 2 });
                    }, 500, me);
                    

                },
                //validateedit : me.onGridEdit,
                edit: me.onGridEdit,
                scope: me
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        me.items = [
            me.grid
        ];
        
        

        me.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            //xtype: 'dirtybutton',
            text: 'Save',
            onClick: function () {
                me.save();
            }
        });
        
        this.buttons = [
            {
                xtype: 'button',
                ui: "action",
                scale: "medium",
                text: 'Cancel',
                margin: {
                    right: 10
                },
                handler: function () {
                    me.hide();
                },
                scope: me
            },
            this.dirtyButton
        ];
        
        this.callParent(arguments);
    },
    
    show: function () {
        var me = this;
        this.callParent(arguments);
        // need to defer this to wait for the grid to load its child data and force the window to resize;
        Ext.Function.defer(function () {
            // check to see if the window has overflown its viewport
            //this.processRelativeSize();
            //center the dialog after its resize;
            //this.center();
        }, 1, me);
    },

    onGridEdit: function () {
        var me = this,
            savableState = me.store.findBy(function (item) { return item.get('amountToRefund') > 0; }) > -1;
        
        me.dirtyButton.setDirty(savableState);
    },
    
    save: function () {
        var me = this,
            payments = [];
        me.store.each(function (item) {
            if (item.get('amountToRefund') > 0) {
                payments.push({
                    orderId: me.order.getId(),
                    returnId: me.record.getId(),
                    paymentType: 'CreditCard',//Check
                    amount: item.get('amountToRefund'),
                    paymentId: item.get('id')
                });
            }

        });
        
        me.setLoading(true, me.body);
        
        me.record.performPaymentAction(payments, {
            success: function () {
                me.setLoading(false, me.body);
                me.fireEvent('save');
                me.hide();
            }
        });
    }
});