/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.BaseGrid', 'Taco.core.ux.simplegrid.Grid', 'Ext.grid.Panel', 'Taco.store.Products', 'Taco.core.ux.form.SelectField'],

    header: {
        title: 'Simple Products'
    },

    initComponent: function () {
        var me = this,
            simplegrid, statusStore;

        this.store = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters: true , clearSort: true });

        statusStore = Ext.create('Ext.data.ArrayStore', {
            id: 'productStatusValues',
            fields: [{
                name: 'storedValue',
                type: 'boolean'
            }, {
                name: 'displayValue',
                type: 'string'
            }],
            data: [
                [true, 'Available'],
                [false, 'Hidden']
            ]
        });

        simplegrid = Ext.create('Taco.core.ux.simplegrid.Grid', {
            store: this.store,
            cls: 'taco-simplegrid-products',
            columns: [{
                dataIndex: 'productName',
                text: 'Product',
                editable: true
            }, {
                dataIndex: 'price',
                text: 'Price',
                align: 'right',
                editable: true,
                renderer: function (value, recordData) {
                    var output = Ext.util.Format.usMoney(value);

                    if (Ext.isNumeric(recordData.salePrice)) {
                        output = '<s>' + output + '</s><br />' + Ext.util.Format.usMoney(recordData.salePrice);
                    }
                    return output;
                }
            }, {
                dataIndex: 'productCode',
                text: 'Code',
                editable: false
            }, {
                dataIndex: 'stockOnHand',
                text: 'Stock',
                align: 'right',
                editable: false,
                renderer: function (value) {
                    return (!value && value !== 0) ? '--' : value;
                }
            }, {
                dataIndex: 'isActive',
                text: 'Status',
                editable: true,
                editor: {
                    xtype: 'selectfield',
                    mode: 'local',
                    valueField: 'storedValue',
                    displayField: 'displayValue',
                    store: 'productStatusValues'
                },
                renderer: function (value) {
                    return value ? 'Available' : 'Hidden';
                }
            }],
            emptyText: 'No products available'
        });

        Ext.apply(me.body, {
            items: [simplegrid]
        });

        this.callParent(arguments);

        this.store.load();
    }
});
