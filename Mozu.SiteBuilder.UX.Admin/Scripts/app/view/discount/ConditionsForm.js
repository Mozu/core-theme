/**
 * @class  Taco.view.discount.ConditionsForm
 * @author Travis Johnson
 * @description Discount Conditions Editor
 */
Ext.define('Taco.view.discount.ConditionsForm', {
    requires: [
        'Ext.data.UuidGenerator',
        'Ext.ux.form.field.BoxSelect',
        'Taco.view.category.Modal',
        'Taco.view.product.Modal',
        'Taco.view.customers.segments.Modal',
        'Taco.core.ux.form.CurrencyField'
    ],
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-conditions',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Discount Conditions',

    initComponent: function () {
        this.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.CurrencyField', {
            name: 'minimumOrderAmount',
            fieldLabel: "Minimum Order Amount",
            hidden: this.record.get('scope') !== 'Order',
            forcePrecision: true,
            labelAlign: 'top',
            width: 600,
            currencyCode: Taco.app.context.getCurrent().currencyCode,
            emptyText: 'Not Applicable',
            align: 'right',
            unitAtEnd: false
        });

        this.datesContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            defaults: {
                xtype: 'datetime',
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [
                {
                    name: 'startDate',
                    width: 200,
                    margin: "0px 2px 0px 0px",
                    fieldLabel: "Starts",
                    emptyText: 'Now',
                    value: this.record.get('startDate')
                }, {
                    name: 'expirationDate',
                    width: 200,
                    fieldLabel: "Ends",
                    emptyText: 'Never',
                    value: this.record.get('expirationDate')
                }
            ]
        });

        this.buildProduct();

        this.buildCategory();

        this.buildSegments();

        this.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: 'Create coupon',
            labelAlign: 'right',
            listeners: {
                change: function (cb, newValue) {
                    this.couponCodeBox[newValue ? 'show' : 'hide']();
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
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Random',
                    margin: '0 0 0 10',
                    handler: function () {
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
            fieldLabel: 'Total Number of Redemptions: ' + (this.record.get('currentRedemptionCount') ? '&nbsp;&nbsp;&nbsp;&nbsp;<i>(current redemptions:&nbsp;' + this.record.get('currentRedemptionCount') + '</i>)' : ''),
            emptyText: 'unlimited',
            minValue: 0
        });

        this.minimumCategorySubtotalBeforeDiscounts = Ext.create('Taco.core.ux.form.CurrencyField', {
            name: 'minimumCategorySubtotalBeforeDiscounts',

            // hidden: this.record.get('scope') !== 'Order',
            currencyCode: Taco.app.context.getCurrent().currencyCode,
            forcePrecision: true,
            unitAtEnd: false,
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Minimum Product Category Purchase Amount (pre-discount)',
            //  emptyText: 'No Customer Value limit',
            minValue: 0
        });

        this.minimumLifetimeValueAmount = Ext.create('Taco.core.ux.form.CurrencyField', {
            name: 'minimumLifetimeValueAmount',
            hidden: this.record.get('scope') !== 'Order',
            currencyCode: Taco.app.context.getCurrent().currencyCode,
            forcePrecision: true,
            unitAtEnd: false,
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Minimum Lifetime Value Amount',
            emptyText: 'No Customer Value limit',
            minValue: 0
        });

        this.oneTimeUsePerShopper = Ext.create('Ext.form.field.Checkbox', {
            name: 'oneTimeUsePerShopper',
            boxLabel: 'Discount Can Be Redeemed One Time Per Shopper',
            checked: this.record.get('maximumUsesPerUser') === 1,
            listeners: {
                change: function (cb, newValue) {
                    this.record.set('maximumUsesPerUser', newValue ? 1 : 0);
                },
                scope: this
            }
        });

        this.items = [
            {
                xtype: 'component',
                html: 'Discount conditions specify rules which must be met before a discount or coupon will be valid. All discount conditions are optional; if left blank, the discount or coupon will always be valid.',
                margin: '15 0 0 0'
            },
            this.datesContainer,
            this.minimumOrderAmountInput,
            this.minimumLifetimeValueAmount,
            this.segmentsBox,
            {
                xtype: 'component',
                html: 'Shopper must purchase a quantity of any one of the following items:',
                cls: 'x-form-item-label x-unselectable x-form-item-label-top'
            },
            this.productsBox,
            {
                xtype: 'component',
                html: 'Shopper must purchase a quantity of any item(s) from the following categories:',
                cls: 'x-form-item-label x-unselectable x-form-item-label-top'
            },
            this.categoriesBox,
            this.minimumCategorySubtotalBeforeDiscounts,
            this.redemptionLimits,
            this.requiresCouponInput,
            this.couponCodeBox,
            this.oneTimeUsePerShopper
        ];


        this.callParent(arguments);
        this.onProductsCategoriesChange(true);
    },

    buildProduct: function () {
        var productStore = this.record.getProductStore();

        productStore.on({
            load: function () {
                this.productList.resetOriginalValue();
            },
            single: true,
            scope: this
        });

        this.productList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'conditionalProducts',
            flex: 1,
            margin: 0,
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
            hideLable: true,
            listeners: {
                change: this.onProductsCategoriesChange,
                scope: this
            },
            // fieldLabel: 'Purchase one of the following items',
            valueField: 'productCode',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });


        this.productsBox = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: 600,
            items: [
                {
                    xtype: 'numberfield',
                    name: 'minimumQuantityRequiredProducts',
                    hideTrigger: true,
                    width: 80,
                    minValue: 1,
                    allowBlank: true,
                    labelAlign: 'right',
                    hideLable: true,
                }, {
                    xtype: 'component',
                    html: 'of',
                    padding: '0 10px 0 10px',
                    cls: 'x-form-item-label x-unselectable x-form-item-label-left'
                },
                this.productList, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchProductModal(this.productList);
                    },
                    scope: this
                }
            ]
        });
        this.minimumQuantityRequiredProducts = this.productsBox.down('[name=minimumQuantityRequiredProducts]');
    },


    buildSegments: function () {
        var segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        this.segmentsList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'customerSegments',
            width: 520,
            margin: 0,
            store: segStore,
            getStore: function () {
                return segStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: false,
            displayField: 'code',
            fieldLabel: 'Customer Segments',
            valueField: 'id',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.segmentsBox = Ext.create('Ext.container.Container', {
            layout: 'auto',
            width: 600,
            items: [
                this.segmentsList, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchSegmentModal(this.segmentsList);
                    },
                    scope: this
                }
            ]
        });
    },

    buildCategory: function () {
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
            name: 'conditionalCategories',
            flex: 1,
            margin: 0,
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
            hideLabel: true,

            // fieldLabel: 'Purchase an item from the following categories',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        Ext.defer(function () {
            this.categoryList.on({
                change: this.onProductsCategoriesChange,
                scope: this
            });
        }, 3000, this);

        this.categoriesBox = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: 600,
            items: [
                {
                    xtype: 'numberfield',
                    name: 'minimumQuantityProductsRequiredInCategories',
                    hideTrigger: true,
                    width: 80,
                    minValue: 1,
                    allowBlank: true,
                    labelAlign: 'right',
                    hideLable: true,
                }, {
                    xtype: 'component',
                    html: 'of',
                    padding: '0 10px 0 10px',
                    cls: 'x-form-item-label x-unselectable x-form-item-label-left'
                },
                this.categoryList,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchCategoryModal(this.categoryList);
                    },
                    scope: this
                }
            ]
        });
        this.minimumQuantityProductsRequiredInCategories = this.categoriesBox.down('[name=minimumQuantityProductsRequiredInCategories]');


    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
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
            savesuccess: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    },

    launchSegmentModal: function (list) {
        var listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.CustomerSegments',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    },

    onProductsCategoriesChange: function (delayed) {


        var categoryList = this.categoryList.getValue(),
            productList = this.productList.getValue(),
            hasProducts = productList && productList.length,
            hasCats = (categoryList && categoryList.length),
            minReqCatVal = this.minimumQuantityProductsRequiredInCategories.getValue(),
            minReqProdVal = this.minimumQuantityRequiredProducts.getValue(),
            hasStuff = hasProducts || hasCats;

        this.minimumCategorySubtotalBeforeDiscounts[hasStuff ? 'enable' : 'disable']();
        if (hasCats) {
            this.minimumQuantityProductsRequiredInCategories.enable();

            if (!this.minimumQuantityProductsRequiredInCategories.getValue()) {
                if (delayed !== true) {
                    Ext.defer(this.onProductsCategoriesChange, 3000, this, [true]);

                }
                //else {
                //    this.minimumQuantityProductsRequiredInCategories.setValue(1);
                //}

            }

        } else {
            this.minimumQuantityProductsRequiredInCategories.disable();

            if (delayed !== true) {
                Ext.defer(this.onProductsCategoriesChange, 3000, this, [true]);

            } else {
                this.minimumQuantityProductsRequiredInCategories.setValue(undefined);
            }

        }
        if (hasProducts) {
            this.minimumQuantityRequiredProducts.enable();

            if (!this.minimumQuantityRequiredProducts.getValue()) {
                if (delayed !== true) {
                    Ext.defer(this.onProductsCategoriesChange, 3000, this, [true]);

                }
                //else {
                //    this.minimumQuantityRequiredProducts.setValue(1);
                //}
            }

        } else {
            this.minimumQuantityRequiredProducts.disable();

            if (delayed !== true) {
                Ext.defer(this.onProductsCategoriesChange, 3000, this, [true]);

            } else {
                this.minimumQuantityRequiredProducts.setValue(undefined);
            }

        }


    },
    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onCategoryListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value,
            store;
        if (closeBtn) {
            store = view.getStore();
            value = Ext.Array.remove(list.getValue(), record.getId());
            store.remove(record);
            list.setValue(value);
            return false;
        }
    },

    setFieldVisibility: function (isLineItem, appliesToShipping) {
        this.minimumLifetimeValueAmount.setVisible(!isLineItem);
        this.minimumOrderAmountInput.setVisible(!isLineItem);
    }
});