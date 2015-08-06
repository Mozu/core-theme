/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.FilterField', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: "id", type: "string",
            convert: function (value, record) {
                // force the id's lower case this store's id's need to be case insensitive;
                return value.toLowerCase();
            }
        }, 
        { name: "field", type: "string" },
        { name: "text", type: "string" },
        { name: "defaultValue", type: "auto" },
        { name: "dataType", type: "string" },
        { name: "supportedOperators", type: "array"},
        { name: "validEnumValues", type: "array" },
        { name: "editorCfg", type: "object" },
        { name: "filterType", type: "string", defaultValue: "DynamicPreComputed" },
        { name: "allowBlank", type: "boolean" }
    ]
});
