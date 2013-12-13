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
            "type": "auto"
        },

        // put the data from the locationInventory here
        {
            "name": "locationInventory",
            "type": "auto"
        }
    ],
    proxy: {
        type: 'ajaxproxy',

        api: {
            read: '/admin/app/locaitoninventory/pickup'
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
