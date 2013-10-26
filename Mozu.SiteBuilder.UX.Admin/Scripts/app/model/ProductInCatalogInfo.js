/**
* @class Taco.model.ProductInCatalogInfo
* @author James Zetlen
* This model indicates a Product membership in a Site, and contains any overrides to the Product defaults.
*/

Ext.define('Taco.model.ProductInCatalogInfo', {
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
            "name": "catalogId",
            "type": "int"
        },
        {
            "name": "catalog",
            "type": "auto",
            persist: false,
            convert: function (value, record) {
                if (record.site == null) {
                    var catalogId = record.get('catalogId');
                    record.catalog = Taco.app.context.findCatalog(catalogId);
                }
                return record.catalog;

            }
        },
    {
        name: "sites",
        "type": "auto",
        persist: false,
        convert: function (value, record) {
            if (record.site == null) {
                var catalogId = record.get('catalogId');
                
                record.sites = Taco.app.context.findSitesByCatalog(catalogId);
            }
            return record.sites;

        }
       
    },
        {
            "name": "categoryIds",
            "type": "auto",
            "useNull": true,
            defaultValue: []
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
            "name": "isSEOContentOverridden",
            "type": "boolean",
            "useNull": false,
            defaultValue: false
        }

    ],
    
    idProperty: "catalogId",
    getCategoryStore: function () {
        var me = this;
        if (me.categoryStore == null) {
            me.categoryStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.Categories',
                    createOnly: true,
                    id: this.id,
                    autoLoad :true,
                    filters: function(record) {
                        return (me.get('categoryIds') || []).indexOf(record.getId()) > -1;
                    }
                });
            
        
            me.categoryStore.filter([
            {
                filterFn: function (record) {
                    return (me.get('categoryIds') || []).indexOf(record.getId()) > -1;
                }
            }]);

        }
        return me.categoryStore;
    
    },
    
    getUnfilteredCategoryStore: function () {
        var me = this, siteId = this.getId();
        if (me.categoryStoreUnfiltered == null) {
            me.categoryStoreUnfiltered = Ext.create('Taco.store.Categories', {
               siteId:siteId 
            });
            me.categoryStoreUnfiltered.load();
        }
        return me.categoryStoreUnfiltered;

    },
    
    set: function (fieldName, newValue) {
        if (fieldName == 'categoryIds') {
            console.log(newValue);
        }
        this.callParent([fieldName, newValue]);
    },
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

     
      
        //{ type: 'presence', name: 'productCode' },
       // { type: 'length', name: 'productCode', min: 3, max: 30 },
        { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-]*$/ }
    ],

    
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/ProductInCatalogInfo/list',
            create: '/admin/app/ProductInCatalogInfo/create',
            update: '/admin/app/ProductInCatalogInfo/edit',
            destroy: '/admin/app/ProductInCatalogInfo/delete',
            duplicate: '/admin/app/ProductInCatalogInfo/duplicate'
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