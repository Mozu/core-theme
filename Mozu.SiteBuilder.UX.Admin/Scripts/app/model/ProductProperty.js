/**
* @class Taco.model.ProductProperty
* @author James Zetlen
* This model indicates a Product membership in a Site, and contains any overrides to the Product defaults.
*/

Ext.define('Taco.model.ProductProperty', {
    extend: 'Taco.core.data.Model',
    
    fields:
    [
        {
            "name": "attributeFQN",
            "type": "string",
            "useNull": true
        },
        {
            "name": "values",
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'product',
            type: 'auto',
            persist:false
        }
    ],

    idProperty: "attributeFQN"
   
});