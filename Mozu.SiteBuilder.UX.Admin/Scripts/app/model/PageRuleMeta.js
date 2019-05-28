/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.PageRuleMeta', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: "propertyName",
            type: "string",
        }, {
            name: "dataType",
            type: "string"
        }, {
            name: "validOperators",
            type: "array",
            defaultValue: []
        }, {
            name: "allowNull",
            type: "boolean",
            defaultValue: false
        }, {
            name: "isDynamic",
            type: "boolean",
            defaultValue: true
        }
    ]
});