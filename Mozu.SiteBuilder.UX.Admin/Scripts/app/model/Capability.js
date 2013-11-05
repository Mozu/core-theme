/**
 * @class Taco.model.Application
 */
Ext.define('Taco.model.Capability', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.data.Model'
    ],
    idProperty: "id",
    fields: [        
        /*

        id: "431e811790614f3e8a4ca26800f2fd94*AddressValidator",
appId: "431e811790614f3e8a4ca26800f2fd94",
uiConfigurationUrl: "http://www.MyConfig.com",
capabilityType: "AddressValidator",
capabilityMode: "SinglePerSitePerShoppingCountry",
scopeType: "Site",
scopeId: 7332,
initialized: false,
enabled: false,
entitlementId: 0,
entitlementApplicationVersionId: 0,
applicationName: "tbd",
licenseType: "blurg",
developerAccountName: "tbd",
effectivesStartDate: "2013-10-05T13:54:24.2807086-05:00",
effectiveEndDate: "2015-11-04T13:54:24.2807086-06:00"


       */
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
        { name: "effectiveEndDate", type: "date" }
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