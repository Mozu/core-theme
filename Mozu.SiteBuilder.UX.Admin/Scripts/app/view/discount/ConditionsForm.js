

/**
 * @class  Taco.view.discount.ConditionsForm
 * @author Travis Johnson
 * @description Discount Conditions Editor
 */
Ext.define('Taco.view.discount.ConditionsForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-conditions',
    ui: 'subform',

    title: 'Discount Conditions',

    initComponent: function () {
        this.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'minimumOrderAmount',
            fieldLabel: "Minimum Order Amount",
            labelAlign: 'top',
            width: 600,
            unitString: '$',
            emptyText: '0',
            unitAtEnd: false
        });


        this.includeAllProductsInput = Ext.widget({
            xtype: 'checkbox',
            name: 'includeAllProducts',
            fieldLabel: 'Applies to All Products',
            labelAlign: 'top',
            width: 600,
            value: this.record.get('includeAllProducts'),
            listeners: {
                change: this.setFieldVisibility,
                change: function() { alert('implement setFieldVisibility')},
                scope: this
            }
        });

        var catStore = this.record.getCategoryStore();
        // reset the list's dirty state when its store first loads

        catStore.on({
            load: function () {
                this.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categories',
            flex: 1,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'name',
            valueField: 'id',
            fieldLabel: 'Select Categories'
        });

        this.categoriesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                this.categoryList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () {
                        this.launchCategoryModal(this.categoryList);
                    },
                    scope: this
                }
            ]
        });


        this.exclueCategoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'excludedCategories',
            flex: 1,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'name',
            valueField: 'id',
            fieldLabel: 'Excluded Categories'
        });

        this.exclueCategoriesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                this.exclueCategoryList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () {
                        this.launchCategoryModal(this.exclueCategoryList);
                    },
                    scope: this
                }
            ]
        });


        var productStore = this.record.getProductStore();

        var shippingStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ConfiguredShippingRates');


        this.shippingList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingMethods',
            flex: 1,
            store: shippingStore,
            getStore: function () {
                return shippingStore;
            },
            queryMode: 'local',
            width: 600,
            hidden: this.record.get('target') != 'Shipping',
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            value: this.record.get('shippingMethods'),
            displayField: 'Value',
            fieldLabel: 'Select Shipping Methods',
            valueField: 'Key'
        });
        productStore.on({
            load: function () {
                this.productList.resetOriginalValue();
            },
            single: true,
            scope: this
        });

        this.productList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'products',
            flex: 1,
            store: productStore,
            getStore: function () {
                return productStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: false,
            displayField: 'productName',
            fieldLabel: 'Select Products',
            valueField: 'productCode'
        });


        this.productsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                this.productList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () { this.launchProductModal(this.productList); },
                    scope: this
                }
            ]
        });

        this.productExcludeList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'excludedProducts',
            flex: 1,
            store: productStore,
            getStore: function () {
                return productStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: false,
            displayField: 'productName',
            fieldLabel: 'Excluded Products',
            valueField: 'productCode'
        });


        this.productsExcludeBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                this.productExcludeList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () { this.launchProductModal(this.productExcludeList); },
                    scope: this
                }
            ]
        });


        this.productCategoryContainer = Ext.create('Ext.container.Container', {
            width: 600,

            items: [
                this.includeAllProductsInput,
                this.categoriesBox,
                this.productsBox,
                this.exclueCategoriesBox,
                this.productsExcludeBox
            ]
        });

        this.datesContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 600,
            defaults: {
                xtype: 'datetime',
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [{
                    name: 'startDate',
                    fieldLabel: "Starts",
                    emptyText: 'Now',
                    value: this.record.get('startDate')
                }, {
                    name: 'expirationDate',
                    fieldLabel: "Ends",
                    emptyText: 'Never',
                    value: this.record.get('expirationDate')
                }
            ]
        });
        this.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: "Create coupon",
            labelAlign: 'right',
            listeners: {
                change: function (cb, newValue) {
                    if (newValue) {
                        this.couponCodeBox.show();
                    } else {
                        this.couponCodeBox.hide();
                    }
                },
                scope: this
            }
        });
        this.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            width: 500
        });
        this.couponCodeBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            hidden: !(this.record.get('couponCode') || this.record.get('requiresCoupon')),
            items: [
                this.couponCodeInput,
                {
                    xtype: 'secondarybutton',
                    text: 'Random',
                    click: function () {
                        var randomizer = Ext.data.IdGenerator.get('uuid'),
                            code = randomizer.generate().replace(/[^0-9a-z]/g, "").substr(0, 8).toUpperCase();

                        this.couponCodeInput.setValue(code);
                    },
                    scope: this
                }
            ]
        });

        this.redemptionLimits = Ext.create('Ext.form.field.Number', {
            name: 'maxRedemptionCount',
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Redemption limit' + (this.record.get('currentRedemptionCount') ? '&nbsp;&nbsp;&nbsp;&nbsp;<i>(current redemptions:&nbsp;' + this.record.get('currentRedemptionCount') + '</i>)' : ''),
            emptyText: 'unlimited',
            minValue: 0
        });

        //this.redemptions = Ext.create('Ext.Component', {
        //    html: this.record.get('currentRedemptionCount')  ? 'Current RedemptionCount:' + this.record.get('currentRedemptionCount') : ''
        //});
        this.minimumLifetimeValueAmount = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'minimumLifetimeValueAmount',
            hidden: this.record.get('scope') != 'Order',
            unitString: '$',
            unitAtEnd: false,
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Minimum Lifetime Value Amount',
            emptyText: 'No Customer Value limit',
            minValue: 0
        });

        this.items = [
            this.minimumOrderAmountInput,
            this.productCategoryContainer,
            this.minimumLifetimeValueAmount,
            this.shippingList,
            this.datesContainer,
            this.redemptionLimits,
            this.requiresCouponInput,
            this.couponCodeBox
        ];


        this.callParent(arguments);
    },
    
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeBySite();

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            save: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    },

    /**
     * Opens a modal with a list of products.
     * @private
     */
    launchProductModal: function (list) {
        var listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        this.modal.on({
            save: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });

        // if (this.modal) {
        //     this.modal.down('grid').getSelectionModel().deselectAll();
        //     this.modal.show();
        //     return;
        // }
    },

    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onCategoryListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value, store;
        if (closeBtn) {
            store = view.getStore();
            value = Ext.Array.remove(list.getValue(), record.getId());
            store.remove(record);
            list.setValue(value);
            console.log(value, list.getValue());
            return false;
        }
    }
});