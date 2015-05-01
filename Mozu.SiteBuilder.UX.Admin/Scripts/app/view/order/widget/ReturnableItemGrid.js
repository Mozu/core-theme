/**
 * @class Taco.view.order.widget.ReturnableItemGrid
 */

Ext.define('Taco.view.order.widget.ReturnableItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.model.Return'],

    title: 'Returnable Items',

    columns: [{
        text: 'Line',
        draggable: false,
        resizable: true,
        width: 50,
        sortable: false,
        menuDisabled: true,
        hidden: false,
        align: 'center',
        dataIndex: 'orderLineId'
    }, {
        dataIndex: 'productCode',
        text: 'Code',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: false,
        minWidth: 100,
        flex: 1
    }, {
        dataIndex: 'productName',
        text: 'Products',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        minWidth: 100,
        flex: 1,
        renderer: function(val, md, record) {
            var parentBundleName = record.get('parentBundleName');
            return parentBundleName ? val + " <em class=\"taco-bundleditem-note\">(Bundled with <strong>" + parentBundleName + "</strong>)</em>" : val;
        }
    }, {
        text: 'Status',
        draggable: false,
        resizable: true,
        width: 120,
        sortable: false,
        menuDisabled: true,
        hidden: false,
        align: 'left',
        dataIndex: 'orderFulfillmentStatus'
    }, {
        dataIndex: 'returnType',
        text: 'Type',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 100,
        editor: {
            xtype: 'combobox',
            allowOnlyWhitespace: false,
            showBorder: true,
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
        width: 100,
        editor: {
            xtype: 'combobox',
            showBorder: true,
            allowOnlyWhitespace: false,
            showBorder: true,
            editable: false,
            forceSelection: true,
            store: Taco.model.Return.getValidReasons()
        }
    }, {
        dataIndex: 'quantityOrdered',
        text: 'Qty Ordered',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width:100
    }, {
        dataIndex: 'quantityFulfilled',
        text: 'Qty Fulfilled',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 100
    }, {
        dataIndex: 'quantityReturned',
        text: 'Qty Returned',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width:100
    }, {
        dataIndex: 'quantity',
        text: 'Qty to Return',
        draggable: false,
        sortable: false,
        resizable: false,
        menuDisabled: true,
        width: 100,
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
        deferEmptyText: false,
        stripeRows:false,
        emptyText: "No items availabe to return",
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

        this.mon(this.order.getReturnsStore(), {
            load: {
                scope: this,
                fn: 'addReturnableItems'
            }
        });
    },

    reload: function () {
        //this.removeAll();
        
        //this.addReturnableItems()

        var returnsStore = this.order.getReturnsStore();

        returnsStore.load();
    },

    addReturnableItems: function (store, returns) {
        var ineligibleStatuses = [
            Taco.model.Return.constants.statuses.CANCELLED,
            Taco.model.Return.constants.statuses.REJECTED
        ];

        var returnableItems = this.order.get('returnableItems');

        // list of items and their qty currently added to active returns
        var returnedItemQuantities = {};
        
        // track the returned quantities of each item in the order

        // initialize quantity already returned for each returnable item.
        Ext.Array.each(returnableItems, function (returnableItem) {
            returnableItem.quantityReturned = 0 // returnedItemQuantities[returnableItem.orderItemId];
        });

        // build a list of items already added to a return and determine the qty of each that has already been added;
        Ext.Array.each(returns, function (ret) {
            // ignore any records that have been cancelled or rejected;
            if (!Ext.Array.contains(ineligibleStatuses, ret.get('status'))) {

                // for each item in the return, find the returnable item and update its returnedQuantity.
                Ext.Array.each(ret.get('items'), function (item) {
                    var i, matchingReturnableItems, returnableItem;

                    for (i = 1; i <= item.quantity; i++) {
                        matchingReturnableItems = Ext.Array.filter(returnableItems, function (ri) { return ri.productCode === item.productCode && ri.quantityReturned < ri.quantityOrdered });
                        if (!matchingReturnableItems || !matchingReturnableItems.length) continue;
                        // in case multiple returnable items exist for the same product code, round-robin over them all and increment quantity returned.
                        returnableItem = Ext.Array.sort(matchingReturnableItems, function (a, b) { return a.quantityReturned < b.quantityReturned ? -1 : 1 })[0];
                        returnableItem.quantityReturned++;
                    }
                });
            }
        });

        // filter out items which are already fully returned.
        var returnableItemsFiltered = Ext.Array.filter(returnableItems, function (returnableItem) {
            return returnableItem.quantityOrdered > returnableItem.quantityReturned;
        });
        this.store.loadData(returnableItemsFiltered);
    },

    getReturnableItemsStore: function () {
        return Ext.create('Ext.data.Store', {
            fields: [
                { type: 'string',  name: 'productCode' },
                { type: 'string',  name: 'productName' },
                { type: 'string',  name: 'parentBundleName' },
                { type: 'float',   name: 'unitPrice' },
                { type: 'string',  name: 'returnType', defaultValue: 'Refund' },
                { type: 'string',  name: 'reason', defaultValue: 'Damaged' },
                { type: 'number',  name: 'quantity', defaultValue: 0 },
                { type: 'number',  name: 'quantityOrdered' },
                { type: 'number',  name: 'quantityFulfilled' },
                { type: 'number',  name: 'quantityReturned', defaultValue: 0 },
                { type: 'string', name: 'orderItemId' },
                { type: 'string', name: 'parentItemId' },
                { type: 'int', name: 'orderLineId' },
                { type: 'string', name: 'orderFulfillmentStatus' }
            ],
            data: [],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('orderLineId') === b.get('orderLineId')) {
                        return 0;
                    }
                    return (a.get('orderLineId') < b.get('orderLineId') ? -1 : 1);
                }
            }]
        });
    },

    handleSelect: function (selModel, record, index) {
        if (!record.get('quantity')) record.set('quantity', 1);
    }
});
