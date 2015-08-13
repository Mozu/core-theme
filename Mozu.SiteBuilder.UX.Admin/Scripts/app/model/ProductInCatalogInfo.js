/**
 * @class Taco.model.ProductInCatalogInfo
 * @author James Zetlen
 * This model indicates a Product membership in a Site, and contains any overrides to the Product defaults.
 */

Ext.define('Taco.model.ProductInCatalogInfo', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productShortDescription",
            "type": "string",
            "useNull": true
        }, {
            "name": "dateFirstAvailableInCatalog",
            "type": "date",
            "useNull": true
        },
        {
            "name": "isActive",
            "type": "boolean",
            "defaultValue": true,
            "useNull": true
        },
        {
            "name": "status",
            "type": "string",
            persist: false,
            convert: function (value, record) {
                if (!record.get('isActive')) {
                    return 'Disable';
                }
                if (record.get('activeStartDate') || record.get('activeEndDate')) {
                    return 'Scheduled';
                }
                return 'Active';
            }
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
            "name": "metaDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaKeywords",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaTitle",
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
            "name": "slug",
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
        },
        {
            name: "activeStartDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        },
        {
            name: "activeEndDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        }

    ],

    idProperty: "catalogId",
    getCategoryStore: function () {
        var me = this;
        if (me.categoryStore == null) {
            me.categoryStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Categories',
                createOnly: true,
                id: 'Taco.store.Categories' + this.id,
                autoLoad: true,
                catalogId: catalogId,
                filters: function (record) {
                    return   Ext.Array.indexOf((me.get('categoryIds') || []),record.getId()) > -1;
                }
            });


            me.categoryStore.filter([
                {
                    filterFn: function (record) {
                        return  Ext.Array.indexOf( (me.get('categoryIds') || []), record.getId()) > -1;
                    }
            }]);

        }
        return me.categoryStore;

    },

    getCatalog: function () {
        return Taco.app.context.findCatalog(this.getId());
    },
    formatCurrency: function (value) {
        return this.getCatalog().formatCurrency(value);
    },

    getUnfilteredCategoryStore: function () {
        var me = this,
            catalogId = this.getId();
        if (me.categoryStoreUnfiltered == null) {
            me.categoryStoreUnfiltered = Ext.create('Taco.store.Categories');
            me.categoryStoreUnfiltered.load({
                catalogId: catalogId
            });
        }
        return me.categoryStoreUnfiltered;

    },

    validations: [


    ]


});