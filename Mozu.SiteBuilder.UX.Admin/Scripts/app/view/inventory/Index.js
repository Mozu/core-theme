/**
 * @class Taco.view.inventory.Index
 */
Ext.define('Taco.view.inventory.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.inventoryindex',
    requires: ['Taco.model.InventoryProduct', 'Taco.store.InventoryProducts', 'Ext.grid.plugin.CellEditing', 'Taco.view.inventory.QuantityEdit'],

    typeName: 'InventoryProduct',
    modelName: 'Taco.model.InventoryProduct',
    store: { type: 'Taco.store.InventoryProducts' },

    requiresContextOfType: ['c', 's'],
    useTilePanel: false,
    launchEditorOnClick:false,
    filterFormConf: null,

    gridPanelConf: {
        selType: 'checkbox',
        // plugins: [
        //     Ext.create('Ext.grid.plugin.CellEditing', {
        //         clicksToEdit: 1
        //     })
        // ],
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
                width: 100,
                renderer: function (value, metaData, record) {
                   

                    return Ext.isNumeric(value) ? value  : '--';
                }
            }],
            listeners: {
                cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {

                    var column = view.getHeaderAtIndex(cellIndex),
                        menu = column.editorMenu;

                    if (Ext.isNumeric(record.get('stockOnHand')) && e.target.className.indexOf('checker')  < 0) {
                        if (menu) {
                            menu.reconfigure(record).showBy(td);
                        } else {
                            column.editorMenu = Ext.create('Taco.view.inventory.QuantityEdit', {
                                record: record
                            });
                            column.editorMenu.showBy(td);
                        }
                    }
                }
            }
    },

    initComponent: function() {
        var me = this;
        
        this.dirtyButton = Ext.widget({
            xtype: 'dirtybutton',
            itemId: 'indexDirtyButton',
            text: 'Save',
            listeners: {
                click: function() {
                    me.store.sync();
                },
                scope: this
            }
        });
                
        this.header = {
            actions: [{
                    xtype: 'secondarybutton',
                    text: 'Cancel',
                    listeners: {
                        click: function() {
                            me.store.rejectChanges();
                        },
                        scope: this
                    }
            }, this.dirtyButton]
        };
        
        this.callParent(arguments);
        
        this.store.on('dirtychange', function (store, state) {
            me.dirtyButton.setDirty(state);
        });
    }
});