/**
* @class Taco.model.ProductInSiteInfo
* @author James Zetlen
* This model indicates a Product membership in a Site, and contains any overrides to the Product defaults.
*/

Ext.define('Taco.model.ProductInSiteInfo', {
    extend: 'Taco.core.data.Model',
    //requires:['Taco.model.Product'],
    fields:
    [
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productShortDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isActive",
            "type": "boolean",
            "defaultValue":true,
            "useNull": true
        },
        {
            "name": "product",
            "type": "auto",
            "persist": false
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": false
        },
        {
            "name": "metaTagDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaTagKeywords",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaTagTitle",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productFullDescription",
            "type": "string",
            "useNull": true
        },

        // TODO: Come back and figure out image association
        {
            "name": "productImages",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "seoFriendlyUrl",
            "type": "string",
            "useNull": true
        },
        {
            "name": "listPrice",
            "type": "float",
            "useNull": true
        },
        {
            "name": "price",
            "type": "float",
            "useNull": true
        },
        {
            "name": "salePrice",
            "type": "float",
            "useNull": true
        },
        {
            "name": "siteId",
            "type": "int"
        },
        {
            "name": "categoryIds",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "isContentOverridden",
            "type": "boolean",
            "useNull": false,
            defaultValue: false
        },
        {
            "name": "isPriceOverridden",
            "type": "boolean",
            "useNull": false,
            defaultValue: false
        },
        {
            "name": "isSeoOverridden",
            "type": "boolean",
            "useNull": false,
            defaultValue: false
        }
    ],
    idProperty: "siteId",
    //,
    //associations: [
    //    {
    //        "type": "belongsTo",
    //        "model": "Taco.model.Product",
    //        "getterName": "getProduct",
    //        "setterName": "setProduct",
    //        "foreignKey": "productCode"
    //    }
    //],

    validations: [

     
      
        { type: 'presence', name: 'productCode' },
        { type: 'length', name: 'productCode', min: 3, max: 30 },
        { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-]*$/ }
    ],

    
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/ProductInSiteInfo/list',
            create: '/admin/app/ProductInSiteInfo/create',
            update: '/admin/app/ProductInSiteInfo/edit',
            destroy: '/admin/app/ProductInSiteInfo/delete',
            duplicate: '/admin/app/ProductInSiteInfo/duplicate'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});