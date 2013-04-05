/**
 * @class Taco.view.inventory.Index
 */
Ext.define('Taco.view.inventory.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.inventoryindex',
    requires: ['Taco.model.InventoryProduct', 'Taco.store.InventoryProducts', 'Ext.grid.plugin.CellEditing'],

    typeName: 'InventoryProduct',
    modelName: 'Taco.model.InventoryProduct',
    store: { type: 'Taco.store.InventoryProducts' },
   
    useTilePanel: false,
    launchEditorOnClick:false,
    filterFormConf: null,

    gridPanelConf: {
        selType: 'checkbox',
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            })
        ],
        columns: [{
                dataIndex: 'productCode',
                text: 'Code',
                width: 100
            }, {
                dataIndex: 'productName',
                text: 'Name',
                minWidth: 120,
                resizable: false,
                flex: 1,
                renderer: function(value, metaData, record) {
                    return record.getContextualValue('productName');
                }
            }, {
                dataIndex: 'price',
                text: 'Price',
                width: 70,
                renderer: function(value, metaData, record) {
                    value = record.getContextualValue('price');
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 100,
                renderer: function(value, metaData, record) {
                    value = record.getContextualValue('salePrice');
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                }
            }, {
                dataIndex: 'productInSites',
                text: 'Sites',
                sortable: false,
                width: 120,
                renderer: function(value) {
                    return !Ext.isEmpty(value) ? value.length : '--';
                }
            }, {
                dataIndex: 'stockOnHand',
                text: 'Stock',
                editor: {
                    xtype: 'numberfield',
                    hideTrigger: true,
                },
                width: 70,
                renderer: function(value) {
                    return Ext.isNumeric(value) ? value : '--';
                }
            }]
    },

    initComponent: function() {
        this.header = {
            actions: [{
                    xtype: 'secondarybutton',
                    text: 'Cancel',
                    listeners: {
                        click: function() {
                            console.log('cancel', arguments);
                        },
                        scope: this
                    }
                }, {
                    xtype: 'dirtybutton',
                    text: 'Save',
                    listeners: {
                        click: function() {
                            console.log('save', arguments);
                        },
                        scope: this
                    }
                }]
        };
        this.callParent(arguments);
    }
});
        
