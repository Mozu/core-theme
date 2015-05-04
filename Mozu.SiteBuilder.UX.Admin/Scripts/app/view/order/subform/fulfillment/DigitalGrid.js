Ext.define('Taco.view.order.subform.fulfillment.DigitalGrid', {
    extend: 'Ext.grid.Panel',

    packageData: null,

    initComponent: function () {

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-shippingitemgrid'].join(' ');

        if (this.packageData) this.data = this.packageData.items;

        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.data,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            }, {
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
                defaultValue: 0
            }, {
                name: 'total',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'giftCardCode',
                type: 'string',
                useNull: true,
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }],
            sorters: [{
                sorterFn: function(a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });

        Ext.apply(this, {
            viewConfig: {
                overItemCls: 'taco-order-shippingItem-grid-row-over',
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false, // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: 'taco-order-shippingitemgrid-disabled'
            },
            columns: this.getColumnConfig()
        });

        this.callParent(arguments);
    },

    getColumnConfig: function () {
        var columns = [],
            order = this.record;

        if (!this.packageData) {
            columns.push({
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 50,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'center',
                dataIndex: 'lineId'
            });
        }

        columns.push({
            text: 'Code',
            draggable: false,
            width: 140,
            sortable: false,
            menuDisabled: true,
            align: 'left',
            dataIndex: 'productCode'
        }, {
            text: 'Products',
            draggable: false,
            xtype: 'templatecolumn',
            flex: 1,
            sortable: false,
            menuDisabled: true,
            tpl: [
                '<span class="productname" >{productName}</span>',
                '<span class="product-options">',
                '<tpl for="options">',
                '<span class="option">{.}, </span>',
                '</tpl>',
                '</span>'
            ],
            dataIndex: 'productName'
        });

        if (!this.packageData) {
            columns.push({
                text: 'Status',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: 'left',
                dataIndex: 'fulfillmentStatus'
            });
        }

        columns.push({
            text: 'Amount',
            draggable: false,
            width: 80,
            sortable: false,
            menuDisabled: true,
            align: 'right',
            dataIndex: 'unitPrice',
            renderer: function (value) {
                return order.formatCurrency(value);
            }
        });


        if (this.packageData) {
            columns.push({
                text: 'Claim Code',
                draggable: false,
                width: 140,
                sortable: false,
                menuDisabled: true,
                align: 'left',
                dataIndex: 'giftCardCode'
            });
        } else {
            columns.push({
                text: 'Quantity',
                draggable: false,
                width: 80,
                sortable: false,
                menuDisabled: true,
                align: 'center',
                dataIndex: 'quantity'
            });

            columns.push({
                text: 'Total',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: 'right',
                dataIndex: 'total',
                renderer: function (value) {
                    return order.formatCurrency(value);
                }
            });
        }

        return columns;
    }

});