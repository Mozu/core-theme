
Ext.define('Taco.view.order.widget.ShippingCancellationGrid', {
    extend: 'Ext.grid.Panel',

    title: '',

    cls: 'shipping-cancellation-grid',

    initComponent: function () {
        var me = this;
        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.shipmentRecord.canceledItems,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'name',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'unitPrice',
                type: 'float',
                useNull: true
            },
            {
                name: 'itemTax',
                type: 'int',
                useNull: true
            },
            {
                name: 'discount',
                type: 'int',
                useNull: true
            },
            {
                name: 'total',
                type: 'float',
                useNull: true
            },
            {
                name: 'weight',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'isPackagedStandAlone',
                type: 'boolean'
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }, {
                name: 'optionAttributeFQN',
                type: 'string',
                useNull: true
                }, {
                    name: 'createdDate',
                    type: 'string',
                    useNull: true
                },
                {
                    name: 'cancellationReason',
                    type: 'string',
                    useNull: true
                }, {
                    name: 'cancelledBy',
                    type: 'string',
                    useNull: true
                }
            ],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });

        this.columns = [
            {
                dataIndex: 'lineId',
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true
            },
            {                
                text: 'Date Created',
                dataIndex:'createdDate',
                draggable: false,
                resizable: true,
                menuDisabled: true
            },
            {
                dataIndex: 'name',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                text: 'Qty Cancelled',
                dataIndex: 'quantity',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                text: 'Cancellation Reason',
                dataIndex: 'cancellationReason',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                text: 'Cancelled By',
                dataIndex: 'cancelledBy',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                text: 'Shipment Number',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.shipmentRecord.number;
                }
            },
            {
                dataIndex: 'unitPrice',
                text: 'Unit Price',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            }
        ];

        this.callParent();
    }

});