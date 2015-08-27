/**
* @class Taco.model.KeyValuePair
* @author Jason Cochran
* The KeyValuePair model
*/

Ext.define('Taco.model.KeyValuePair', {
    extend: 'Taco.core.data.Model',

    "fields":
    [
        {
            "name": "Key",
            "type": "auto",
            convert: function (v, record) {
                if (record.raw) {
                    return v || record.raw.key;
                }
                return v;
            }
        },
        {
            name: "Value",
            type: "auto",
            useNull: true,
            convert: function (v, record) {
                if (record.raw) {
                    return v || record.raw.value;
                }
                return v;
            }
        }, {
            name: 'key',
            persist: false
        }, {
            name: 'value',
            persist: false
        }
    ],

    idProperty: 'Key'
});
