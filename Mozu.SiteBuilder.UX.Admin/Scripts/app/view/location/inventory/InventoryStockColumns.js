/** 
 * @class Taco.view.location.inventory.InventoryStockColumns
 * common columns with Index & LocationInventory
 * */
Ext.define('Taco.view.location.inventory.InventoryStockColumns', {
    singleton: true,

    constructor: function(config) {
        this.initConfig(config);
    },
    config: {
        
    },
    
    getInventoryStockColumns: function (primaryKeyFieldName) {
        var disableFieldOnCreate = function (field, editor, context) {
            if (!context.record.get(primaryKeyFieldName)) {
                field.disable();
            } else {
                field.enable();
            }
        };
        return [
            {
                flex: 0.5,
                text: "SKU",
                stateId: 'sku',
                dataIndex: 'sku',
                sortable: false,
                hidden: Taco.tenantSettings.catalogDisabled == true ? false : true
            },
            {
                flex: 4,
                text: "Part Number",
                stateId: 'mfgPartNumber',
                dataIndex: 'mfgPartNumber',
                sortable: false,
                hidden: Taco.tenantSettings.catalogDisabled == true ? false : true
            },
            {
                flex: Taco.tenantSettings.catalogDisabled == true ? 0.5 : '',
                text: "Available",
                stateId: 'stockAvailable',
                dataIndex: 'stockAvailable',
                sortable: false,
                hideable: false,
            }, {
                flex: Taco.tenantSettings.catalogDisabled == true ? 0.5 : '',
                text: 'On Reserve',
                dataIndex: 'stockReserved',
                stateId: 'stockReserved',
                sortable: false,
                hideable: false,
                renderer: function(value) {
                    return value || 0;
                }
            }, {
                dataIndex: 'stockOnHand',
                flex: 0.5,
                itemId: "stockOnHand",
                stateId: 'stockOnHand',
                text: 'On Hand',
                sortable: false,
                hideable: false,
                editor: {
                    emptyText: "add",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    fieldLabel: '',
                    labelPad: 1,
                    labelAlign: 'left',
                    labelWidth: 50,
                    hideTrigger: false,
                    defaultValue: 0,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: true,
                    onEditorShow: function (field, editor, context) {
                        
                        var adjustmentMode = Ext.ComponentQuery.query('#adjustmentModeAdd')[0].checked ? 'Add' : 'Absolute',
                            onHandTotal = context.record.get('stockOnHand') || 0,
                            isNew = !context.record.get('locationCode') || !context.record.get('productCode'),

                            setupDeltaEditor = function () {
                                context.record.set('originalStockOnHand', onHandTotal);
                                field.setFieldLabel(onHandTotal.toString() + ' +');
                                context.record.set('stockOnHand', null);
                                field.hideTrigger = false;
                                editor.addListener('canceledit', function listenToDeltaCancelEvent(rowEditor, container) {
                                    container.record.set('stockOnHand', container.record.get('originalStockOnHand'));
                                    Taco.view.location.inventory.InventoryStockColumns.removeDeltaListener(rowEditor);
                                }, this);
                            };

                        if (isNew || adjustmentMode === 'Absolute') {
                            field.setFieldLabel('');
                            field.hideTrigger = true;
                        } else {
                            setupDeltaEditor();
                        }
                    }
                }
            }
        ];
    },

    removeDeltaListener: function(rowEditor) {
        var deltaListeners = Ext.Array.filter(rowEditor.events.canceledit.listeners, function (item) {
            return item.fn.name === 'listenToDeltaCancelEvent';
        });
        Ext.Array.each(deltaListeners, function (deltaItem) {
            Ext.Array.remove(rowEditor.events.canceledit.listeners, deltaItem);  //removeListener didn't work
        });
    }

});