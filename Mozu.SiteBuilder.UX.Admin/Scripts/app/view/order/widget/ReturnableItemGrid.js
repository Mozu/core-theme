

/**
 * @class Taco.view.order.widget.ReturnableItemGrid
 */

// TODO: This has been deprecated by the ReturnableItemTree. Need to remove this file.
Ext.define('Taco.view.order.widget.ReturnableItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.model.Return',
        'Ext.data.Store'],

    title: 'Returnable Items',

    viewConfig: {
        deferEmptyText: false,
        stripeRows: false,
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

    initComponent: function () {
        var me = this;
        this.store = this.getReturnableItemsStore();
        this.store.load();
        this.plugins.push(Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        }));

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            injectCheckbox: 'last',
            headerWidth: 37,
            checkOnly: true,
            showHeaderCheckbox: true,
            onHeaderClick: function (headerCt, header, e) {
                var isAllItemsAreReturned = true;
                for (var i = 0; i < this.getStore().data.items.length; i++) {
                    if (parseInt(this.getStore().data.items[i].data.quantityReturnable) == 0) {
                        if (this.getStore().data.items[i].data.quantityReturned > 0) {
                            isAllItemsAreReturned = true;
                        }
                    } else {
                        isAllItemsAreReturned = false;
                        break;
                    }
                }
                if (isAllItemsAreReturned)
                    me.returnableItemsErrorEl.setError('All items have already been returned');
                else
                    me.returnableItemsErrorEl.setError('');
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

    getColumnConfig: function () {
        return [
            {
                dataIndex: 'shipmentNumber',
                text: 'Shipment #',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                minWidth: 100
            },
            {
                dataIndex: 'shipmentItemId',
                text: 'Line Id',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                minWidth: 100
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
                renderer: function (val, md, record) {
                    var parentBundleName = record.get('parentBundleName');
                    return parentBundleName ? val + " <em class=\"taco-bundleditem-note\">(Bundled with <strong>" + parentBundleName + "</strong>)</em>" : val;
                }
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
                    xtype: 'combo',
                    queryMode: 'local',
                    allowOnlyWhitespace: false,
                    showBorder: true,
                    forceSelection: true,   
                    store: (Taco.tenantSettings.catalogDisabled) ? ['Refund'] : ['Refund','Replace']
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
                renderer: function (value) {
                    return value || 0;
                }
            }
        ];
    },

    reload: function () {
        //this.removeAll();

        //this.addReturnableItems()

        //var returnsStore = this.order.getReturnsStore();

        //returnsStore.load();
        this.store.reload();
    },

    /*getResolutionStore: function () {
        if (Taco.tenantSettings.catalogDisabled) {
            return ['Refund'];
        }
        else {
            return ['Replace', 'Refund'];
        }
    },*/

    getReturnableItemsStore: function () {
        var isCatalogDisabled = Taco.tenantSettings && Taco.tenantSettings.catalogDisabled;

        return Ext.create('Ext.data.Store', {
            storeId: 'ReturnableItemsStore',
            fields: [
                { type: 'string', name: 'orderItemId' },
                { type: 'int', name: 'orderLineId' },
                { type: 'string', name: 'productCode' },
                {
                    type: 'string', name: 'productName',
                    convert: function (value, record) {
                        //var excludeExtras = record.get('excludeProductExtras');
                        //var isChild = record.get('parentItemId');
                        //var extra = isChild ? '' : excludeExtras ? ' (stand alone)' : ' (with extras)';
                        return value;// + extra;
                    }
                },
                { type: 'string', name: 'orderItemOptionAttributeFQN' },
                { type: 'boolean', name: 'excludeProductExtras' },
                { type: 'float', name: 'unitPrice' },
                { type: 'number', name: 'quantityOrdered' },
                { type: 'number', name: 'quantityFulfilled' },
                { type: 'number', name: 'quantityDirectlyReturned' },
                { type: 'number', name: 'quantityIndirectlyReturned' },
                { type: 'number', name: 'quantityReturned' },
                { type: 'number', name: 'quantityReturnable' },
                { type: 'number', name: 'shipmentNumber' },
                { type: 'number', name: 'shipmentItemId' },
                { type: 'number', name: 'unitQuantity' },
                { type: 'string', name: 'parentItemId' },
                { type: 'string', name: 'parentProductCode' },
                { type: 'string', name: 'parentProductName' },
                { type: 'string', name: 'fulfillmentStatus' },
                { type: 'string', name: 'returnType', defaultValue: (isCatalogDisabled) ? 'Refund' : 'Select' },
                { type: 'string', name: 'reason', defaultValue: 'Select' },
                { type: 'number', name: 'quantity', defaultValue: 0 }
            ],
            data: [],
            proxy: {
                type: 'ajax',
                url: '/admin/app/order/returnableitems',
                extraParams: {
                    'orderId': this.order.get('id')
                },
                reader: {
                    type: 'json',
                    root: 'items'
                }
            },
        });
    },

    handleSelect: function (selModel, record, index) {
        var unreturned = record.get('quantityFulfilled') - record.get('quantityReturned');

        if (!record.get('quantity') && unreturned > 0) {
            record.set('quantity', 1);
        }
    }
});
