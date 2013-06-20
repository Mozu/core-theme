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
            "type": "auto"
        },
        {
            name: "Value",
            type: "auto",
            useNull: true
        }
    ],

    idProperty: 'Key'
});
