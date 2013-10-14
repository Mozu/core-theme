/**
 * @class Taco.model.Location
 */
Ext.define('Taco.model.Location', {
    extend: 'Taco.core.data.Model',
    fields: [

    
        //LocationType - only one - association
    {
        "name": "locationTypeName",
        "type": "string"
    },
        
    {
        "name": "locationTypeId",
        "type": "int"
    },
        
        //FulfillmentType - one or more - association
    {
        "name": "fulfillmentTypeName",
        "type": "string"
    },
        
    {
        "name": "fulfillmentTypeId",
        "type": "auto"
    },
        

    {
        "name": "id",
        "type": "string",
        "useNull": true
    }, {
        "name": "isDeleted",
        "type": "boolean"
    },


    {
        "name": "name",
        "type": "string",
        "useNull": true
    }, {
        "name": "description",
        "type": "string",
        "useNull": true
    },


    // GEO fields
    {
        "name": "address",   // note this should be and address object (standard hopefully)
        "type": "auto"
    },{
        "name": "latitude",
        "type": "string",
        "useNull": true
    },{
        "name": "longitude",
        "type": "string",
        "useNull": true
    },

    // really should be an array of phone numbers. We need to standardize this (types: phone, fax, toll free, etc)
    {
        "name": "phone",
        "type": "string"
    }, {
        "name": "fax",
        "type": "string"
    },

    
    {
        "name": "notes",
        "type": "string"
    }, {
        "name": "supportsInventory",
        "type": "boolean"
    }, {
        "name": "supportsInStorePickup",
        "type": "boolean"
    }, {
        "name": "hours",
        "type": "object",
        "defaultValue": {
            timeZone: {
                
            },
            sunday: {
                
            },
            monday: {
                
            },
            tuesday: {
                
            },
            wednesday: {
                
            },
            thursday: {
                
            },
            friday: {
                
            },
            saturday: {
                
            }
        }
    }




    ],
    proxy: {
        type: 'ajaxproxy',
        
        api: {
            //read: '/admin/app/location/list',
            read: '/admin/Scripts/app/mocks/locations.json',
            create: '/admin/app/location/create',
            update: '/admin/app/location/edit',
            destroy: '/admin/location/delete'
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
    },
    

    // fulfillmentTypes are hard coded in the backend services.
    getFulfillmentTypes : function() {
        return [
            {
                "name": "InStore Pickup",
                "code": "inStorePickup",
                "shippingRequired": false,
                "id": 1
            },
            {
                "name": "Direct Ship",
                "code": "directShip",
                "shippingRequired": true,
                "id": 2
            }
        ];
    }

});