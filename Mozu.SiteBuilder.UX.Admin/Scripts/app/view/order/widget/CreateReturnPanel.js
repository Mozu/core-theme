/**
 * @class Taco.view.order.widget.CreateReturnPanel
 */
Ext.define('Taco.view.order.widget.CreateReturnPanel', {
    extend: 'Ext.form.Panel',
    requires: [
    ],
    //margin: '10 0 10 0',
    cls: "return-item return-create",
    initComponent: function (eOpts) {
        var me = this;
        me.order = me.record;

        me.store = Ext.create('Ext.data.Store', {
            fields: [
                'id', 'productCode', 'productName', 'quantity', 'returnQuantity'
            ],
            data: me.order.get('items')
        });

        me.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.store,
            title: 'Items',
            margin: "10px 0px 0px 0px ",
            viewConfig: {
                cls: 'editmode-enabled'
            },
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'productName',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    flex: 1
                },
                {
                    text: 'Order Quantity',
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width:150,
                    dataIndex: 'quantity'
                },
                {
                    text: 'Return Quantity',
                    tdCls: "editableCell",
                    draggable: false,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    width: 150,
                    renderer: function (value) {
                        return value || 0;
                    },
                    dataIndex: 'returnQuantity',
                    editor: {
                        xtype: 'numberfield',
                        hideTrigger: true,
                        minValue: 0
                    }
                }
            ],
            selType: 'cellmodel',
            listeners: {
                edit: me.onCreateStateChange,
                scope: me
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        me.returnType = Ext.create('Taco.core.ux.form.SelectField', {
            store: ['Replace', 'Refund'],
            listeners: {
                change: me.onCreateStateChange,
                scope: me
            },
            labelAlign: 'top',
            fieldLabel: 'Type',
            name: 'type'
        });

        me.returnReason = Ext.create('Taco.core.ux.form.SelectField', {
            store: ['Damaged',
                'Defective',
                'MissingParts',
                'DifferentExpectations',
                'Late',
                'NoLongerWanted',
                'Other'],
            listeners: {
                change: me.onCreateStateChange,
                scope: me
            },
            labelAlign: 'top',
            fieldLabel: 'Reason',
            name: 'reason'
        });


        me.rmaDeadline = Ext.create('Taco.core.ux.form.DateTime', {
            fieldLabel: 'Deadline',
            labelAlign: 'top',
            emptyText: 'Any Time',
            value: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDay()),
            name: 'rmaDeadline'
        });

        me.createButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: 'Create Return',
            listeners: {
                click: function () {
                    var returnData = {
                        originalOrderId: me.order.getId(),
                        items: [],
                        rmaDeadline: me.rmaDeadline.getValue(),
                        type: me.returnType.getValue()
                    };
                    me.store.each(function (item) {
                        if (item.data.returnQuantity > 0) {
                            returnData.items.push({
                                orderItemId: item.getId(),
                                quantity: item.data.returnQuantity,
                                reason: me.returnReason.getValue()
                            });
                        }
                    });
                    me.fireEvent('create', me, returnData);
                }
            }
        });

        me.cancelButton = Ext.create('Ext.button.Button', {
            text: 'Cancel',
            ui: "action",
            scale:"medium",
            listeners: {
                click: function () {
                    me.fireEvent('cancel');
                }
            }
        });




        me.dockedItems = [
            {
                xtype: 'container',
                dock: 'top',
                weight: 1,
                cls: "header",
                items: [
                    {
                        xtype: "component",
                        cls: "title-row",
                        html: "Create a return"
                    },
                    {
                        xtype: "container",
                        layout: 'hbox',
                        items: [
                            me.returnType,
                            me.returnReason,
                            me.rmaDeadline
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
                //style: "padding:28px 28px 28px 28px;",
                defaults: {
                    minWidth: 100,
                    margin: "0px 0px 0px 10px"
                },
                items: [
                    "->",
                    me.cancelButton,
                    me.createButton
                ]
            }
        ];


        me.items = [me.grid];

        this.callParent(arguments);
    },
    onCreateStateChange: function () {
        var me = this,
            savableState = me.store.findBy(function (item) { return item.get('returnQuantity'); }) > -1 && me.returnType.getValue() && me.returnReason.getValue()
        me.createButton.setDirty(savableState);

    }
});