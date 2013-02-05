/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Ext.selection.CheckboxModel', 'Ext.ux.RowExpander'],

    header: {
        title: 'Grid Testing'
    },

    initComponent: function () {
        var me = this,
            sm, gp;

        this.store = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters:true , clearSort:true });

        sm = Ext.create('Ext.selection.CheckboxModel');

        gp = Ext.create('Ext.grid.Panel', {
            store: this.store,
            selModel: sm,
            columns: [{
                dataIndex: 'productCode',
                text: 'Code',
                width: 150
            }, {
                dataIndex: 'productName',
                text: 'Name',
                flex: 1
            }, {
                dataIndex: 'price',
                text: 'Price',
                width: 150,
                renderer: function (value) {
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 150,
                renderer: function (value) {
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                }
            }, {
                dataIndex: 'productInSites',
                text: 'Sites',
                width: 150,
                renderer: function (value) {
                    return !Ext.isEmpty(value) ? value.length : '--';
                }
            }, {
                dataIndex: 'productInSites',
                text: 'Overridden',
                width: 150,
                renderer: function (value) {
                    var ret;

                    if (Ext.isEmpty(value)) {
                        ret = '--';
                    } else {
                        ret = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true) ? 'Yes' : 'No';
                    }

                    return ret;
                }
            }, {
                dataIndex: 'stockOnHand',
                text: 'Stock',
                width: 150,
                renderer: function (value) {
                    return Ext.isNumeric(value) ? value : '--';
                }
            }],
            dockedItems: [{
                xtype: 'container',
                dock: 'top',
                weight: 90,
                layout: 'auto',
                items: [{
                    xtype: 'component',
                    html: 'hello world'
                }]
            }],
            plugins: [{
                ptype: 'rowexpander',
                rowBodyTpl: new Ext.XTemplate(
                    '<div>hello world</div>'
                )
            }]
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [gp]
        });

        this.callParent(arguments);

        this.store.load();
    }
});
