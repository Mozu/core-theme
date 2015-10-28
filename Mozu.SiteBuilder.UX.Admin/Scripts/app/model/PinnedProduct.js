/**
 * @class Taco.model.PinnedProduct
 */
Ext.define('Taco.model.PinnedProduct', {
    extend: 'Taco.core.data.Model',
  //  requiredStores: ['Taco.store.ShippingMethods', 'Taco.store.ShippingZones'],
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
            name: 'productName',
            type: 'string'
        }, {
            name: 'productCode',
            type: 'string'
        }, {
            name: 'price',
            type: 'float'
        }, {
            name: 'salePrice',
            type: 'float'
        }, {
            name: 'productTypeName',
            type: 'string'
        }, {
            name: 'productUsage',
            type: 'string'
        }
    ],

    getProductStore: function () {
        var me = this;

        if (!me.productStore ) {
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
        if (!me.categoryStore ) {
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

    getCustomerSegmentStore: function() {
        var me = this;
        if (!me.customerSegmentStore ) {
            me.customerSegmentStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.CustomerSegments',
                    createOnly: true,
                    id: "seg-" + me.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false,
                    filters: function (record) {
                        return Ext.Array.indexOf((me.get('customerSegments') || []), record.getId()) > -1;
                    }
                });

        }
        return me.customerSegmentStore;
    },

    getCouponSetStore: function () {
        var me = this;
        if (!me.couponSetStore) {
            me.couponSetStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.CouponSets',
                    createOnly: true,
                    id: "couponSet-" + this.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false,
                    remoteSort:false,
                    data: this.get("couponSets"),
                    proxy: {
                        type: 'memory',
                        reader: {
                            type: 'json',
                            root: 'items'
                        }
                    }
                });

        }
        return me.couponSetStore;

    },

    getDeletePromptMessage: function () {
        return (this.get('status') === 'Active')
            ? 'This discount is currently active and could affect pending orders and carts.<br/>Are you sure you want to delete this?'
            : 'Are you sure you want to delete this?';
    },

    // manipulate a record that is set to be duplicated prior to loading it in the view. Called by app\core\Controller.js
    beforeDuplicate: function () {
        var suffix = " - Copy";
        this.data.name = this.data.name + suffix;
        this.commit();
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