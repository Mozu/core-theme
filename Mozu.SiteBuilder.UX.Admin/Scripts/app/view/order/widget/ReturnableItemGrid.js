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

    addReturnableItems: function (store, records) {
        var ineligibleStatuses = [
            Taco.model.Return.constants.statuses.CANCELLED,
            Taco.model.Return.constants.statuses.REJECTED
        ];




        // list of items and their qty currently added to active returns
        var returnedItemQuantities = {};

        //list of items availabie in the returnable item grid
        var eligibleItems = [];
        
        // track the returned quantities of each item in the order

        // build a list of items already added to a return and determine the qty of each that has already been added;
        Ext.Array.each(records, function (record) {
            // ignore any records that have been cancelled or rejected;
            if (!Ext.Array.contains(ineligibleStatuses, record.get('status'))) {

                // for each item in the return add it
                Ext.Array.each(record.get('items'), function (item) {

                    // initialize the item in the list if its not already in the list
                    if (!(item.orderItemId in returnedItemQuantities)) {
                        returnedItemQuantities[item.orderItemId] = 0;
                    }
                    // increment the quantity for the current item;
                    returnedItemQuantities[item.orderItemId] += item.quantity;
                });
            }
        }, this);

        // add items to the returnable items store
        // generate a full list of items to add to the returnable items store; Expanding list of bundled items;
        Ext.Array.each(this.order.get('items'), function (orderItem) {
            if (orderItem.productUsage !== "Bundle") {
                addItem(orderItem, orderItem.id);
            }
            if (orderItem.bundledProducts && orderItem.bundledProducts.length > 0) {
                Ext.Array.each(orderItem.bundledProducts, function (item) {
                    addItem(Ext.apply({}, { quantity: item.quantity * orderItem.quantity }, item), orderItem.id, orderItem.productName);
                });
            }
        });


        // add configured item to the store;        
        //this.store.add(eligibleItems);
        this.store.loadData(eligibleItems);


        // adds an item unless it has been fully returned
        function addItem (item, orderItemId, parentBundleName) {
            if (!allReturned(item)) {
                eligibleItems.push({
                    orderItemId: parentBundleName ? null : orderItemId,
                    productCode: item.productCode,
                    productName: item.productName || item.name,
                    quantity: 0,
                    quantityOrdered: item.quantity,
                    quantityReturned: returnedItemQuantities[orderItemId],
                    parentBundleName: parentBundleName,
                    parentItemId: parentBundleName && orderItemId
                });
            }
        }

        // checks if an item has been fully returned
        function allReturned (orderItem) {
            return orderItem.id in returnedItemQuantities && returnedItemQuantities[orderItem.id] >= orderItem.quantity;
        }
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
                { type: 'number',  name: 'quantityReturned', defaultValue: 0 },
                { type: 'string', name: 'orderItemId' },
                { type: 'string', name: 'parentItemId'}
            ],
            data: []
        });
    },

    handleSelect: function (selModel, record, index) {
        if (!record.get('quantity')) record.set('quantity', 1);
    }
});
