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
                width: 100,
                text: "Available",
                stateId: 'stockAvailable',
                dataIndex: 'stockAvailable'
            }, {
                width: 100,
                text: 'On Reserve',
                dataIndex: 'stockReserved',
                stateId: 'stockReserved',
                renderer: function(value) {
                    return value || 0;
                }
            }, {
                dataIndex: 'stockOnHand',
                width: 150,
                itemId: "stockOnHand",
                stateId: 'stockOnHand',
                text: 'On Hand',
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
                        var adjustmentMode = Ext.ComponentQuery.query('#adjustmentMode')[0].getValue(),
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
                    },
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