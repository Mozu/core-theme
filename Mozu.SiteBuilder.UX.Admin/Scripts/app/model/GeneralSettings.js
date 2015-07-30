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
        { "name": "adjustForDaylightSavingTime", "type": "boolean", "useNull": true },
        { "name": "favIconMobilePath", "type": "string", "useNull": true },
        { "name": "favIconPath", "type": "string", "useNull": true },
        { "name": "isGoogleAnalyticsEcommerceEnabled", "type": "boolean", "useNull": true },
        { "name": "isGoogleAnalyticsEnabled", "type": "boolean", "useNull": true },
        { "name": "googleAnalyticsCode", "type": "string", "useNull": true },
        { "name": "logoPath", "type": "string", "useNull": true },
        { "name": "logoText", "type": "string", "useNull": true },
        { "name": "replyToEmailAddress", "type": "string", "useNull": true },
        { "name": "senderEmailAddress", "type": "string", "useNull": true },
        { "name": "senderEmailAlias", "type": "string", "useNull": true },
        { "name": "isAddressValidationEnabled", "type": "boolean", "useNull": true },
        { "name": "allowInvalidAddresses", "type": "boolean", "useNull": true },
        { "name": "isWishlistCreationEnabled", "type": "boolean", "useNull": true },
        { "name": "customCdnHostName", "type": "string", "useNull": true },
        { "name": "cdnCacheBustKey", "type": "string", "useNull": true },
        // customer experience template
        { "name": "templateSiteId", "type": "integer", "useNull": true },
        { "name": "siteTimeFormat", "type": "string", "useNull": true },
        { "name": "siteTimeZone", "type": "string", "useNull": true },
        { "name": "websiteName", "type": "string", "useNull": true }, 

        //viewToggle
        { "name": "isRequiredLoginForLiveEnabled", "type": "boolean", "useNull": true },
        { "name": "isRequiredLoginForStagingEnabled", "type": "boolean", "useNull": true }, 

        // new fields not in Json
        { "name": "channelId", "type": "string" },
        { "name": "catalogId", 
          "type": "string" ,
            convert: function (value, record) {
                if (!Taco.app.context.getSite()) return '';
                return Taco.app.context.getSite().catalogId;
            }
        },
        {
            "name": "catalogName",
            "type": "string",
            convert: function (value,record) {
                if (!Taco.app.context.getSite()) return '';
                return Taco.app.context.findCatalog(Taco.app.context.getSite().catalogId).name;
            }
        },
        {
            "name": "isMozuWebSite", "type": "boolean",
            convert: function (value, record) {
                if (!Taco.app.context.getSite()) return '';
                return Taco.app.context.getSite().isMozuRendered;
            }
        },
        
        // not in json robots.js
        // todo: need to get this implemnted in the service or remove from the client pending service implementation;
        
        { "name": "robotsOverride", "type": "text"},
        { "name": "robotsOverrideEnabled", "type": "boolean"},

        { name: 'supressedEmailTransactions', type: 'auto', defaultValue: {} }
        
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
