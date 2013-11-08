/**
 * @class Taco.model.Capability
 */
Ext.define('Taco.model.Capability', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.data.Model'
    ],
    idProperty: "id",
    fields: [        
        {
            "name": "id",
            "type": "string"
        },
        {
            "name": "appId",
            "type": "string"
        }, {
            "name": "uiConfigurationUrl",
            "type": "string"
        },
    {
        name: 'uiSupportUrl',
        defaultValue:'http://google.com/?k=thoms a jar of pickles'
    },
        {
            "name": "capabilityType",
            "type": "string"
        },
        {
            "name": "capabilityName",
            "type": "string",
            convert: function(val, record) {
                var id = record.get('capabilityType').match(/[A-Z][a-z]+/g);
                if (id) {
                    var name = id[0];
                    for (var x = 1; x < id.length; x++) {
                        name = name + ' ' + id[x];
                    }
                    return name;
                }
                return id;
            }
        },
        {
            "name": "capabilityMode", 
            "type": "string"
        },
        { name: "scopeType", type: "string" },
        { name: "initialized", type: "boolean" },
        { name: "enabled", type: "boolean" },
        { name: "applicationName", type: "string" },
        { name: "licenseType", type: "string" },
        { name: "developerAccountName", type: "string" },
        { name: "effectivesStartDate", type: "date" },
        { name: "effectiveEndDate", type: "date" },
    
        { name: 'supportedShoppingCountries', type: 'auto', defaultValue:[],persist :false },
        { name: 'activeShoppingCountries', type: 'auto' }
       
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/capabilities/list',
            update: '/admin/app/capabilities/edit',
            
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }    
});