/**
 * @class Taco.view.order.widget.ReturnableItemTree
 * Shows a tree of returnable items from an Order.
 * - Bundle with extras
 *   - Bundle only
 *     - Bundle item 1
 *     - Bundle item 2
 *   - Extra 1
 *   - Extra 2
 * - Product with extras
 *   - Product only
 *   - Extra 1
 *   - Extra 2
 */
Ext.define('Taco.view.order.widget.ReturnableItemTree', {
    extend: 'Ext.tree.Panel',
    requires: ['Taco.model.Return',
        'Ext.data.Store'],

    title: 'Returnable Items',
    rootVisible: false,
    //useArrows: true,
    lines: false,
    rowLines: true,

    viewConfig: {
        deferEmptyText: false,
        emptyText: "No items available to return",
        getRowClass: function (record) {
            return record.get('parentBundleName') && "taco-returnableitem-bundled" || '';
        }
    },

    plugins: [],

    config: {
        order: null,
        record: null
    },

    allSelected: false,

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
            showHeaderCheckbox: true,
            setup: function () {
                this.maxSelections = 0;
                var selections = this.store.getRange();

                for (var key in selections) {
                    if (selections[key].data.quantityReturnable !== 0) {
                        this.maxSelections++;
                    }
                }

                this.isSetup = true;
            },

            setHeader: function (header) {
                this.checkallBox = header;
            },

            setErrorEl: function (el) {
                this.errorEl = el;
            },

            checkSelected: function () {
                if (!this.isSetup) this.setup();

                if (this.getSelection().length === this.maxSelections && this.maxSelections !== 0) {
                    this.allSelected = true;
                    this.checkallBox.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');

                    var me = this;
                    setTimeout(function () {
                        if (me.getSelection().length === 0) return;
                        me.checkallBox.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    }, 100);
                } else {
                    this.allSelected = false;
                    this.checkallBox.el.removeCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                }
            },

            selectAll: function (suppressEvent, header) {
                if (!this.allSelected) {
                    this.allSelected = true;
                    var selections = this.store.getRange();
                    var returnableItems = [];

                    for (var key in selections) {
                        if (selections[key].data.quantityReturnable !== 0) {
                            returnableItems.push(selections[key]);
                        }
                    }

                    var len = returnableItems.length;
                    for (var i = 0; i < len; i++) {
                        this.doSelect(returnableItems[i], true, suppressEvent);

                        var unreturned = returnableItems[i].get('quantityFulfilled') - returnableItems[i].get('quantityReturned');

                        if (!returnableItems[i].get('quantity') && unreturned > 0) {
                            returnableItems[i].set('quantity', 1);
                        }
                    }

                    if (this.getSelection().length !== 0) {
                        header.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    } else {
                        this.errorEl.setError('All items have already been returned');
                        this.allSelected = false;
                        return;
                    }
                } else {
                    this.allSelected = false;
                    this.deselectAll(suppressEvent);
                }

                this.errorEl.setError('');
            },

            onHeaderClick: function (headerCt, header, e) {
                if (!header.isCheckerHd) {
                    return;
                }

                e.stopEvent();
                this.selectAll(true, header);
            },

            listeners: {
                deselect: function (grid, record) {
                    this.checkSelected();
                    this.errorEl.setError('');
                },

                select: function (grid, record) {
                    this.checkSelected();
                    this.errorEl.setError('');
                }
            },

            renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                var baseCSSPrefix = Ext.baseCSSPrefix;
                metaData.tdCls = baseCSSPrefix + 'grid-cell-special ' + baseCSSPrefix + 'grid-cell-row-checker';
                return record.get('quantityReturnable') === 0 ? '<div class="' + baseCSSPrefix + 'grid-row-checker disabled-return-checkbox"> </div>' : '<div class="' + baseCSSPrefix + 'grid-row-checker"> </div>';
            }
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

        this.callParent();

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

        // Loading should be kicked off by the parent Return subform.
        //this.loadReturnableItemsData();
    },

    getColumnConfig: function () {
        return [
            {
                dataIndex: 'orderLineId',
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left'
            },
            {
                xtype: 'treecolumn',
                dataIndex: 'productName',
                text: 'Product',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: true,
                minWidth: 100,
                flex: 4
            },
            {
                dataIndex: 'productCode',
                text: 'Code',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            //{
            //    text: 'Status',
            //    draggable: false,
            //    resizable: true,
            //    width: 150,
            //    sortable: false,
            //    menuDisabled: true,
            //    hidden: false,
            //    align: 'left',
            //    dataIndex: 'fulfillmentStatus'
            //},
            {
                dataIndex: 'quantityOrdered',
                text: 'Ordered',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'quantityFulfilled',
                text: 'Fulfilled',
                draggable: false,
                sortable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'quantityReturned',
                text: 'Returned',
                draggable: false,
                sortable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'quantityReturnable',
                text: 'Returnable',
                draggable: false,
                sortable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 90,
                flex: 1
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
                },
                renderer: function (value, meta, record) {
                    if (record.get('quantityReturnable') > 0) {
                        return value;
                    } else {
                        meta.tdCls = meta.tdCls + ' disabled-return-input';
                        return 'N/A';
                    }
                }
            },
            {
                dataIndex: 'returnType',
                text: 'Type',
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
                },
                renderer: function (value, meta, record) {
                    if (record.get('quantityReturnable') > 0) {
                        return value;
                    } else {
                        meta.tdCls = meta.tdCls + ' disabled-return-input';
                        return 'N/A';
                    }
                },
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
                renderer: function (value, meta, record) {
                    if (record.get('quantityReturnable') > 0) {
                        return value;
                    } else {
                        meta.tdCls = meta.tdCls + ' disabled-return-input';
                        return 0;
                    }
                }
            }
        ];
    },

    loadReturnableItemsData: function () {
        Ext.Ajax.request({
            url: '/admin/app/order/returnableitems',
            method: 'GET',
            params: {
                'orderId': this.order.get('id')
            },
            success: this.processresponse,
            scope: this
        });
    },

    processresponse: function (response, options) {
        var data = Ext.decode(response.responseText);

        //create the new structure
        var tree = this.createTree(data.items);

        this.store.setRootNode(tree);

        var i = 0;
        while (true) {
            var header = this.headerCt.getHeaderAtIndex(i);

            if (!header) {
                break;
            } else if (header.isCheckerHd) {
                this.getSelectionModel().setHeader(header);
                break;
            }
            i++;
        }
    },

    createTree: function (data) {
        var entriesByLine = [];
        data.reduce(function (collection, item) {
            collection[item.orderLineId] = collection[item.orderLineId] || [];
            collection[item.orderLineId].push(item);
            return collection;
        }, entriesByLine);

        var wholes = [];
        entriesByLine.forEach(function (entry) {
            var whole = entry.find(function (item) {
                return !item.parentProductCode && !item.excludeProductExtras;
            });
            var bundle = entry.find(function (item) {
                return !item.parentProductCode && item.excludeProductExtras;
            });
            var products = entry.reduce(function (collection, item) {
                if (item.parentProductCode && !item.orderItemOptionAttributeFQN) {
                    item.leaf = true;
                    collection.push(item);
                }
                return collection;
            }, []);
            var extras = entry.reduce(function (collection, item) {
                if (item.parentProductCode && item.orderItemOptionAttributeFQN) {
                    item.leaf = true;
                    collection.push(item);
                }
                return collection;
            }, []);
            if (extras.length > 0) {
                whole.hasExtras = true;
            }
            if (bundle) {
                whole.children = [bundle].concat(extras);
                //whole.expanded = true;
                bundle.children = products;
                //bundle.expanded = true;
            }
            else {
                whole.children = products.concat(extras);
                //whole.expanded = true;
            }
            wholes.push(whole);
        });

        return { children: wholes };
    },

    getReturnableItemsStore: function () {
        return Ext.create('Ext.data.TreeStore', {
            fields: [
                { type: 'string', name: 'orderItemId' },
                { type: 'int', name: 'orderLineId' },
                { type: 'string', name: 'productCode' },
                {
                    type: 'string', name: 'productName',
                    convert: function (value, record) {
                        var hasExtras = record.get('hasExtras');
                        var extra = hasExtras ? ' (with extras)' : '';
                        return value + extra;
                    }
                },
                { type: 'string', name: 'orderItemOptionAttributeFQN' },
                { type: 'boolean', name: 'hasExtras' },
                { type: 'boolean', name: 'excludeProductExtras' },
                { type: 'number', name: 'quantityOrdered' },
                { type: 'number', name: 'quantityFulfilled' },
                { type: 'number', name: 'quantityDirectlyReturned' },
                { type: 'number', name: 'quantityIndirectlyReturned' },
                { type: 'number', name: 'quantityReturned' },
                { type: 'number', name: 'quantityReturnable' },
                { type: 'number', name: 'unitQuantity' },
                { type: 'string', name: 'parentProductCode' },
                { type: 'string', name: 'parentProductName' },
                { type: 'string', name: 'fulfillmentStatus' }
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
        var unreturned = record.get('quantityFulfilled') - record.get('quantityReturned');

        if (!record.get('quantity') && unreturned > 0) {
            record.set('quantity', 1);
        }
    }
});
