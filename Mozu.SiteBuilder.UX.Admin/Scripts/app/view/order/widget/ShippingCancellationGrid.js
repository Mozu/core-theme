
Ext.define('Taco.view.order.widget.ShippingCancellationGrid', {
    extend: 'Ext.grid.Panel',

    title: '',

    cls: 'shipping-cancellation-grid',

    initComponent: function () {
        var me = this;
        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.packageStore.items,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'productName',
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
            }],
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
                menuDisabled: true,
                hidden: false
            },
            {
                text: 'Image',
                draggable: false,
                resizable: true,
                menuDisabled: true,
                hidden: false,
                renderer: function (value) {
                    return '<img src="http://dtlr258s62w81.cloudfront.net/19638-23793/cms/23793/files/6ac0c98f-402d-4fd2-95da-a482f3520041?max=160&_mzcb=_1486049853491" style="width:60px" />';
                }
            },
            {
                dataIndex: 'productName',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'optionAttributeFQN',
                text: 'Item Attributes',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
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
            },
            {
                dataIndex: 'itemTax',
                text: 'Unit Tax',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                listeners: {
                    click: {
                        fn: function (view, cell, cellIndex, rowIndex, e, record, row, eOpt) {
                            
                        },
                    }
                }
            },
            {
                dataIndex: 'quantity',
                text: 'Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'quantity',
                text: 'Avail Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
            },
            {
                dataIndex: 'discount',
                text: 'Discount',
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
            },
            {
                dataIndex: 'total',
                text: 'Subtotal',
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