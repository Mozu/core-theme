/**
 * @class Taco.model.CouponSet
 */
Ext.define('Taco.model.CouponSet', {
    extend: 'Taco.core.data.Model',
    //  requiredStores: ['Taco.store.ShippingMethods', 'Taco.store.ShippingZones'],
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
            useNull: true
        }, {
            name: 'couponSetCode',
            type: 'string'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'couponCodeType',
            type: 'string'
        }, {
            name: 'status',
            type: 'string'
        }, {
            name: 'canBeDeleted',
            type: 'boolean',
            persist: false
        }, {
            name: 'maxRedemptionsPerUser',
            defaultValue: 1,
            type: 'int'
        }, {
            name: 'maxRedemptionsPerCouponCode',
            defaultValue:1,
            type: 'int'
        }, {
            name: 'startDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'endDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'setSize',
            type: 'int',
            useNull: true
        }, {
            name: 'couponCodeCount',
            type: 'int',
            useNull: true,
            persist: false
        }, {
            name: 'countOrSetSize',
            type: 'int',
            persist: false,
            convert: function (v, record) {
                return (record.get('couponCodeType') === 'Manual')
                    ? record.get('couponCodeCount')
                    : record.get('setSize');
            }
        },{
            name: 'redemptionCount',
            type: 'int',
            useNull: true,
            persist: false
        }, {
            name: 'redemptionPercent',
            type: 'float',
            persist: false,
            convert: function (v, record) {
                if (record.get('countOrSetSize') && record.get('countOrSetSize') > 0 && record.get('redemptionCount') && record.get('redemptionCount') > 0 ) {
                    return (record.get('redemptionCount') / record.get('countOrSetSize') ) * 100;
                } else {
                    return 0.0;
                }
            }
        }, {
            name: 'assignedDiscountCount',
            type: 'int',
            useNull: true,
            persist: false
        }
    ],

    validations: [
        {field: 'couponSetCode', type: 'length', max: 32},
        {field: 'name', type: 'length', max: 200}
    ],

    //getDiscounts

    //getCouponCodes

    //getProductStore: function () {
    //    var me = this;

    //    if (!me.productStore ) {
    //        me.productStore = Taco.core.data.StoreManager.getOrCreate(
    //            {
    //                type: 'Taco.store.Products',
    //                createOnly: true,
    //                id: "prod-" + this.id,
    //                autoLoad: true,
    //                clearFilters: false,
    //                remoteFilter: false,
    //                filters: function (record) {
    //                    return Ext.Array.indexOf((me.get('products') || []), record.getId()) > -1;
    //                }
    //            });
    //    }
    //    return me.productStore;
    //},

    //getCategoryStore: function () {
    //    var me = this;
    //    if (!me.categoryStore ) {
    //        me.categoryStore = Taco.core.data.StoreManager.getOrCreate(
    //            {
    //                type: 'Taco.store.Categories',
    //                createOnly: true,
    //                id: "cat-" + this.id,
    //                autoLoad: true,
    //                clearFilters: false,
    //                remoteFilter: false,
    //                filters: function (record) {
    //                    return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
    //                }
    //            });

    //    }
    //    return me.categoryStore;

    //},

    //getCustomerSegmentStore: function() {
    //    var me = this;
    //    if (!me.customerSegmentStore ) {
    //        me.customerSegmentStore = Taco.core.data.StoreManager.getOrCreate(
    //            {
    //                type: 'Taco.store.CustomerSegments',
    //                createOnly: true,
    //                id: "seg-" + me.id,
    //                autoLoad: true,
    //                clearFilters: false,
    //                remoteFilter: false,
    //                filters: function (record) {
    //                    return Ext.Array.indexOf((me.get('customerSegments') || []), record.getId()) > -1;
    //                }
    //            });

    //    }
    //    return me.customerSegmentStore;
    //},

    getDeletePromptMessage: function () {
        return (this.get('status') === 'Active')
            ? 'This Coupon Set is currently active and could affect pending orders and carts.<br/>Are you sure you want to delete this?'
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
            read: '/admin/app/CouponSet/list',
            create: '/admin/app/CouponSet/create',
            update: '/admin/app/CouponSet/edit',
            destroy: '/admin/app/CouponSet/delete'
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