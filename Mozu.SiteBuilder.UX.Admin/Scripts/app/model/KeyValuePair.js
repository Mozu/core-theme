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
            "type": "string"
        },
        {
            name: "Value",
            type: "any",
            useNull: true
        }
    ],

    idProperty: 'Key'
});
