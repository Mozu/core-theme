/**
 * @class Taco.model.OptionValue
 * @author Jason Cochran
 * The OptionValue model
 */

Ext.define('Taco.model.OptionValue', {
    extend: 'Taco.core.data.Model',
    
    fields:
      [
       {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "sequence",
            "type": "int",
            "useNull": true
        },
        {
            "name": "value",
            "type": "string",
            "useNull": true
        },
        {
            "name": "internalValue",
            "type": "string",
            "useNull": true
        },
        {
            "name": "option_id",
            "type": "int",
            "useNull": true
        },
        // TODO: Review with Thom (not needed to post back to server)
        {
            "name": "placeholder",
            "type": "string",
            "useNull": true,
            "defaultValue": "Example: &quot;Medium&quot;"
        }
    ],

    belongsTo: 'Taco.model.Option',
    idProperty: 'id',
    //    hasMany: {
    //        model: 'CategoryTreeNode',
    //        name: 'items'
    //    },
    validations: [
        { type: 'length', name: 'value', min: 1 }
    ],

    proxy: {
        type: 'ajax',
        api: {
            //read: '/Scripts/Taco/mocks/categories.json',
            read: '/admin/app/Options/listValue',
            create: '/admin/app/Options/createValue',
            update: '/admin/app/Options/editValue',
            destroy: '/admin/app/Options/deleteValue'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});