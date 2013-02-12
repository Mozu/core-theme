/**
 * @class Taco.view.phoneOrder.ProductPicker
 */
Ext.define('Taco.view.phoneOrder.ProductPicker', {
    extend: 'Taco.core.ux.browser.ItemBrowser',
    requires: ['Taco.core.ux.grid.Pager', 'Taco.core.ux.BaseGrid'],
    itemType: 'products',
    filterProperty: 'productName',
    height: 500,
    width: 700,
    getSelectedProduct: function () {
        return this.getLayout().getActiveItem().items.get(0).getSelectionModel().selected.getRange()[0];
    },
    initComponent: function () {
        var me = this;

        me.itemStore = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters: true, clearSort: true });

        me.pager = Ext.create('Taco.core.ux.grid.Pager', {
            store: me.itemStore
        });

        me.gridpanel = Ext.create('Taco.core.ux.BaseGrid', {
            id: 'phoneorderproductpickergrid',
            store: me.itemStore,
            enableColumnHide: false,
            disableSelection: false,
            columns: [{
                xtype: 'gridcolumn',
                dataIndex: 'productImages', // Change this hack later
                text: 'Image',
                width: 80,
                sortable: false,
                renderer: function (value) {
                    if (value && value.length > 0) {
                        return '<div class="taco-basegrid-thumbnail"><img width="60px" src="' + value[0].imagePath + '?size=60"></div>';
                    } else {
                        return '<div class="taco-image-square taco-image-placeholder">&nbsp;</div>';
                    }
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'productCode',
                text: 'Code',
                hidden: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                text: 'Name',
                flex: 1,
                hideable: false,
                cls: 'taco-frozen',
                width: 250
            }, {
                xtype: 'numbercolumn',
                dataIndex: 'salePrice',
                text: 'Price',
                format: '$0,00.00',
                align: 'right',
                renderer: function (value, meta, record) {
                    // console.log(value, meta, record);
                    if (record.data.price) {
                        return value ? '<s>$' + record.data.price.toFixed(2) + '</s><br />$' + value.toFixed(2) : '$' + record.data.price.toFixed(2);
                    }
                    return null;
                }
            }, {
                xtype: 'numbercolumn',
                dataIndex: 'stockOnHand',
                text: 'Stock',
                format: '000',
                align: 'right'
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'isActive',
                text: 'Status',
                renderer: function (value) {
                    return value ? 'Available' : 'Hidden';
                }
            }],
           dockedItems: [me.pager],
        });

        me.tilepanel = Ext.create('Taco.core.ux.TilePanel', {
            store: me.itemStore,
            imageCollection: 'productImages',
            imageField: 'imagePath',
            isDragable: false,
            nameField: 'productName',
            simpleSelect: true,
            editable: false
        });

        me.uniquePanels = [me.gridpanel, me.tilepanel]

        this.callParent(arguments);
        this.itemStore.load();
    }
});
