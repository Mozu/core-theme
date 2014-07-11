/**
 * @class Taco.view.order.widget.ReturnableItemGrid
 */

Ext.define('Taco.view.order.widget.ReturnableItemGrid', {
    extend: 'Ext.grid.Panel',

    title: 'Returnable Items',

    columns: [{
        dataIndex: 'productCode',
        text: 'Code',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: false,
        width: 150
    }, {
        dataIndex: 'productName',
        text: 'Products',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        flex: 1
    }, {
        dataIndex: 'returnType',
        text: 'Type',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 150,
        editor: {
            xtype: 'combobox',
            allowOnlyWhitespace: false,
            editable: false,
            forceSelection: true,
            store: ['Replace', 'Refund']
        }
    }, {
        dataIndex: 'returnReason',
        text: 'Reason',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 150,
        editor: {
            xtype: 'combobox',
            allowOnlyWhitespace: false,
            editable: false,
            forceSelection: true,
            store: ['Damaged', 'Defective', 'Missing Parts', 'Different Expectations', 'Late', 'No Longer Wanted', 'Other']
        }
    }, {
        dataIndex: 'quantity',
        text: 'Qty Fulfilled',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width:150
    }, {
        dataIndex: 'returnQuantity',
        text: 'Qty to Return',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 150,
        editor: {
            xtype: 'numberfield',
            showBorder:true,
            hideTrigger: true,
            minValue: 0
        },
        renderer: function (value) {
            return value || 0;
        }
    }],

    plugins: [],

    config: {
        order: null,
        record: null
    },
    
    initComponent: function () {
        var orderItems = this.order.get('items') || [];
        var explodedItems;

        explodedItems = Ext.Array.flatten(Ext.Array.map(orderItems, function (orderItem) {
            if (!orderItem.bundledProducts || orderItem.bundledProducts.length <= 0) {
                return orderItem;
            } else {
                return Ext.Array.map(orderItem.bundledProducts, function (bundledProduct) {
                    return Ext.apply({}, bundledProduct, {
                        productName: bundledProduct.name,
                        parentItemId: orderItem.id,
                        quantity: bundledProduct.quantity * orderItem.quantity
                    });
                });
            }
        }, this));

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                { type: 'string', name: 'id' },
                { type: 'string', name: 'productCode' },
                { type: 'string', name: 'productName' },
                { type: 'string', name: 'returnType', defaultValue: 'Refund' },
                { type: 'string', name: 'returnReason', defaultValue: 'Damaged' },
                { type: 'number', name: 'quantity' },
                { type: 'number', name: 'returnQuantity' }
            ],
            data: explodedItems
        });

        this.plugins.push(Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        }));

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            injectCheckbox: 'last',
            headerWidth: 37,
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.callParent(arguments);

        this.on({
            edit: {
                scope: this,
                fn: 'onCreateStateChange'
            },
            select: {
                scope: this,
                fn: 'handleSelect'
            },
            boxready: {
                scope: this,
                fn: function () { this.addCls('return-item return-create'); }
            }
        });
    },

    handleSelect: function (selModel, record, index) {
        console.log('selected', record);

        record.set('returnQuantity', record.get('quantity'));
    },

    onCreateStateChange: function () {
        console.log('hello world');
    }
});
