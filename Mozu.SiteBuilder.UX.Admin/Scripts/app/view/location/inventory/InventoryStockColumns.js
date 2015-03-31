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
                width: 100,
                itemId: "stockOnHand",
                stateId: 'stockOnHand',
                text: 'On Hand Total',
                editor: {
                    emptyText: "On Hand",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    hideTrigger: true,
                    defaultValue: 0,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: false
                }
            }
        ];
    }

});