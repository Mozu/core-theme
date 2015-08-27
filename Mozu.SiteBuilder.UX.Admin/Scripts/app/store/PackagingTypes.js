/**
 * @class Taco.store.PackagingTypes
 * @author Simeon Kessler
 * List of packaging types.
 */

Ext.define('Taco.store.PackagingTypes', {
    //extend:"Ext.data.JsonStore",
    extend: 'Ext.data.Store',
    fields: ["text", "packagingType"],
    autoLoad:true,
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            idProperty: "packagingType",
            root: 'items'
        }
    },
    data: {
        items: [
            {
                text: "Tube",
                packagingType: "TUBE"
            }, {
                text: "Letter",
                packagingType: "LETTER"
            }, {
                text: "Pak",
                packagingType: "PAK"
            }, {
                text: "Small carrier box",
                packagingType: "CARRIER_BOX_SMALL"
            }, {
                text: "Medium carrier box",
                packagingType: "CARRIER_BOX_MEDIUM"
            }, {
                text: "Large carrier box",
                packagingType: "CARRIER_BOX_LARGE"
            }, {
                text: "Custom",
                packagingType: "CUSTOM"
            }
        ]
    }
});