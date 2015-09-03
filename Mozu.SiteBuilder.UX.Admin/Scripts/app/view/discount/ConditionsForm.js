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
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.discount.widget.CategoryPicker',
        'Taco.core.ux.TooltipLabel',
        'Taco.model.GatewayDefinitions',
        'Taco.store.PaymentWorkflows'
    ],
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-conditions',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Discount Conditions',

    initComponent: function () {
        var me = this,
            paymentWorkflowsStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.PaymentWorkflows', 
                clearFilters: false,
                createOnly:true,
                filters: [function (record) {
                    return record.get("key").toUpperCase() != "PAYPALEXPRESS";
                }]
            });


        this.includedPaymentMethodField = Ext.create('Ext.form.field.ComboBox',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.includedPaymentMethodField', me, {
                name: 'includedPaymentMethod',
                store: paymentWorkflowsStore,
                queryMode: 'local',
                margin: 0,
                width: 600,
                lastQuery:"",
                fieldLabel: 'Required Payment Method',
                labelAlign: 'top',
                editable: false,
                allowBlank: true,
                forceSelection: true,
                autoSelect: true,
                displayField: 'value',
                valueField: 'key'
            })
        );

        paymentWorkflowsStore.addListener("load", function(scope, records, successful) {
            if (!successful) return;

            var noneOption = Ext.create('Taco.model.KeyValuePair', { key: null, value: "None" });
            paymentWorkflowsStore.insert(0, noneOption);

            if (!me.record.get('includedPaymentMethod')) {
                me.includedPaymentMethodField.select(noneOption);
            }
        });

        this.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.CurrencyField',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.minOrderAmount', me, {
                name: 'minimumOrderAmount',
                fieldLabel: "Minimum Order Amount",
                forcePrecision: true,
                labelAlign: 'top',
                width: 600,
                currencyCode: Taco.app.context.getCurrent().currencyCode,
                align: 'right',
                unitAtEnd: false
            })
        );

        //this.maximumDiscountAmountInput = Ext.create('Taco.core.ux.form.CurrencyField', {
        //    name: 'maximumDiscountAmount',
        //    fieldLabel: "Maximum Discount Amount",
        //    disabled: this.record.get('scope') !== 'Order',
        //    forcePrecision: true,
        //    labelAlign: 'top',
        //    width: 600,
        //    currencyCode: Taco.app.context.getCurrent().currencyCode,
        //    //emptyText: '',
        //    align: 'right',
        //    unitAtEnd: false
        //});

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

        // this is Release 7 feature. Commenting out until r7 (simeon)
        //this.minimumProductSubtotalBeforeDiscounts = Ext.create('Taco.core.ux.form.CurrencyField', {
        //    name: 'minimumProductSubtotalBeforeDiscounts',
        //    fieldLabel: 'Minimum Product Purchase Amount (pre-discount)',
        //    disabled:true,
        //    // hidden: this.record.get('scope') !== 'Order',
        //    currencyCode: Taco.app.context.getCurrent().currencyCode,
        //    forcePrecision: true,
        //    unitAtEnd: false,
        //    hideTrigger: true,
        //    width: 600,
            
        //    //  emptyText: 'No Customer Value limit',
        //    minValue: 0
        //});

        this.minimumCategorySubtotalBeforeDiscounts = Ext.create('Taco.core.ux.form.CurrencyField', 
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.minimumCategorySubtotalBeforeDiscounts', me, {
                name: 'minimumCategorySubtotalBeforeDiscounts',
                // hidden: this.record.get('scope') !== 'Order',
                currencyCode: Taco.app.context.getCurrent().currencyCode,
                forcePrecision: true,
                unitAtEnd: false,
                hideTrigger: true,
                width: 600,
                fieldLabel: 'Minimum Category Purchase Amount',
                //  emptyText: 'No Customer Value limit',
                minValue: 0
            })
        );

        this.minimumLifetimeValueAmount = Ext.create('Taco.core.ux.form.CurrencyField',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.minimumLifetimeValueAmount', me, {
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
            })
        );

        this.items = [
            {
                xtype: 'component',
                html: 'Discount conditions specify rules which must be met before a discount or coupon will be valid. All discount conditions are optional; if left blank, the discount or coupon will always be valid.',
                margin: '15 0 0 0'
            },
            this.datesContainer,
            this.minimumOrderAmountInput,
            //this.maximumDiscountAmountInput,
            this.minimumLifetimeValueAmount,
            this.segmentsBox,
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.minimumQuantityRequiredProducts', me, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Required Item Purchase',
                margin: '0 0 0 0'
            }),
            this.productsBox,
            //this.minimumProductSubtotalBeforeDiscounts,
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.minimumQuantityProductsRequiredInCategories', me, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Required Category Purchase',
                margin: '0 0 0 0'
            }),
            this.categoriesBox,
            this.minimumCategorySubtotalBeforeDiscounts,
            this.includedPaymentMethodField
        ];

        this.callParent(arguments);
        this.onProductsCategoriesChange(true);
    },

    buildProduct: function () {
        var productStore = this.record.getProductStore();
        productStore.clearFilter(true);
        productStore.load();
        
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
                change: function (cmp, newValue, oldValue) {
                    if (Ext.isEmpty(newValue) !== Ext.isEmpty(oldValue)) {
                        this.onBuyItemConditionChange();
                    }
                    this.onProductsCategoriesChange();
                },
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
                    hideLable: true
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
        var me = this,
            segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        this.segmentsList = Ext.create('Ext.ux.form.field.BoxSelect',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.conditions.customerSegments', me, {
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
            })
        );

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
        var me = this;
        
        this.conditionalCategoryPanel = Ext.create('Taco.view.discount.widget.CategoryPicker', {
            catStore: this.record.getCategoryStore(),
            record: this.record,
            name: 'conditionalCategories',
            showDynamicRealTimeCategories:false,
            listWidth: 407,
            listeners: {
                scope: me,
                change: function (cmp, newValue) {
                    if (newValue.length && !this.minimumQuantityProductsRequiredInCategories.getValue()) {
                        this.minimumQuantityProductsRequiredInCategories.setValue(1);
                    }
                }
            }
        });

        Ext.defer(function () {
            this.mon(this.conditionalCategoryPanel, "change", function(cmp, newValue, oldValue) {
                if (Ext.isEmpty(newValue) !== Ext.isEmpty(oldValue)) {
                    this.onBuyItemConditionChange();
                }
                this.onProductsCategoriesChange();
            }, this);
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
                    hideLable: true
                }, {
                    xtype: 'component',
                    html: 'of',
                    padding: '0 10px 0 10px',
                    cls: 'x-form-item-label x-unselectable x-form-item-label-left'
                },
                this.conditionalCategoryPanel
            ]
        });
        this.minimumQuantityProductsRequiredInCategories = this.categoriesBox.down('[name=minimumQuantityProductsRequiredInCategories]');


    },

    /**
     * Opens a modal with a list of products.
     * @private
     */
    launchProductModal: function (list) {
        var me = this,
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });
        gridStore.load();

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
                list.addValue(values);
                me.reloadStore(list);
                if (values.length && !this.minimumQuantityRequiredProducts.getValue()) {
                    this.minimumQuantityRequiredProducts.setValue(1);
                }
            },
            aftercancelclose: function () {
                me.reloadStore(list);
            },
            scope: this
        });
    },

    reloadStore: function(list) {
        var store = list.getStore(),
            proxy = store.getProxy();
        if (proxy.extraParams) {
            proxy.extraParams = {};
        }
        store.load();
    },

    launchSegmentModal: function (list) {
        var gridStore = Taco.core.data.StoreManager.getOrCreate({
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

    hasBuyItemConditions : function() {
        var categoryList = this.conditionalCategoryPanel.getValue(),
            productList = this.productList.getValue(),
            hasProducts = productList && productList.length,
            hasCats = (categoryList && categoryList.length);
        return (hasProducts || hasCats);
    },

    onBuyItemConditionChange: function () {
        var me = this;
        var hasBuyItems = me.hasBuyItemConditions();
        // fire event on the record so that any other subforms can be notified of the change;
        me.record.fireEvent("buyitemconditionchange", hasBuyItems);
    },

    onProductsCategoriesChange: function (delayed) {
        // need to avoid this getting called after the view is destoryed. 
        if (this.isDestroyed) {
            return;
        }

        var categoryList = this.conditionalCategoryPanel.getValue(), 
            productList = this.productList.getValue(),
            hasProducts = productList && productList.length,
            hasCats = (categoryList && categoryList.length),
            //minReqCatVal = this.minimumQuantityProductsRequiredInCategories.getValue(),
            //minReqProdVal = this.minimumQuantityRequiredProducts.getValue(),
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

    setFieldVisibility: function (scopeType, targetType) {
        var isOrder = (scopeType === 'Order'),
            isLineItem = (scopeType === 'LineItem');


        if ((!isLineItem && !isOrder) || !targetType) {
            this.setVisible(false);
            return;
        } else {
            this.setVisible(true);
        }

        this.minimumLifetimeValueAmount.setVisible(!isLineItem);
    },

    beforeSave: function () {
        this.record.set('conditionalCategories', this.conditionalCategoryPanel.getValue());
        if (this.record.store) {
            this.record.store.needsRefresh = true;
        }
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});