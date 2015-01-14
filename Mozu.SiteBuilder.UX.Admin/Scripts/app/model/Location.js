/**
 * @class Taco.model.Location
 */
Ext.define('Taco.model.Location', {
    extend: 'Taco.core.data.Model',
    idProperty: "code",
    behaviors: {
        read: 186,
        create: 183,
        update: 184,
        destroy: 185
    },

    fields: [
        {
            "name": "code",
            "type": "string",
            "useNull": true
        }, {
            "name": "locationTypes",
            "type": "auto",
            "defaultValue": []
        },
        // helper field that converts the persisted value to array of strings for use in combobox
        {
            "name": "locationTypeIds",
            "type": "auto",
            persist: false,
            "convert": function (value, record) {

                var types = record.get("locationTypes") || [];
                var data = [];
                Ext.Array.each(types, function (rec) {
                    data.push(rec.code);
                });
                return data;
            }
        }, {
            "name": "fulfillmentTypes",
            "type": "auto",
            "defaultValue": []
        },
        {
            "name": "shippingOriginContact",
            type: 'auto',
            defaultValue: {}
        },         
        // helper field that converts the persisted value to array of strings for use in combobox
        {
            "name": "fulfillmentTypeIds",
            "type": "auto",
            persist: false,
            "convert": function (value, record) {

                var type = record.get("fulfillmentTypes") || [];
                var data = [];
                Ext.Array.each(type, function (rec) {
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
                "stateOrProvince": "",
                "countryCode": "",
                "postalOrZipCode": "",
                "addressType": "Commercial",
                "addressIsValidated": false
            }
        },
        // note this is a string version of the structured address object used for display in the grid;
        {
            "name": "addressToString",
            "type": "string",
            persist: false,
            "convert": function (val, record) {
                var str = Ext.create('Ext.XTemplate',
                    '{address1} ',
                    '{address2} ',
                    '{address3} ',
                    '{address4} ',
                    '<tpl if="cityOrTown">{cityOrTown}, </tpl>',
                    '{stateOrProvince} {postalOrZipCode} {countryCode}'
                ).apply(record.get('address'));
                return str;
            }
        }, {
            "name": "geo",
            "type": "auto",
            "defaultValue": {
                lat: null,
                lng: null
            }
        }, {
            "name": "phone",
            "type": "string"
        }, {
            "name": "fax",
            "type": "string"
        }, {
            "name": "note",
            "type": "string"
        }, {
            "name": "supportsInventory",
            "type": "boolean"
        }, {
            "name": "regularHours",
            "type": "object",
            convert: function (val, record) {
                // if value is null;
                // check for null of malfomred data structures; this is temporary fix until the service returns correct data
                if (val && val.monday) {
                    return val;
                } else {
                    return this.defaultValue;
                }
            },
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
        },
          {
              "name": "auditInfo",
              "type": "auto",
              "useNull": true,
              "persist": false
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
    getGeo: function (config) {
        Ext.apply(config, {
            url: '/admin/app/location/getGeo',
            method: "POST",
            errorMsg: "Error getting geo locations"
        });

        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },
    
    beforeDuplicate: function () {
        var suffix = " - copy";

        this.raw = undefined
        this.set("code", "");
        this.data.name = this.data.name + suffix;

        this.commit();
    },

    // fulfillmentTypes are hard coded in the backend services.
    getFulfillmentTypes: function () {
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