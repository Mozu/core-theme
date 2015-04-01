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
                    emptyText: "On Hand",
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
                            isNew = !context.record.get('locationCode') || !context.record.get('productCode');
                        if (isNew || adjustmentMode === 'Absolute') {
                            field.setFieldLabel('');
                            field.setValue(onHandTotal);
                            field.hideTrigger = true;
                        } else {
                            field.setFieldLabel(onHandTotal.toString() + ' +');
                            field.setValue(0);
                            field.hideTrigger = false;
                        }
                    },
                }
            }
        ];
    }

});