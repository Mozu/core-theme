/**
 * @class Taco.model.Location
 */
Ext.define('Taco.model.Location', {
    extend: 'Taco.core.data.Model',
    idProperty: "code",
    fields: [
        {
            "name": "code", 
            "type": "string",
            "useNull": true
        }, {
            "name": "locationTypes",
            "type": "auto",
            "default": []
        },

        // helper field that converts the persisted value to array of strings for use in combobox
        {
            "name": "locationTypeIds",
            "type": "auto",
            "convert": function (value, record) {
                
                var types = record.get("locationTypes") || [];
                var data = [];
                Ext.Array.each(types, function(rec) {
                    data.push(rec.code);
                });
                return data;
            }
        }, {
            "name": "fulfillmentTypes",
            "type": "auto",
            "default": []
        },
        
        // helper field that converts the persisted value to array of strings for use in combobox
        {
            "name": "fulfillmentTypeIds",
            "type": "auto",
            "convert": function (value, record) {
                
                var type = record.get("fulfillmentTypes") || [];
                var data = [];
                Ext.Array.each(type, function(rec) {
                    data.push(rec.code);
                });
                return data;
            }
        }, {
            "name": "isDeleted", // this is tbd
            "type": "boolean"
        }, {
            "name": "name",
            "type": "string",
            "useNull": true
        }, {
            "name": "description",
            "type": "string",
            "useNull": true
        }, {
            "name": "address",
            "type": "auto",
            "defaultValue": {
                "address1": "",
				"address2": "",
				"address3": "",
				"address4": "",
				"cityOrTown": "",
				"state": "",
				"countryCode": "",
				"zipCode": "",				
				"addressType": {}, // tbd. not sure what this is. Roeder said he would back to me on this.				
				"addressIsValidated": false
            }
        },
        // note this is a string version of the structured address object used for display in the grid;
        {
            "name": "addressToString",   
            "type": "string",
            "convert": function (val, record) {
                var str = Ext.create('Ext.XTemplate',
                    '{address1} ',
                    '{address2} ',
                    '{address3} ',
                    '{address4} ',
                    '{cityOrTown}, {state} {zipCode}',
                    '{countryCode}'
                ).apply(record.get('address'));
                return str;
            }
        }, {
            "name": "geo",
            "type": "auto",
            "defaultValue": {
                lat: null,
                lng:null
            }
        }, {
            "name": "phone",
            "type": "string"
        }, {
            "name": "fax",
            "type": "string"
        }, {
            "name": "notes",
            "type": "string"
        }, {
            "name": "supportsInventory",
            "type": "boolean"
        }, {
            "name": "hours",
            "type": "object",
            "defaultValue": {
                sunday: {
                    "label": ""
                },
                monday: {
                    "label": ""
                },
                tuesday: {
                    "label": ""
                },
                wednesday: {
                    "label": ""
                },
                thursday: {
                    "label": ""
                },
                friday: {
                    "label": ""
                },
                saturday: {
                    "label": ""
                }
            }
        }, {
            name: "tags",
            type: "auto",
            defaultValue: []
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        
        api: {
            read: '/admin/app/location/list',
            // read: '/admin/Scripts/app/mocks/locations.json',
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
    /**
    * service call to get geo location information for an address
    * @param {Object} config  A configuration object
    * config object:
    * 
            {
                jsonData: {
                    address: {
                        see address object defined above
                    }
                },
                success: function (response) {
                    // success handling here                    
                },
                failure: function (response) {
                    // error handling here
                },
                scope: this
            }

    *
    */
    getGeo: function(config) {
        Ext.apply(config, {
            url: '/admin/app/location/getGeo',
            method: "POST",
            errorMsg: "Error getting geo locations"
        });
        
        this.addErrorHandling(config);
        
        Ext.Ajax.request(config);
    },
    
    // fulfillmentTypes are hard coded in the backend services.
    getFulfillmentTypes : function() {
        return [
            {
                "name": "In Store Pickup",
                "code": "SP",
                "shippingRequired": false
            }, {
                "name": "Direct Ship",
                "code": "DS",
                "shippingRequired": true
            }
        ];
    }
});