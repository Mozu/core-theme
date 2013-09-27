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
        'Taco.model.ProductInSiteInfo',
        'Taco.model.ProductVariation'
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
            var me = this,
                options = Ext.apply({}, {
                    method: 'POST',
                    success: function (response) {
                        Taco.core.data.StoreManager.markChanged('Taco.model.Product');
                        if (cfg.success) cfg.success.apply(cfg.scope || this, arguments);
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
            name: "publishedState",
            type: "string",
            useNull: true
        },
        {
            name: "lastModifiedBy",
            type: "string",
            useNull: true
        },
        {
            name: "lastModifiedDate",
            type: "date",
            useNull: true
        },
        {
            name: "lastPublishedBy",
            type: "string",
            useNull: true
        },
        {
            "name": "lastPublishedDate",
            "type": "date",
            "useNull": true
        },
        {
            name: "lastModifiedByUser",
            type: "auto",
            convert: function (v, record) {
                if (record.raw) {
                    // look up user id in magical site users global object.
                    var id = record.raw.lastModifiedBy;
                    return Ext.Array.findBy(window.Taco.siteUsersRaw, function(u) { return u.Id === id })
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
                    return Ext.Array.findBy(window.Taco.siteUsersRaw, function(u) { return u.Id === id })
                }
                return null;
            }
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
            defaultValue: false,
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
            defaultValue: []
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
        },
        {
            name: "options",
            type: "auto",
            defaultValue: []
        },
        {
            name: "isConfigurable",
            type: 'boolean',
            convert: function (v, record) {
                return (record.get("options").length || record.get("extras").length);
            }
        }
    ],
    loadRuntimeProduct: function (cfg) {

        var me = this,
            options = Ext.apply({}, {
                url: '/admin/app/productruntime/read?productCode=' + this.getId(),
                success: function (response) {
                    var res = Ext.JSON.decode(response.responseText) || {};
                    if (cfg.callback) cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    if (cfg.success && res.success) cfg.success.apply(cfg.scope || me, [res.items, response]);
                    if (!res.success && cfg.failure) cfg.failure.apply(cfg.scope || me, [res.items, response]);
                }
            }, cfg);
        Ext.Ajax.request(options);

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
                    if (cfg.callback) cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    if (cfg.success && res.success) cfg.success.apply(cfg.scope || me, [res.items, response]);
                    if (!res.success && cfg.failure) cfg.failure.apply(cfg.scope || me, [res.items, response]);
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
                    
                    if (cfg.callback) cfg.callback.apply(cfg.scope || me, [res.items, response]);
                    if (cfg.success && res.success) cfg.success.apply(cfg.scope || me, [res.items, response]);
                    if (!res.success && cfg.failure) cfg.failure.apply(cfg.scope || me, [res.items, response]);
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
    getContextualValue: function (fieldName) {
        var level = this, ctx = Taco.app.context.getCurrent();
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
    getProductInSites: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductInSiteInfo',
            associationKey: 'productInSites',
            foreignKey: 'productCode',
            foreignProperty: 'product'
        });
    },
    productInSitesStore: function () {
        return this.getProductInSites();
    },
    reloadProductInSitesStore: function () {
        this.getProductInSites().loadData(this.get('productInSites'));
    },

    getVariations: function () {
        var me = this,
            params,
            proxy;

        if (me.productVariationStore) {
            return me.productVariationStore;
        }

        me.productVariationStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ProductVariation',
            autoLoad: false,
            pageSize: 900,
            loadFromOptions: function () {
                params.options = [];
                me.getOptions().each(function (option) {
                    params.options.push({
                        attributeFQN: option.data.attributeFQN,
                        values: option.data.values
                    });
                });
                params.productTypeId = me.get('productTypeId');
                params.options = Ext.JSON.encode(params.options);
                this.load({
                    params: params
                });
            }
        });

        proxy = me.productVariationStore.getProxy();
        if (!proxy.extraParams) {
            proxy.extraParams = {};
        }
        proxy.extraParams.productCode = this.getId();


        params = {};

        if (me.phantom) {
            me.productVariationStore.loadFromOptions();
        } else {
            this.productVariationStore.load();

        }


        this.on('aftercommit', function () {
            proxy.extraParams.productCode = this.getId();
        }, this);


        this.getOptions().on('update', me.productVariationStore.loadFromOptions, me.productVariationStore, { buffer: 20 });
        

        return this.productVariationStore;
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