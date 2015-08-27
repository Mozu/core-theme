/**
 * @class Taco.model.LocationPickup
 * A fulfillment location. originally meant to represent a pickup location. Refactored to represent a pickup or a direct ship location.
 * The proxy can return pickup locations, direct ship locations, or both by setting the extraparam "type"
 */

// todo: rename this after the merge;

Ext.define('Taco.model.LocationPickup', {
    extend: 'Taco.core.data.Model',
    idProperty: "fulfillmentId",

    /*
    behaviors: {
        read: 186,
        create: 183,
        update: 184,
        destroy: 185
    },
    */

    fields: [
        // combines the fulfillmentMethod and locationCode to allow for unique identification of a location and fulfillment type. this is to support situation where a location is both direct ship and pickup

        {
            name: "fulfillment",
            type: "object"
        },



        // Ship or Pickup
        {
            name: "fulfillmentMethodCode",
            convert:function (value, record){
                return record.get("fulfillment").code
            }            
        },

        {
        // todo: move to service - Greg Murray on 2014-06-04    
            name: "fulfillmentMethod",
            convert: function (value, record) {
                var fulfillCode = record.get("fulfillment").code;
                if (fulfillCode === "SP") return "Pickup";
                if (fulfillCode === "DS") return "Ship";
                return "Digital";
            }
        },


        {
            name: "fulfillmentId",
            type: "string",
            convert: function (value, record) {
                return record.get("fulfillmentMethod") + "_" + record.get("locationCode");
            }
        },


        {
            name: "locationCode",  
            type: "string"
        },
        
        // The full data object for a location
        {
            "name": "location",
            "type": "auto"
        },

        // put the data from the locationInventory here
        /*
        deprecated;
        {
            "name": "locationInventory",
            "type": "auto"
        },
        */
        
        
        {
            "name": "auditInfo",
            "type": "auto"
        },
        

        {
            "name": "productName",
            "type": "string"
        },
        
        {
            "name": "productCode",
            "type": "string"
        },
        
        {
            "name": "stockAvailable",
            "type": "int"
        },
        {
            "name": "stockOnBackOrder",
            "type": "int"
        },
        {
            "name": "stockOnHand",
            "type": "int"
        }
    ],
    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/locationinventory/forproduct'

            // this still works. this is the older end point
            //read: '/admin/app/locationinventory/pickup'
            
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            //allowSingle: true,
            type: 'json'
        }
    }
});
