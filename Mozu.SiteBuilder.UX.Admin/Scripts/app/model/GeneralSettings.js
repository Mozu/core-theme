/**
 * @class Taco.model.GeneralSettings
 */
Ext.define('Taco.model.GeneralSettings', {
    extend: 'Taco.core.data.Model',
    fields: [
        { "name": "websiteName", "type": "string", "useNull": true },
        { "name": "timeZone", "type": "string", "useNull": true },
        { "name": "timeFormat", "type": "string", "useNull": true },
        { "name": "daylightSaving", "type": "boolean", "useNull": true },
        { "name": "allowAllIps", "type": "boolean", "useNull": true },
        { "name": "ipRanges", "type": "auto", "useNull": true },
        { "name": "senderEmail", "type": "string", "useNull": true },
        { "name": "senderEmailName", "type": "string", "useNull": true },
        { "name": "replyToEmail", "type": "string", "useNull": true },
        { "name": "theme", "type": "string", "useNull": true },
        { "name": "logoPath", "type": "string", "useNull": true },
        { "name": "logoText", "type": "string", "useNull": true },
        { "name": "favIconMobilePath", "type": "string", "useNull": true },
        { "name": "favIconPath", "type": "string", "useNull": true },
        { "name": "googleAnalyticsId", "type": "string", "useNull": true },
        { "name": "googleAnalyticsEnabled", "type": "boolean", "useNull": true },
        { "name": "googleAnalyticsEcomEnabled", "type": "boolean", "useNull": true }
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
