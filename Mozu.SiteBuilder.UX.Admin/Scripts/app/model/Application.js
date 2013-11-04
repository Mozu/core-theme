/**
 * @class Taco.model.Application
 */
Ext.define('Taco.model.Application', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.data.Model'
    ],
    idProperty:"id",
    fields: [
        
        /*
            "id": "id here",
			"capabilityTypeId": "AddressValidator",
			"capabilityTypeName": "Address Validator",
			"applicationName": "Mozu AvaTax Connector",
			"publisher": "Volusion",
			"enabled": false,
			"licenseType": "Perpetual",
			"siteId": "siteId",
			"siteName": "siteName",
			"coverageArea": "US, CA",
			"effectiveStartDate": "2013-10-31T14:55:46.4007",
			"effectiveEndDate": "2113-10-31T19:55:46.5257",
            */

        {
            "name": "id",
            "type": "string"
        }, {
            "name": "capabilityTypeId",
            "type": "string"
        }, {
            "name": "capabilityTypeName",
            "type": "string"
        }, {
            "name": "applicationName",
            "type": "string"
        }, {
            "name": "publisherName",
            "type": "string"
        }, {
            "name": "initialized",
            "type": "boolean"
        }, {
            "name": "enabled",
            "type": "boolean"
        }, {
            "name": "licenseType",
            "type": "string"
        }, {
            "name": "siteId",
            "type": "string"
        }, {
            "name": "siteName",
            "type": "string"
        }, {
            "name": "coverageArea",
            "type": "string"
        }, {
            "name": "effectiveStartDate",
            "type": "string"
        }, {
            "name": "effectiveEndDate",
            "type": "string"
        }
    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/app/application/list',
            read: '/admin/Scripts/app/mocks/applications.json',
            create: '/admin/app/application/create',
            update: '/admin/app/application/edit',
            destroy: '/admin/app/application/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
    
});
