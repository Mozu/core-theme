/**
* @class Taco.model.Product
* @author Jason Cochran
* The Product model
*/

Ext.define('Taco.model.Product', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.ProductOption', 'Taco.model.ProductProperty', 'Taco.model.ProductExtra', 'Taco.model.ProductVariation','Ext.data.association.HasMany', 'Taco.model.ProductInSiteInfo'],
    "fields":
  [
    {
        "name": "createBy",
        "type": "string",
        "useNull": true
    },
  {
      name: "productTypeId",
      type: "int",
      useNull : true
  },
    {
        "name": "createDate",
        "type": "date",
        "useNull": true
    },
    {
        "name": "isBackOrderAllowed",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "isHiddenWhenOutOfStock",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "isRecurring",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "inventoryHandling",
        "type": "int"
    },
    {
        "name": "isTaxable",
        "type": "boolean",
        defaultValue:false,
        "useNull": true
    },
    {
        "name": "manageStock",
        "type": "boolean",
        defaultValue: false,
        "useNull": true
    },
    {
        "name": "siteGroupId",
        "type": "int",
        "useNull": false
    },
    {
        "name": "productCode",
        "type": "string",
        "useNull": true
    },
    {
        "name": "stockOnHand",
        "type": "int",
        "useNull": true
    },
    {
        "name": "stockOnHandAdjustment",
        "type": "auto",
        defaultValue: null,
        "useNull": true
    },
    {
        "name": "upc",
        "type": "int",
        "useNull": true
    },
    {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    },
    {
        "name": "updateDate",
        "type": "date",
        "useNull": true
    },
    {
        "name": "freeShipping",
        "type": "boolean",
        "useNull": true
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
    {
        "name": "productImages",
        "type": "auto",
        "useNull": true
    },
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
        "name": "packageWeight",
        "type": "float",
        "useNull": true
    },
    {
        "name": "packageLength",
        "type": "float",
        "useNull": true
    },
    {
        "name": "packageWidth",
        "type": "float",
        "useNull": true
    },
    {
        "name": "packageHeight",
        "type": "float",
        "useNull": true
    },
    {
        "name": "productInSites",
        "type": "auto",
        defaultValue:[]
    },
      {
          name: "properties",
          type: 'auto',
          defaultValue: []
      },
      {
          name: "extras",
          type: "auto",
          defaultValue: []
      }
    
  ],
    getContextualValue: function (fieldName) {
        var level=this, ctx = Taco.app.context.getCurrent();
        if (ctx.contextType == 's') {
            level = this.getProductInSites().getById(ctx.id);
            if (level == null) {
                Ext.Error.raise('missing site info for ctx ' + ctx.id + ' in product ' + this.getId());
                level = this;
            }
        }
        return level.get(fieldName);
    },
    getProductInSite: function () {
        var siteId = Taco.app.context.getSiteId();
        if (siteId) {
            return this.getProductInSites().getById(siteId);
            
        }
        return null;
    },
    getProperties: function() {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductProperty',
            associationKey: 'properties',
            foreignProperty: 'product'
        });
    },
    getExtras: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductExtra',
            associationKey: 'extras',
            foreignProperty: 'product'
        });
    },
    getProductInSites: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductInSiteInfo',
            associationKey: 'productInSites',
            foreignKey: 'productCode',
            foreignProperty: 'product'
        });
    },
    productInSitesStore:function() {
        return this.getProductInSites();
    },
    reloadProductInSitesStore: function() {
        this.getProductInSites().loadData(this.get('productInSites'));
    },
    idProperty: 'productCode',
    //hasMany: [
    //    {
    //        "model":'Taco.model.ProductInSiteInfo',
    //        "name": "productInSitesStore",
    //        "type": "Taco.model.ProductInSiteInfo",
    //        associationKey: 'productInSites'
    //        //,
    //        //"foreignKey": "productCode"
    //    }
    //],

    validations: [

        { type: 'length', name: 'productName', min: 3, max: 100 },
        { type: 'presence', name: 'productName' },
        { type: 'presence', name: 'productCode' },
        { type: 'length', name: 'productCode', min: 3, max: 30 },
        { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-]*$/ }
    ],

    
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Product/list',
            create: '/admin/app/Product/create',
            update: '/admin/app/Product/edit',
            destroy: '/admin/app/Product/delete'
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