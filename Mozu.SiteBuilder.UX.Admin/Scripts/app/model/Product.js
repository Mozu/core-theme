/**
* @class Taco.model.Product
* @author Jason Cochran
* The Product model
*/

Ext.define('Taco.model.Product', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.model.ProductOption',
        'Taco.model.ProductProperty',
        'Taco.model.ProductExtra',
        'Taco.model.ProductVariation',
        'Ext.data.association.HasMany',
        'Taco.model.ProductInCatalogInfo',
        'Taco.model.ProductVariation',
        'Taco.model.BundledProduct',
        'Taco.store.ProductTypes',
        'Taco.core.data.Model'
    ],
    statics: {
        publishBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/publish',
                jsonData: cfg.data
            }, cfg));
        },

        discardBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/discard',
                jsonData: cfg.data
            }, cfg));
        },

        publishAll: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/publishall'
            }, cfg));
        },

        discardAll: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/discardall'
            }, cfg));
        },

        doPublish: function (cfg) {
            var options = Ext.apply({}, {
                method: 'POST',
                success: function () {
                    Taco.core.data.StoreManager.markChanged('Taco.model.Product');
                    if (cfg.success) {
                        cfg.success.apply(cfg.scope || this, arguments);
                    }
                }
            }, cfg);
            Ext.Ajax.request(options);
        }
    },

    behaviors: {
        read: 4,
        create: 1,
        update: 2,
        destroy: 3
    },
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
            useNull: true
        },
        {
            name: "productTypeName",
            type:"string"
        },
        {
            name: 'productUsage',
            type: 'string',
            defaultValue: ""
        },
        {
            name: "publishedState",
            type: "string",
            useNull: true
        }, {
            name: "publishSetCode",
            type: "string",
            useNull: false
            // convert: function (v) {
            //     // return Taco.core.data.Model.nullIfEmpty(v);
            // },
            // serialize: function (v) {
            //     return Taco.core.data.Model.nullIfEmpty(v);
            // }
        }, {
            name: "publishSetDate",
            type: "date",
            useNull: true,
            dateFormat: 'c',
            persist: false
        }, {
            name: "publishSetName",
            type: "string",
            useNull: true,
            persist: false
        }, {
            name: 'variationOptions',
            type: 'auto',
            defaultValue: [],
            persist: false
        },
        {
            name: "lastModifiedBy",
            type: "string",
            useNull: true
        },
        {
            name: "lastModifiedDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            name: "lastPublishedBy",
            type: "string",
            useNull: true
        },
        {
            "name": "lastPublishedDate",
            "type": "date",
            "useNull": true,
            dateFormat: 'c'
        },
        {
            "name": "fulfillmentStatus",
            "type": "string",
            "useNull": true
        },
        {
            name: "lastModifiedByUser",
            type: "auto",
            convert: function (v, record) {
                if (record.raw) {
                    // look up user id in magical site users global object.
                    var id = record.raw.lastModifiedBy;
                    return Ext.Array.findBy(window.Taco.siteUsersRaw, function (u) { return u.id === id; });
                }
                return null;
            }
        },
        {
            name: "lastPublishedByUser",
            type: "auto",
            convert: function (v, record) {
                if (record.raw) {
                    // look up user id in magical site users global object.
                    var id = record.raw.lastPublishedBy;
                    return Ext.Array.findBy(window.Taco.siteUsersRaw, function (u) { return u.id === id; });
                }
                return null;
            }
        },
        {
            "name": "createDate",
            "type": "date",
            "useNull": true,
            dateFormat: 'c'
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
            "name": "outOfStockBehavior",
            "type": "string"
        },
        {
            "name": "isTaxable",
            "type": "boolean",
            defaultValue: true,
            "useNull": true
        },
        {
            "name": "manageStock",
            "type": "boolean",
            defaultValue: false,
            "useNull": true
        },
        {
            "name": "masterCatalog",
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
            name: "upc",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "freeShipping",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "metaDescription",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "metaKeywords",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "metaTitle",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "productFullDescription",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "productImages",
            "type": "auto",
            "useNull": true,
            convert: function (v) {
                if (!v) {
                    return [];
                }
                Ext.Array.forEach(v, function(img) {
                    img.alt = Ext.util.Format.htmlDecode(img.alt);
                });
                return v;
            },
            serialize: function (v) {
                if (!v) {
                    return [];
                }
                Ext.Array.forEach(v, function(img) {
                    img.alt = Ext.util.Format.htmlEncode(img.alt);
                });
                return v;
            }
        },
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productShortDescription",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "slug",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
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
            name: "msrp",
            type: "float",
            useNull: true
        },
        {
            name: "map",
            type: "float",
            useNull: true
        },
        {
            name: "mapStartDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            name: "mapEndDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            name: "creditValue",
            type: "float",
            useNull: true
        },
        {
            name: "mfgPartNumber",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "distPartNumber",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "costCurrencyCode",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "cost",
            type: "float",
            useNull: true
        },
        {
            name: "discountsRestricted",
            type: "boolean",
            useNull: true
        },
        {
            name: "discountsRestrictedStartDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            name: "discountsRestrictedEndDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            "name": "packageWeight",
            "type": "float",
            "defaultValue": 1
        },
        {
            "name": "packageLength",
            "type": "float",
            "defaultValue": 1
        },
        {
            "name": "packageWidth",
            "type": "float",
            "defaultValue": 1
        },
        {
            "name": "packageHeight",
            "type": "float",
            "defaultValue": 1
        },
        {
            name: "fulfillmentTypesSupported",
            type: "auto",
            defaultValue: ['DirectShip']
        },
        {
            "name": "productInCatalogs",
            "type": "auto",
            defaultValue: []
        },
        {
            name: "properties",
            type: 'auto',
            serialize: function (v, r) {
                // BUG 58777
                // need to format any property values that are dates so we can adjust for user timezone;
                // iterate each property looking for date values and serialize them with timezone offset;
                for (var i = 0; i < v.length;i++) {
                    var property = v[i];
                    var propertyValues = property.values;
                    for (var j = 0; j < propertyValues.length;j++) {
                        var value = propertyValues[j];
                        if (Ext.isDate(value)) {
                            propertyValues[j] = Ext.Date.format(value, "c");
                        }
                    }
                }
                return v;
            },
            convert: function(v, r) {
                return v;
            },
            defaultValue: []
        },
        {
            name: "extras",
            type: "auto",
            defaultValue: []
        },
        {
            name: "options",
            type: "auto",
            defaultValue: []
        },
        {
            name: "crossSale",
            type: "auto",
            defaultValue: []
        },
        {
            name: "hasConfigurableOptions",
            type: "boolean"
        },
        {
            name: "hasStandaloneOptions",
            type: "boolean"
        },
        {
            name: "isConfigurable",
            type: 'boolean',
            convert: function (v, record) {
                return (record.get("hasConfigurableOptions") || record.get("hasStandaloneOptions"));
                //return (record.get("options").length || record.get("extras").length);
            }
        },
        {
            name: "bundledProducts",
            type: "auto",
            defaultValue: []
        },
        {
            name: "baseProductCode",
            type: "string",
            persist: false
        }, {
            name: 'masterCatalogId',
            type: 'int',
            useNull: true,
            persist: false
        }, {
            name: "isPackagedStandAlone",
            type: "boolean",
            defaultValue: false,
            persist: true
        }, {
            name: "standAlonePackageType",
            type: "string",
            defaultValue: "CUSTOM"
        }
        
    ],
    loadRuntimeProduct: function (cfg) {

        var me = this,
            options = Ext.apply({}, {
                url: '/admin/app/productruntime/read?productCode=' + this.getId(),
                success: function (response) {
                    var res = Ext.JSON.decode(response.responseText) || {};
                    if (cfg.callback) {
                        cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (cfg.success && res.success) {
                        cfg.success.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (!res.success && cfg.failure) {
                        cfg.failure.apply(cfg.scope || me, [res.items, response]);
                    }
                }
            }, cfg);
        Ext.Ajax.request(options);

    },
    formatCurrency: function (value) {
        return this.getMasterCatalog().formatCurrency(value);
    },
    getCurrencyCode: function () {
        return this.getMasterCatalog().currencyCode;
    },
    getMasterCatalog: function () {
        var mc = this.get('masterCatalogId');
        if (mc == null) {
            return Taco.app.context.getMasterCatalog();
        }
        return Taco.app.context.findMasterCatalog(mc);
    },
    publish: function (cfg) {

        var me = this,
            options = Ext.apply({}, {
                url: '/admin/app/catalogpublishing/publish',
                jsonData: [this.getId()],
                success: function (response) {
                    me.set('publishedState', 'Live');
                    Taco.core.data.StoreManager.markChanged('Taco.model.Product');
                    var res = Ext.JSON.decode(response.responseText) || {};
                    if (cfg.callback) {
                        cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (cfg.success && res.success) {
                        cfg.success.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (!res.success && cfg.failure) {
                        cfg.failure.apply(cfg.scope || me, [res.items, response]);
                    }
                }
            }, cfg);
        Ext.Ajax.request(options);

    },

    discardDraft: function (cfg) {

        var me = this,
            options = Ext.apply({}, {
                url: '/admin/app/catalogpublishing/discard',
                jsonData: [this.getId()],
                success: function (response) {
                    me.set('publishedState', 'Live');
                    Taco.core.data.StoreManager.markChanged('Taco.model.Product');
                    var res = Ext.JSON.decode(response.responseText) || {};

                    if (cfg.callback) {
                        cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (cfg.success && res.success) {
                        cfg.success.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (!res.success && cfg.failure) {
                        cfg.failure.apply(cfg.scope || me, [res.items, response]);
                    }
                }
            }, cfg);
        Ext.Ajax.request(options);

    },
    configureRuntimeProduct: function (cfg) {


        var me = this,
            options = Ext.apply(
            {
                method: 'POST',
                url: '/admin/app/productruntime/configure?productCode=' + this.getId(),
                success: function (response) {
                    var res = Ext.JSON.decode(response.responseText) || {};
                    if (cfg.callback) {
                        cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (cfg.success && res.success) {
                        cfg.success.apply(cfg.scope || me, [res.items, response]);
                    }
                    if (!res.success && cfg.failure) {
                        cfg.failure.apply(cfg.scope || me, [res.items, response]);
                    }

                }
            }, cfg);
        Ext.Ajax.request(options);
    },
    getContextualValue: function (fieldName, formatCurrency) {
        var level = this, ctx = Taco.app.context.getCurrent();
        if (ctx.contextType == 's') {

            level = this.getProductInCatalogs().getById(ctx.getCatalogId());
            if (level == null) {
                level = this;
            }
        } else if (ctx.contextType == 'c') {

            level = this.getProductInCatalogs().getById(ctx.id);
            if (level == null) {
                level = this;
            }
        }
        if (formatCurrency && level.get(fieldName) != null) {
            return level.formatCurrency(level.get(fieldName));
        }
        return level.get(fieldName);
    },
    getProductInSite: function () {
        var catalog = Taco.app.context.getCatalog();
        if (catalog) {
            return this.getProductInCatalogs().getById(catalog.catalogId);

        }
        return null;
    },
    getProductInCatalog: function () {
        var catalog = Taco.app.context.getCatalog();
        if (catalog) {
            return this.getProductInCatalogs().getById(catalog.getCatalogId());

        }
        return null;
    },
    getBundledProducts: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.BundledProduct',
            associationKey: 'bundledProducts',
            foreignProperty: 'product'
        });
    },

    getBundleItemTotals: function (bundledProducts) {
        var price = 0,
            salePrice = 0,
            bundleItems = bundledProducts || this.getBundledProducts();

        bundleItems.each(function (item) {
            price += item.data.price * item.data.quantity;

            if (item.data.salePrice !== null) {
                salePrice += item.data.salePrice * item.data.quantity;
            } else {
                // no sale price for this item, use the full price
                salePrice += item.data.price * item.data.quantity;
            }
        });

        return {
            price: price,
            salePrice: salePrice
        }
    },

    getProperties: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductProperty',
            associationKey: 'properties',
            foreignProperty: 'product'
        });
    },
    getOptions: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductProperty',
            associationKey: 'options',
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
    getProductInCatalogs: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductInCatalogInfo',
            associationKey: 'productInCatalogs',
            foreignKey: 'productCode',
            foreignProperty: 'product'
        });
    },
    productInCatalogsStore: function () {
        return this.getProductInCatalogs();
    },
    reloadProductInCatalogsStore: function () {
        this.getProductInCatalogs().loadData(this.get('productInCatalogs'));
    },

    getVariations: function (autoLoad) {
        var me = this,
            params,
            proxy;
        autoLoad = (autoLoad !== false);

        if (me.productVariationStore) {            
            return me.productVariationStore;
        }
        

        me.productVariationStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ProductVariation',
            autoLoad: false,
            pageSize: 1000,
            listeners:{
                beforeload: function (store, operation) {
                    
                    params.options = [];
                    me.getOptions().each(function (option) {
                        params.options.push({
                            attributeFQN: option.data.attributeFQN,
                            values: option.data.values
                        });
                    });
                    params.tempProductCode = me.tempProductCode;
                    params.productTypeId = me.get('productTypeId');
                    params.options = Ext.JSON.encode(params.options);

                    proxy = me.productVariationStore.getProxy();

                    if (!proxy.extraParams) {
                        proxy.extraParams = {};
                    }
                    
                    if (me.data.productCode) {
                        proxy.extraParams.productCode = me.data.productCode;
                    }

                    proxy.extraParams.tempProductCode = params.tempProductCode;
                    proxy.extraParams.productTypeId = params.productTypeId;
                    proxy.extraParams.options = params.options;
                    

                },
                scope: this
            }

            //,

            //loadFromOptions: function () {
                
            //    return;
                

            //    var beforeState =[];
            //    //if (me.productVariationStore && me.productVariationStore.data && me.productVariationStore.data.items) {
            //    //    beforeState = Ext.Array.pluck(me.productVariationStore.data.items, 'internalId')
            //    //}
            //    params.options = [];
            //    me.getOptions().each(function (option) {
            //        params.options.push({
            //            attributeFQN: option.data.attributeFQN,
            //            values: option.data.values
            //        });
            //    });
            //    params.tempProductCode = me.tempProductCode;
            //    params.productTypeId = me.get('productTypeId');
            //    params.options = Ext.JSON.encode(params.options);

                

            //    proxy = this.getProxy();

            //    if (!proxy.extraParams) {
            //        proxy.extraParams = {};
            //    }
                
            //    if (me.data.productCode) {                    
            //        proxy.extraParams.productCode = me.data.productCode;
            //    }
               
            //    proxy.extraParams.tempProductCode = params.tempProductCode;
            //    proxy.extraParams.productTypeId = params.productTypeId;
            //    proxy.extraParams.options = params.options;


            //    this.load({
            //        //params: params,                    
            //        callback: function (records, operation, success) {

            //            if (!success) {
            //                var error = operation.error;
            //                var json = Ext.decode(operation.error.responseText, true);
            //                var msg = json.message;
            //                Taco.app.fireEvent('setmessage', msg, 'error');
            //                return 
            //            }

                        

            //            //Ext.Array.each(records, function (newRecord) {                           

            //            //    // this whole section needs to go away.
            //            //    // if this is a new product, default the enabled option on for all new options
            //            //    if (me.phantom) {
            //            //        newRecord.set('isActive', true);
            //            //    } else {
            //            //        // only mark old values as active;
            //            //        if (Ext.Array.indexOf(beforeState, newRecord.internalId) == -1) {
            //            //            newRecord.set('isActive', true);
            //            //        }
            //            //    }
            //            //});
            //        }
            //    });
            //}
        });
        
        proxy = me.productVariationStore.getProxy();
        if (!proxy.extraParams) {
            proxy.extraParams = {};
        }
        proxy.extraParams.productCode = this.getId();
        params = {};

        //me.productVariationStore.loadFromOptions();
        //me.productVariationStore.load();

        //if (autoLoad) {
        //    if (me.phantom) {
        //        me.productVariationStore.loadFromOptions();
        //    } else {
        //        this.productVariationStore.load();
        //    }
        //}


        this.on('aftercommit', function () {            
            me.productVariationStore.proxy.extraParams.productCode = this.getId();
        }, me);


        //this.getOptions().on('update', function () {
        //        me.productVariationStore.loadFromOptions();

        //        //if (me.phantom) {
        //        //    me.productVariationStore.loadFromOptions();
        //        //} else {
        //        //    this.productVariationStore.load();

        //        //}
        //    },
        //    me,
        //    { buffer: 20 });


        return this.productVariationStore;
    },



    /**
    * service call to update the productCode on a product and/or its variations
    * @param {Object} config  A configuration object should contain jsonData array
    * config object:
    * 
        {
            jsonData: [
                {   
                    // one of these for the base product and one for each variation that has changed;
                    existingProductCode: '1234',v
                    newProductCode: "asdf",
                }
            ]
        }
    *
    */
    renameProductCode: function (config) {
        var me = this;

        Ext.apply(config, {
            url: '/admin/app/product/renameproductcode',
            method: 'POST'
        });

        config.errorMsg = config.errorMsg || 'Error changing productCode';
        this.addErrorHandling(config);

        Ext.Ajax.request(config);
    },


    // manipulate a record that is set to be duplicated prior to loading it in the view. Called by app\core\Controller.js
    beforeDuplicate: function () {
        var suffix = " - Copy";

        this.raw = undefined;
        this.set("productCode", "");
        this.set("slug", "");
        this.set("metaTitle", "");
        this.data.productName = this.data.productName + suffix;

        // need to check for any overriden site specific product names.
        Ext.Array.each(this.data.productInCatalogs, function(record) {
            if (record.isContentOverridden) {
                record.productName += suffix;
            }
            if (record.isSEOContentOverridden) {
                record.slug = "";
                record.metaTitle = "";
            }
        });

        this.commit();        
    },

    idProperty: 'productCode',
    //hasMany: [
    //    {
    //        "model":'Taco.model.ProductInCatalogInfo',
    //        "name": "productInCatalogsStore",
    //        "type": "Taco.model.ProductInCatalogInfo",
    //        associationKey: 'productInCatalogs'
    //        //,
    //        //"foreignKey": "productCode"
    //    }
    //],

    // calculates publishing info from current state
    getPublishingInfo: function() {
        if (this.phantom || this.get('publishedState') === 'Live') {
            return {
                statusText: '',
                enabled: {
                    publish: false,
                    now: false,
                    discard:false,
                    remove:false
                },
                publishSetInfo: null
            };
        }

        if (this.get('publishSetCode')) {
            return {
                statusText: 'Scheduled',
                enabled: {
                    publish: true,
                    now: true,
                    discard:true,
                    remove:true
                },
                publishSetInfo: {
                    code: this.get('publishSetCode'),
                    name: this.get('publishSetName'),
                    scheduledDate: this.get('publishSetDate')
                }
            };
        }

        return {
            statusText: 'Draft',
            enabled: {
                publish: true,
                now: true,
                discard:true,
                remove:false
            },
            publishSetInfo: null
        };
    },

    validations: [
        { type: 'length', name: 'productName', min: 3, max: 100 },
        { type: 'presence', name: 'productName' },
        { type: 'presence', name: 'productCode' },
        { type: 'length', name: 'productCode', min: 2, max: 30 },
        { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-\_][A-z0-9\-\_\.]*$/ }
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