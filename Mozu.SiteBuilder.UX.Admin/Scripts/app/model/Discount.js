/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.Discount', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    idProperty: 'id',
    fields: [{
            name: 'id',
            type: 'int'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'scope',
            type: 'string'
        },
        {
            name: 'target',
            type: 'string'
        },
        {
            name: 'includeAllProducts',
            type: 'boolean'
        },
        {
            name: 'categories',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'products',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'excludedCategories',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'excludedProducts',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'shippingMethods',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'minimumOrderAmount',
            type: 'float'
        },
        {
            name: 'maxRedemptionCount',
            type: 'int',
            useNull: true
        },
        {
            name: 'currentRedemptionCount',
            type: 'int',
            useNull: true,
            defaultValue: null
        },
        {
            name: 'minimumLifetimeValueAmount',
            type: 'int',
            useNull: true
        },
        {
            name: 'requiresCoupon',
            type: 'boolean'
        },
        {
            name: 'couponCode',
            type: 'string'
        }, {
            name: 'amount',
            type: 'float'
        }, {
            name: 'amountType',
            type: 'string',
            defaultValue: 'Amount'
        }, {
            name: 'startDate',
            type: 'date'
        }, {
            name: 'expirationDate',
            type: 'date'
        }, {
            name: 'status',
            type: 'string'
        }],

    getProductStore: function () {
        var me = this;

        if (me.productStore == null) {
            me.productStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.Products',
                    createOnly: true,
                    id: "prod-" + this.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false,
                    filters: function (record) {
                        return Ext.Array.indexOf((me.get('products') || []), record.getId()) > -1;
                    }
                });
        }
        return me.productStore;
    },

    getCategoryStore: function () {
        var me = this;
        if (me.categoryStore == null) {
            me.categoryStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.Categories',
                    createOnly: true,
                    id: "cat-" + this.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false,
                    filters: function (record) {
                        return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
                    }
                });

        }
        return me.categoryStore;

    },

    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/Scripts/app/mocks/discounts.json',
            read: '/admin/app/discount/list',
            create: '/admin/app/discount/create',
            update: '/admin/app/discount/edit',
            destroy: '/admin/app/discount/delete'
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