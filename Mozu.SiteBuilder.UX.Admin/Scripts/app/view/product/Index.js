/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.product.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.prodindex',
    requires: ['Taco.model.Product'],

    typeName: 'Product',
    modelName: 'Taco.model.Product',
    storeName: 'Taco.store.Products',
    editorName: 'Taco.view.product.Edit',
    filterProperty: 'productName',

    gridPanelConf: {
        columns: [{
            dataIndex: 'productCode',
            text: 'Code',
            width: 150
        }, {
            dataIndex: 'productName',
            text: 'Name',
            renderer: function(value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            },
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
                    '<td colspan="2" class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                    '<td class="x-grid-cell"><div class="x-grid-cell-inner"><a href="#" class="taco-launch-editor" data-site-id="{siteId}">{parent.productName}</a></div></td>',
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
    },

    tilePanelConf: {
        actions: [{
            iconCls: 'download',
            tooltip: 'View Product',
            eventName: 'viewitem'
        }, {
            iconCls: 'duplicate',
            tooltip: 'Duplicate Product',
            eventName: 'duplicateitem'
        }, {
            iconCls: 'delete',
            tooltip: 'Delete Product',
            eventName: 'deleteitem'
        }],
        imageCollection: 'productImages',
        imageField: 'imagePath',
        isDragable: false,
        nameField: 'productName',
    },

    
});
