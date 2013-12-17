/**
 * @class Taco.model.LocationPickup
 */
Ext.define('Taco.model.LocationPickup', {
    extend: 'Taco.core.data.Model',
    idProperty: "code",

    /*
    behaviors: {
        read: 186,
        create: 183,
        update: 184,
        destroy: 185
    },
    */

    fields: [
        {
            name: "code",  // this will be the locationCode
            type: "string"
        },
        
        // put the data from the location here
        {
            "name": "location",
            "type": "auto",
            "defaultValue": {
                name: "name here",
                description: "description here",
                code: "code here",
                phoneNumber: "555 555 5555",
                shippingOriginContact: "Shipping contact",
                "address": {
                    "address1": "asdf 1",
                    "address2": "asdf 2",
                    "address3": "asdf 3",
                    "address4": "asdf 4",
                    "cityOrTown": "austin",
                    "stateOrProvince": "tx",
                    "countryCode": "us",
                    "postalOrZipCode": "78731",
                    "addressType": {},
                    "addressIsValidated": false
                }
            }
        },

        // put the data from the locationInventory here
        {
            "name": "locationInventory",
            "type": "auto",
            "defaultValue": {
                stockAvailable: 100,
                stockReserved: 2,
                stockOnHand: 98
            }
        }
    ],
    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/Scripts/app/mocks/locationPickup.json'
            //read: '/admin/app/locationPickup/list'
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