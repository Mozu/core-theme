/**
 * @class Taco.model.StorefrontProduct
 * Models a ProductRuntime product
 * @extends Taco.core.data.Model * 
 */
Ext.define("Taco.model.ShipmentAdjustment", {
    extend: "Taco.core.data.Model",
    idProperty: "id",
    fields: [
        { name: "id", type: "string" },
        { name: "adjustmentId", type: "string" },
        { name: "name", type: "string" },
        { name: "originalAmount", type: "float", "defaultValue": 0},
        { name: "originalAdjustmentAmount", type: "float", "defaultValue": 0},
        { name: "adjustedTotal", type: "float", "defaultValue": 0},
        { 
            name: "adjustmentAmount",
            type: "float",
            defaultValue: 0,
            convert: function(value, record) {
                var originalAmount  = record.get('originalAmount');
                record.data.adjustedTotal = originalAmount + value;

                return value;
            }
        }
    ],
    formatCurrency: function (value) {
        return Taco.app.context.getCurrent().formatCurrency(value);
    }
});