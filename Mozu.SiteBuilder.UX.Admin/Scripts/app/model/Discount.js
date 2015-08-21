/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.Discount', {
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
            name: 'name',
            type: 'string'
        }, {
            name: 'friendlyDescription',
            type: 'string'
        }, {
            name: 'scope',
            type: 'string'
        },{
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
            name: 'conditionalCategories',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'conditionalProducts',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'conditionalExcludedCategories',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'conditionalExcludedProducts',
            type: 'auto',
            defaultValue: []
        },
        {
          name:'maximumQuantityPerRedemption',
          type:'auto',
          defaultValue:null
        },
        {
            name: 'includedPaymentMethod',
            type: 'string',
            useNull: true,
            defaultValue: null
        },
        {
            name: 'shippingMethods',
            type: 'auto',
            defaultValue: []
        },
         {
             name: 'shippingZones',
             type: 'auto',
             defaultValue: []
         },
        
        {
            name: 'minimumOrderAmount',
            type: 'float',
            useNull: true,
            defaultValue: null
        },
        
        {
            name: "doesNotApplyToSalePrice",
            type: 'bool'
        },
        {
            name: "doesNotApplyToProductsWithSalePrice",
            type: 'bool'
        },

        {
            name: "excludeItemsWithExistingProductDiscounts",
            type: 'bool'
        },

        {
            name: "excludeItemsWithExistingShippingDiscounts",
            type: 'bool'
        },
        {
            name: "customerSegments",
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'maximumDiscountValuePerOrder',
            type: 'float',
            useNull: true
        },
        {
            name: 'maximumDiscountValuePerRedemption',
            type: 'float',
            useNull: true
        },
        {
            name: 'maxRedemptionCount',
            type: 'int',
            useNull: true
        },{
            name: 'maximumRedemptionsPerOrder',
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
            name: 'maximumUsesPerUser',
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
            name: 'couponSets',
            type: 'auto',
            defaultValue:[],
            defaultValue1:[{
                assignedDiscountCount: 0,
                canBeDeleted: true,
                couponCodeCount: 72,
                couponCodeType: "Manual",
                couponSetCode: "FXN9",
                id: 1,
                maxRedemptionsPerCouponCode: 1,
                maxRedemptionsPerUser: 1,
                name: "chet jr",
                redemptionCount: 0,
                status: "Active"
            }]
        }, {
            name: 'amount',
            type: 'float'
        }, {
            name: 'amountType',
            type: 'string',
            defaultValue: 'Amount'
        }, {
            name: 'startDate',
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'expirationDate',
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'status',
            type: 'string'
        }, {
            name: 'canBeDeleted',
            type: 'boolean'
        }, {
            name: 'minimumQuantityProductsRequiredInCategories',
            type:'int',
            useNull:true
        },{
            name: 'minimumQuantityRequiredProducts',
            type:'int',
            useNull:true
        },{
            name: 'minimumCategorySubtotalBeforeDiscounts',
            type:'int',
            useNull: true
        },{
            name: 'isIncludedCategoriesAllOperator',
            type: 'boolean',
            defaultValue: false
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