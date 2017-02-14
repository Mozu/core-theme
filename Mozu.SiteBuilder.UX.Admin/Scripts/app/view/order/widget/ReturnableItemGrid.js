/**
 * @class Taco.view.order.widget.ReturnableItemGrid
 */

Ext.define('Taco.view.order.widget.ReturnableItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.model.Return',
               'Ext.data.Store'],

    title: 'Returnable Items',

    viewConfig: {
        deferEmptyText: false,
        stripeRows: false,
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

        this.reasonStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: [
                {
                    name: 'id',
                    type: 'string',
                    convert: function (value, record) {
                        return record.raw;
                    }
                },
                {
                    name: 'name',
                    type: 'string',
                    convert: function (value, record) {
                        return Taco.core.util.Common.camelToSpace(record.raw);
                    }
                }
            ],
            proxy: {
                type: 'ajax',
                url: '/admin/app/return/reasons',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        this.columns = this.getColumnConfig();

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

    getColumnConfig: function() {
        return [
            {
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                dataIndex: 'orderLineId'
            },
            {
                dataIndex: 'productCode',
                text: 'Code',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                minWidth: 100,
                flex: 1
            },
            {
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
            },
            {
                text: 'Status',
                draggable: false,
                resizable: true,
                width: 150,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                dataIndex: 'fulfillmentStatus'
            },
            {
                dataIndex: 'quantityOrdered',
                text: 'Qty Ordered',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            },
            {
                dataIndex: 'quantityFulfilled',
                text: 'Qty Fulfilled',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            },
            {
                dataIndex: 'quantityReturned',
                text: 'Qty Returned',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100
            },
            {
                dataIndex: 'quantityReturnable',
                text: 'Qty Returnable',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 110
            },
            {
                dataIndex: 'reason',
                text: 'Reported Issue',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 175,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    showBorder: true,
                    allowOnlyWhitespace: false,
                    forceSelection: true,
                    valueField: 'name',
                    displayField: 'name',
                    store: this.reasonStore
                }
            },
            {
                dataIndex: 'returnType',
                text: 'Resolution',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    allowOnlyWhitespace: false,
                    showBorder: true,
                    forceSelection: true,
                    store: ['Replace', 'Refund']
                }
            },
            {
                dataIndex: 'quantity',
                text: 'Qty to Return',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    showBorder: true,
                    hideTrigger: true,
                    minValue: 0,
                    msgTarget: 'qtip'
                },
                renderer: function(value) {
                    return value || 0;
                }
            }
        ];
    },

    reload: function () {
        //this.removeAll();
        
        //this.addReturnableItems()

        var returnsStore = this.order.getReturnsStore();

        returnsStore.load();
    },

    addReturnableItems: function (store, returns) {
        var me = this;
        var ineligibleStatuses = [
            Taco.model.Return.constants.statuses.CANCELLED,
            Taco.model.Return.constants.statuses.REJECTED
        ];

        this.store.load();
        //var returnableItems = this.order.get('returnableItems');
        //var returnableItems = this.order.getReturnableItems({
        //    success: function(response) {
        //        me.store.loadData(response.responseText);
        //        var derp = 1;
        //    },
        //    failure: function(response) {
                
        //    }
        //});

/**
        // list of items and their qty currently added to active returns
        var returnedItemQuantities = {};
        
        // track the returned quantities of each item in the order

        // initialize quantity already returned for each returnable item.
        Ext.Array.each(returnableItems, function (returnableItem) {
            returnableItem.quantityReturned = 0 // returnedItemQuantities[returnableItem.orderItemId];
        });

        // TODO: Move this logic to the MVC layer.
        // build a list of items already added to a return and determine the qty of each that has already been added;
        Ext.Array.each(returns, function (ret) {
            // ignore any records that have been cancelled or rejected;
            if (!Ext.Array.contains(ineligibleStatuses, ret.get('status'))) {

                // for each item in the return, find the returnable item and update its returnedQuantity.
                // TODO: Account for parent with product extras.
                Ext.Array.each(ret.get('items'), function (item) {
                    var i, matchingReturnableItems, returnableItem;

                    for (i = 1; i <= item.quantity; i++) {
                        matchingReturnableItems = Ext.Array.filter(returnableItems, function(ri) {
                            return ri.productCode === item.productCode &&
                                ri.orderLineId === item.orderLineId &&
                                ri.orderItemOptionAttributeFQN === item.orderItemOptionAttributeFQN &&
                                ri.quantityReturned < ri.quantityOrdered;
                        });
                        if (!matchingReturnableItems || !matchingReturnableItems.length) continue;
                        // in case multiple returnable items exist for the same product code, round-robin over them all and increment quantity returned.
                        returnableItem = Ext.Array.sort(matchingReturnableItems, function(a, b) {
                            return a.quantityReturned < b.quantityReturned ? -1 : 1;
                        })[0];
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
*/
    },

    getReturnableItemsStore: function () {
        return Ext.create('Ext.data.Store', {
            fields: [
                { type: 'string',  name: 'orderItemId' },
                { type: 'int',     name: 'orderLineId' },
                { type: 'string',  name: 'productCode' },
                {
                    type: 'string', name: 'productName',
                    convert: function(value, record) {
                        var excludeExtras = record.get('excludeProductExtras');
                        var isChild = record.get('parentItemId');
                        var extra = isChild ? '' : excludeExtras ? ' (stand alone)' : ' (with extras)';
                        return value + extra;
                    }
                },
                { type: 'string',  name: 'orderItemOptionAttributeFQN' },
                { type: 'boolean', name: 'excludeProductExtras' },
                { type: 'float',   name: 'unitPrice' },
                { type: 'number',  name: 'quantityOrdered' },
                { type: 'number',  name: 'quantityFulfilled' },
                { type: 'number',  name: 'quantityDirectlyReturned' },
                { type: 'number',  name: 'quantityIndirectlyReturned' },
                {
                    type: 'number', name: 'quantityReturned',
                    convert: function(value, record) {
                        return record.get('quantityDirectlyReturned') + record.get('quantityIndirectlyReturned');
                    }
                },
                { type: 'number',  name: 'quantityReturnable' },
                { type: 'number',  name: 'unitQuantity' },
                { type: 'string',  name: 'parentItemId' },
                { type: 'string',  name: 'parentProductCode' },
                { type: 'string',  name: 'parentProductName' },
                { type: 'string',  name: 'fulfillmentStatus' },
                { type: 'string',  name: 'returnType', defaultValue: 'Select' },
                { type: 'string',  name: 'reason', defaultValue: 'Select' },
                { type: 'number',  name: 'quantity', defaultValue: 0 }
            ],
            data: [],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('orderLineId') === b.get('orderLineId')) {
                        return 0;
                    }
                    return (a.get('orderLineId') < b.get('orderLineId') ? -1 : 1);
                }
            }],
            proxy: {
                type: 'ajax',
                url: '/admin/app/order/returnableitems',
                extraParams: {
                    'orderId': this.order.get('id')
                },
                reader: {
                    type: 'json'
                }
            }
        });
    },

    handleSelect: function (selModel, record, index) {
        var unreturned = record.get('quantityFulfilled') - record.get('quantityReturned');
        
        if (!record.get('quantity') && unreturned > 0) {
            record.set('quantity', 1);
        }
    }
});
