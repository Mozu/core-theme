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

    /*

    convert: function (v, r) {

        if (r.data.dataType == 'DateTime') {
            return r.convertDate(v);
        }
        if (r.data.dataType == 'Bool') {
            return r.convertBool(v);
        }
        if (r.data.dataType == 'Number') {
            return r.convertNumber(v);
        }

        return v;
    },
    convertBool: function (v) {
        if ((v === undefined || v === null || v === '')) {
            return null;
        }
        return v === true || v === 'true' || v == 1;
    },
    convertDate: function (v) {
        if (!v) {
            return null;
        }
        if (Ext.isDate(v)) {
            return v;
        }
        return Ext.Date.parse(v, 'c');

    },
    convertNumber: function (v) {
        return v !== undefined && v !== null && v !== '' ?
            parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : null;
    },

    */
    idProperty: "attributeFQN"
   
});