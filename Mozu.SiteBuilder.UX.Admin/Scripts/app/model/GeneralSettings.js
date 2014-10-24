/**
 * @class Taco.model.GeneralSettings
 */
Ext.define('Taco.model.GeneralSettings', {
    extend: 'Taco.core.data.Model',
    //requiredStores: [
    //    'Taco.store.TimeZones',
    //    'Taco.store.Channels'
    //],
    behaviors: {
        read: 186,
        create: 183,
        update: 184,
        destroy: 185
    },
    
    fields: [
        { "name": "allowAllIps", "type": "boolean", "useNull": true },
        { "name": "daylightSaving", "type": "boolean", "useNull": true },
        { "name": "favIconMobilePath", "type": "string", "useNull": true },
        { "name": "favIconPath", "type": "string", "useNull": true },
        { "name": "googleAnalyticsEcomEnabled", "type": "boolean", "useNull": true },
        { "name": "googleAnalyticsEnabled", "type": "boolean", "useNull": true },
        { "name": "googleAnalyticsId", "type": "string", "useNull": true },
        { "name": "logoPath", "type": "string", "useNull": true },
        { "name": "logoText", "type": "string", "useNull": true },
        { "name": "replyToEmail", "type": "string", "useNull": true },
        { "name": "senderEmail", "type": "string", "useNull": true },
        { "name": "senderEmailName", "type": "string", "useNull": true },
        { "name": "isAddressValidationEnabled", "type": "boolean", "useNull": true },
        { "name": "allowInvalidAddresses", "type": "boolean", "useNull": true },
        { "name": "isWishlistCreationEnabled", "type": "boolean", "useNull": true },
        // customer experience template
        { "name": "templateSiteId", "type": "integer", "useNull": true },
        { "name": "timeFormat", "type": "string", "useNull": true },
        { "name": "timeZone", "type": "string", "useNull": true },
        { "name": "websiteName", "type": "string", "useNull": true },        


        // new fields not in Json
        { "name": "channelId", "type": "string" },
        {   "name": "catalogId", 
            "type": "string" ,
            convert: function (value, record) {
                return Taco.app.context.getSite().catalogId;
            }
        },
        {
            "name": "catalogName",
            "type": "string",
            convert: function (value,record) {
                return Taco.app.context.findCatalog(Taco.app.context.getSite().catalogId).name;
            }
        },
        {
            "name": "isMozuWebSite", "type": "boolean",
            convert: function (value, record) {
                return Taco.app.context.getSite().isMozuRendered;
            }
        },
        
        // not in json robots.js
        // todo: need to get this implemnted in the service or remove from the client pending service implementation;
        
        { "name": "robotsOverride", "type": "text"},
        { "name": "robotsOverrideEnabled", "type": "boolean"}
        
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/GeneralSetting/read',
            update: '/admin/app/GeneralSetting/save'
            
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});
