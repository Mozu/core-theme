/**
 * @class Taco.view.order.widget.ReturnableItemGrid
 */

Ext.define('Taco.view.order.widget.ReturnableItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.model.Return'],

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
        flex: 1,
        renderer: function(val, md, record) {
            var parentBundleName = record.get('parentBundleName');
            return parentBundleName ? val + " <em class=\"taco-bundleditem-note\">(Bundled with <strong>" + parentBundleName + "</strong>)</em>" : val;
        }
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
        dataIndex: 'reason',
        text: 'Reason',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 150,
        editor: {
            xtype: 'combobox',
            showBorder: true,
            allowOnlyWhitespace: false,
            editable: false,
            forceSelection: true,
            store: Taco.model.Return.getValidReasons()
        }
    }, {
    //    dataIndex: 'quantity',
    //    text: 'Qty Fulfilled',
    //    draggable: false,
    //    sortable: false,
    //    resizable: false,
    //    menuDisabled: true,
    //    width:150
    //}, {
        dataIndex: 'quantity',
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

    viewConfig: {
        getRowClass: function(record) {
            return record.get('parentBundleName') && "taco-returnableitem-bundled" || '';
        }
    },

    plugins: [],

    config: {
        order: null,
        record: null
    },
    
    initComponent: function () {
        
        this.store = this.getReturnableItemsStore();

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
            select: {
                scope: this,
                fn: 'handleSelect'
            },
            boxready: {
                scope: this,
                fn: function () { this.addCls('returnable-items-grid'); }
            }
        });
    },

    getReturnedItemQuantityByProductCode: function() {
        var returnedItemsByProductCode = {};
        this.returnsStore.each(function(rtn) {
            if (rtrn.get('status') !== Taco.model.Return.constants.statuses.CANCELLED) {
                Ext.Array.each(rtn.get('items'), function(item) {
                    if (!(item.productCode in returnedItemsByProductCode)) {
                        returnedItemsByProductCode[item.productCode] = 0;
                    }
                    returnedItemsByProductCode[item.productCode] += item.quantity;
                });
            }
        });
        return returnedItemsByProductCode;
    },

    getReturnableItemsStore: function() {

        var returnedItemQuantities = this.getReturnedItemQuantityByProductCode(),
            allReturned = function(orderItem) {
                return orderItem.productCode in returnedItemQuantities && returnedItemQuantities[orderItem.productCode] >= orderItem.quantity;
            }

        var eligibleItems = [],
            addItem = function(item, orderItemId, parentBundleName) {
                if (!allReturned(item)) {
                    eligibleItems.push({
                        orderItemId: parentBundleName ? null : orderItemId,
                        productCode: item.productCode,
                        productName: item.productName || item.name,
                        quantity: 0,
                        parentBundleName: parentBundleName,
                        parentItemId: parentBundleName && orderItemId
                    });
                }
            }

        Ext.Array.each(this.order.get('items'), function(orderItem) {
            if (orderItem.bundledProducts && orderItem.bundledProducts.length > 0) {
                Ext.Array.each(orderItem.bundledProducts, function(item) {
                    addItem(item, orderItem.id, orderItem.productName);
                });
            } else {
                addItem(orderItem, orderItem.id);
            }
        });

        return Ext.create('Ext.data.Store', {
            fields: [
                { type: 'string',  name: 'productCode' },
                { type: 'string',  name: 'productName' },
                { type: 'string',  name: 'parentBundleName' },
                { type: 'float',   name: 'unitPrice' },
                { type: 'string',  name: 'returnType', defaultValue: 'Refund' },
                { type: 'string',  name: 'reason', defaultValue: 'Damaged' },
                { type: 'number',  name: 'quantity', defaultValue: 0 },
                { type: 'string', name: 'orderItemId' },
                { type: 'string', name: 'parentItemId'}
            ],
            data: eligibleItems
        });
    },

    handleSelect: function (selModel, record, index) {
        if (!record.get('quantity')) record.set('quantity', 1);
    }
});
