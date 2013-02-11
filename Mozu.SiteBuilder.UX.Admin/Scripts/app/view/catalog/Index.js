/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Ext.selection.CheckboxModel', 'Taco.core.ux.grid.Panel', 'Ext.ux.RowExpander'],

    header: {
        title: 'Grid Testing'
    },

    initComponent: function () {
        var me = this,
            sm, gp;

        this.store = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters:true , clearSort:true });

        sm = Ext.create('Ext.selection.CheckboxModel', {
            checkOnly: true
        });

        gp = Ext.create('Taco.core.ux.grid.Panel', {
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
                    '<tpl for="productInSites"><tr class="x-grid-row-body">',
                        '<td colspan="3" class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner">{productName}</div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner">{price:this.formatPrice}</div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner">{salePrice:this.formatPrice}</div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner">{siteId}</div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner">{isContentOverridden}</div></td>',
                        '<td class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                    '</tr></tpl>',
                {
                    formatPrice: function (value) {
                        return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                    }
                })
            }]
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [gp]
        });

        this.callParent(arguments);

        this.store.load();

        gp.on({
            itemclick: this.onItemClick,
            scope: this
        });
    },

    onItemClick: function (view, record, item, index, e) {
        e.preventDefault();
        console.log(record, e.getTarget('tr.x-grid-row-body'));
    }
});