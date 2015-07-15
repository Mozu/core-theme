/**
 * @class  Taco.view.discount.CriteriaForm
 * @author Travis Johnson
 * @description Discount Target Criteria
 */
Ext.define('Taco.view.discount.CriteriaForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-criteria',
    requires: [
        'Taco.core.ux.TooltipLabel'
    ],
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Target Criteria',

    initComponent: function () {
        var catStore,
            productStore,
            zoneStore,
            shippingStore,
            me = this;

        // need to listen for changes to the buy product or category items field changes in the conditions subform to alter the maximumQuantityPerRedemptionTB filed;
        me.mon(me.record, "buyitemconditionchange", function (hasBuyConditions) {
            this.hasBuyConditions = hasBuyConditions;
            me.handleBuyItemConditions();
        }, me);

        me.mon(me.record, "criteriascopechange", function (cmp, newValue,oldValue) {
            me.handleCriteriaScopeChange(cmp, newValue, oldValue);
        }, me);


        this.includeAllProductsInput = Ext.widget({
            xtype: 'radio',
            name: 'includeAllProductsRadio',
            persistSelectedValueOnly: true,
            boxLabel: 'All',
            inputValue: "all",
            width: 300,
            checked: this.record.get('includeAllProducts'),
            listeners: {
                afterchange: function (cmp, newValue, oldValue) {
                    if (newValue) {
                        me.record.fireEvent("criteriascopechange", cmp, newValue, oldValue);
                    }
                },
                scope: this
            }
       });
        
        this.includeSpecificProductsInput = Ext.widget({
            xtype: 'radio',
            name: 'includeAllProductsRadio',
            persistSelectedValueOnly: true,
            boxLabel: 'Specific Products',
            inputValue: "products",
            width: 300,
            // default selection if the record is a create;
            checked: ((this.record.phantom &&!this.record.isDuplicate) || (!this.record.get('includeAllProducts') && this.record.get('products').length)),
            listeners: {
                afterchange: function (cmp, newValue, oldValue) {
                    if (newValue) {
                        this.record.fireEvent("criteriascopechange", cmp, newValue, oldValue);
                    }
                },
                scope: this
            }
        });

        this.includeSpecificCatagoriesInput = Ext.widget({
            xtype: 'radio',
            name: 'includeAllProductsRadio',
            persistSelectedValueOnly: true,
            boxLabel: 'Specific Categories',
            inputValue: "categories",
            width: 300,
            checked: (!this.record.get('includeAllProducts') && this.record.get('categories').length), listeners: {
                afterchange: function (cmp, newValue,oldValue) {
                    if (newValue) {
                        this.record.fireEvent("criteriascopechange", cmp, newValue, oldValue);
                    }
                },
                scope: this
            }
        });

        this.ApplyToProductsWithSalePrice = Ext.widget(
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.applyToProductsWithSalePrice', me, {
                xtype: 'checkbox',
                name: 'appliesToSaleProduct',
                boxLabel: 'Applies to Sale Products',
                width: 300,
                value: this.record.get('doesNotApplyToProductsWithSalePrice') !== true,
                listeners: {
                    change: function (field, newValue) {
                        if (newValue) {
                            this.appliesToSalePrice.enable();
                            this.appliesToSalePrice.setValue(true);
                        } else {
                            this.appliesToSalePrice.disable();
                            this.appliesToSalePrice.setValue(false);
                        }
                        this.record.set('doesNotApplyToProductsWithSalePrice', !newValue);
                        this.record.setDirty(true);
                    },
                    scope: this
                }
            })
        );

        // only visible when line item and product and when the this.ApplyToProductsWithSalePrice is checked;
        this.appliesToSalePrice = Ext.widget(
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.appliesToSalePrice', me, {
                xtype: 'checkbox',
                name: 'appliesToSalePrice',
                boxLabel: 'Applies to Sale Price',
                width: 300,
                value: this.record.get('doesNotApplyToSalePrice') !== true,
                listeners: {
                    change: function (field, newValue) {
                        this.record.set('doesNotApplyToSalePrice', !newValue);
                        this.record.setDirty(true);
                    },
                    scope: this
                }
            })
        );
        
        catStore = this.record.getCategoryStore();
        catStore.clearFilter(true);
        catStore.load();

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
            width: 520,
            margin: 0,
            allowBlank:false,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            queryMode: 'local',
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'nameAndCode',
            valueField: 'id',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            },
            listeners: {
                change: function (field, newValue, prevValue) {
                    var prevCount = (Array.isArray(prevValue)) ? prevValue.length : prevValue.split(',').length;
                    
                    if (newValue.split(',').length >= 2 && prevCount < 2) {
                        this.includedCategoriesOperatorCheckbox.show();
                    } else if (prevCount >= 2 && newValue.split(',').length < 2) {
                        this.hideAndResetField(this.includedCategoriesOperatorCheckbox);
                    }
                },
                scope: this
            }
        });

        this.includedCategoriesOperatorCheckbox = Ext.widget(
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.includedCategoriesOperatorCheckbox', me, {
                xtype: 'checkbox',
                name: 'isIncludedCategoriesAllOperator',
                boxLabel: 'Include only common products',
                width: 300,
                hidden: me.record.get('categories').length < 2
            })
        );

        this.categoryMaxQuantityField = Ext.widget({
            xtype: 'numberfield',
            itemId: 'maxQuantity',
            hideTrigger: true,
            width: 100,
            emptyText: "Unlimited",
            allowBlank: true,
            labelAlign: 'right',
            hideLabel: true
        });


        // Note: only visible when Scope is lineItem and the specific categories radio button is selected
        this.categoriesBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: 600,
            fieldLabel: "Categories",
            allowBlank: false,
            items: [
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


        this.excludeCategoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'excludedCategories',
            width: 520,
            margin: 0,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            queryMode: 'local',
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'nameAndCode',
            valueField: 'id',
            fieldLabel: 'Exclude products in the following categories',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.excludeCategoriesBox = Ext.create('Ext.container.Container', {
            layout: 'auto',
            items: [
                this.excludeCategoryList,
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
                        this.launchCategoryModal(this.excludeCategoryList);
                    },
                    scope: this
                }
            ]
        });

        productStore = this.record.getProductStore();
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
            name: 'products',
            width: 520,
            margin: 0,
            allowBlank:false,
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
            valueField: 'productCode',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.productMaxQuantityField = Ext.widget({
            xtype: 'numberfield',
            itemId: 'maxQuantity',
            hideTrigger: true,
            width: 100,
            allowBlank: true,
            labelAlign: 'right',
            emptyText: "Unlimited",
            hideLabel: true
        });
        
        // Note: only visible when Scope is lineItem and the specific products radio button is selected
        this.productsBox = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: 600,
            fieldLabel: 'Products',
            allowBlank:false,
            items: [
                
                this.productList,
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
                        this.launchProductModal(this.productList);
                    },
                    scope: this
                }
            ]
        });

        this.productExcludeList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'excludedProducts',
            width: 520,
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
            fieldLabel: 'Exclude the following products',
            valueField: 'productCode',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });


        this.productsExcludeBox = Ext.create('Ext.container.Container', {
            layout: 'auto',
            items: [
                this.productExcludeList,
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
                        this.launchProductModal(this.productExcludeList);
                    },
                    scope: this
                }
            ]
        });

        
        // note: only enabled when there is a buy item condition on the conditions subform;
        this.maximumQuantityPerRedemptionTB = Ext.create('Ext.form.field.Number',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.maximumQuantityPerRedemption', me, {
                name: 'maximumQuantityPerRedemptionTB',
                emptyText: "Unlimited",
                hideTrigger: true,
                width: 600,
                minValue: 0,
                labelAlign: 'top',
                fieldLabel: 'Quantity'
            })
        );

        

        this.excludeLineItemDiscounts = Ext.create('Ext.form.FieldContainer',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.excludeLineItemDiscounts', me, {
                width: 600,
                margin: '10 0 0 0',
                fieldLabel: "Exclude products that already have:",
                items: [
                    {
                        xtype: 'checkbox',
                        name: 'excludeItemsWithExistingProductDiscounts',
                        boxLabel: 'Product Discounts',
                        width: 300,
                        value: this.record.get('excludeItemsWithExistingProductDiscounts') == true
                    }, {
                        xtype: 'checkbox',
                        name: 'excludeItemsWithExistingShippingDiscounts',
                        boxLabel: 'Shipping Discounts',
                        width: 300,
                        value: this.record.get('excludeItemsWithExistingShippingDiscounts') == true
                    }
                ]
            })
        );

        this.scopeContainer = Ext.create('Ext.form.FieldContainer',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.criteria.scope', me, {
                fieldLabel: "Scope",
                items: [
                    this.includeSpecificProductsInput,
                    this.includeSpecificCatagoriesInput,
                    this.includeAllProductsInput
                ]
            })
        );

        this.productCategoryContainer = Ext.create('Ext.container.Container', {
            width: 600,
            items: [
                this.scopeContainer,
                this.excludeLineItemDiscounts,
                this.productsBox,
                this.categoriesBox,
                this.includedCategoriesOperatorCheckbox,
                this.maximumQuantityPerRedemptionTB,
                {
                    xtype: 'component',
                    html: '<hr />',
                    padding: '20px 0 0 0'
                },
                this.excludeCategoriesBox,
                this.productsExcludeBox,
                this.ApplyToProductsWithSalePrice,
                this.appliesToSalePrice
            ]
        });

        shippingStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');

        zoneStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones');

        this.shippingList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingMethods',
            margin: 0,
            store: shippingStore,
            queryMode: 'local',
            width: 600,
            hidden: this.record.get('target') !== 'Shipping' && false,
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            value: this.record.get('shippingMethods'),
            displayField: 'name',
            fieldLabel: 'Select Shipping Methods',
            valueField: 'code'
        });

        var trimmedZones = (function () {
            var zones = me.record.get('shippingZones');
            if (!zones || zones.length === 0) return zones;
            for (var i = 0; i < zones.length; i++) {
                zones[i] = zones[i].trim();
            }
            return zones;
        })();

        this.shippingZoneList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingZones',
            margin: 0,
            store: zoneStore,
            queryMode: 'local',
            width: 600,
            hidden: this.record.get('target') !== 'Shipping' && false,
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            value: trimmedZones,
            displayField: 'code',
            fieldLabel: 'Select Shipping Zones',
            valueField: 'code'
        });

        this.items = [
            {
                xtype: 'container',
                width: 600,
                items: [
                    this.productCategoryContainer
                ]
            },
            this.shippingList,
            this.shippingZoneList
        ];

        this.callParent(arguments);

    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var me = this,
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
                list.addValue(values);
                me.reloadStore(list);
                me.parentForm.getForm().checkValidity();
            },
            aftercancelclose: function () {
                me.reloadStore(list);
            },
            scope: this
        });
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
        gridStore.filter(true);
        gridStore.load();

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
                list.addValue(values);
                me.reloadStore(list);
                me.parentForm.getForm().checkValidity();
            },
            aftercancelclose: function () {
                me.reloadStore(list);
            },
            scope: this
        });

    },

    reloadStore: function (list) {
        var store = list.getStore(),
            proxy = store.getProxy();
        if (proxy.extraParams) {
            proxy.extraParams = {};
        }
        store.load();
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
            return false;
        }
    },

    setShippingListVisibility: function () {
        var me = this,
            appliesToShipping = (me.targetType == "Shipping");

        this.shippingList.setVisible(appliesToShipping);
        this.shippingZoneList.setVisible(appliesToShipping);
        if (!appliesToShipping) {
            this.shippingList.setValue('');
            this.shippingZoneList.setValue('');
        }
    },

    updateMaximumQuantityPerRedemptionField : function() {
        var me = this,
            isLineItem = (this.scopeType === 'LineItem');

        if (isLineItem && this.hasBuyConditions) {
            me.maximumQuantityPerRedemptionTB.enable();
        } else {
            me.maximumQuantityPerRedemptionTB.disable();
            // value should always be 1 when there are no buy item conditions;
            me.maximumQuantityPerRedemptionTB.setValue(1);
        }

        // value field only visible for line item
        if (isLineItem) {
            me.maximumQuantityPerRedemptionTB.setVisible(true);
        } else {
            me.maximumQuantityPerRedemptionTB.setVisible(false);
        }
    },

    /**
     * Handle the change of the buy item condition fields in the condition form, handle the 
     * @private
     */
    handleBuyItemConditions: function (hasBuyItems) {
        var me = this;

        this.updateMaximumQuantityPerRedemptionField();
    },

    setProductCategoryContainerVisibility: function () {
        var me = this,
            isLineItem = (this.scopeType === 'LineItem'),
            targetSpecifcProducts = this.includeSpecificProductsInput.checked;
        
        // show when order level;
        this.excludeLineItemDiscounts.setVisible(!isLineItem);
        
        //set visibility for the all products, specific products, categories radio buttons
        this.scopeContainer.setVisible(isLineItem);


        if (isLineItem) {
            //if user toggles from order to line item and there is no product or category data. then preselect the all products ratio
            if (!me.includeAllProductsInput.checked && !this.includeSpecificProductsInput.checked && !this.includeSpecificCatagoriesInput.checked) {
                me.includeAllProductsInput.setValue(true);
            }
            
            // optionaly hide or show these based on the selection of the "applies to all products radio button"
            me.productsBox.setVisible(targetSpecifcProducts);
            me.productList.setDisabled(!targetSpecifcProducts);

            me.categoriesBox.setVisible(this.includeSpecificCatagoriesInput.checked);
            if (this.includeSpecificCatagoriesInput.checked && this.categoryList.getValue().length >= 2) {
                me.includedCategoriesOperatorCheckbox.setVisible(true);
            } else {
                me.hideAndResetField(me.includedCategoriesOperatorCheckbox, false);
            }
            me.categoryList.setDisabled(!this.includeSpecificCatagoriesInput.checked);
            
        } else {
            this.productsBox.setVisible(false);
            this.productList.setDisabled(true);
            
            this.categoriesBox.setVisible(false);
            me.hideAndResetField(me.includedCategoriesOperatorCheckbox, false);
            
            this.categoryList.setDisabled(true);
        }
        
        // only available when scope is specific categories or all
        this.excludeCategoriesBox.setVisible(!targetSpecifcProducts);
        this.productsExcludeBox.setVisible(!targetSpecifcProducts);

        

        // this is to fix an issue where a required field is disabled on a subform and the save button does not get enabled/disabled properly. find the top most form and trigger a validity check.
        me.parentForm.getForm().checkValidity();
    },

    handleCriteriaScopeChange: function(cmp, newValue, oldValue) {
        
        this.setProductCategoryContainerVisibility();
    },

    setFieldVisibility: function (scopeType, targetType, discountType) {
        var appliesToShipping = (targetType == "Shipping"),
            isOrder = (scopeType === 'Order'),
            isLineItem = (scopeType === 'LineItem');

        this.scopeType = scopeType;
        this.targetType = targetType;
        this.discountType = discountType;

        this.appliesToShipping = appliesToShipping;
        this.isOrder = isOrder;
        this.isLineItem = isLineItem;
        
        // if order or line item combo has a selection;
        if ((!isLineItem && !isOrder) || !targetType) {
            this.setVisible(false);
            return;
        } else {
            this.setVisible(true);        
        }

        
        

        
        this.appliesToSalePrice.setVisible(this.isLineItem && !appliesToShipping);
        // only enabled if the other checkbox is checked;
        this.appliesToSalePrice.setDisabled(!this.ApplyToProductsWithSalePrice.checked);
        
        this.setProductCategoryContainerVisibility();
        this.updateMaximumQuantityPerRedemptionField();
        this.setShippingListVisibility();
    },

    hideAndResetField: function (targetField, defaultVal) {
        targetField.hide();
        targetField.setValue(defaultVal);
    },
    
    /**
     * Post process form after the built in form loading process is complete. init data load on fields which do not match a record data name; Set default values;
     * @private
     */
    loadForm: function () {
        var me = this,
            record = this.record,
            noBuyConditions = (!this.record.get("conditionalCategories").length && !this.record.get("conditionalProducts").length),
            maximumQuantityPerRedemption = (noBuyConditions) ? 1 : record.get("maximumQuantityPerRedemption");

        // cache this so it can be used to determine visibility and behavior for some local fields;
        this.hasBuyConditions = !noBuyConditions;

        this.callParent(arguments);

        //when creating default all of the fields to 1;
        if (this.record.phantom && !this.record.isDuplicate) {
            // set the default values to 1 for a newly created discount. Values for disabled/hidden fields will be nulled out prior to saving;
            this.maximumQuantityPerRedemptionTB.setValue(1);
            this.maximumQuantityPerRedemptionTB.disable();
        } else {
            // the max quantity is only setable when there are buy conditions and must be set to 1 otherwise.
            me.maximumQuantityPerRedemptionTB.setValue(maximumQuantityPerRedemption);
            me.maximumQuantityPerRedemptionTB.setDisabled(noBuyConditions);
        }
    },

    /**
     * Preprocess form before the built in form processing. Persist field values with not matching field name in the record. Reset values no longer applicable based on current state of the form;
     * @private
     */
    beforeSave: function () {
        var me = this,
            categoriesActive = me.includeSpecificCatagoriesInput.checked,
            productActive = me.includeSpecificProductsInput.checked,
            isLineItem = (this.scopeType === 'LineItem');;

        var includeAllProductsSelected = this.includeAllProductsInput.checked;

        // reset fields not applicable for order scoped discounts
        if (me.scopeType === "order") {
            //reset when not visible;
            includeAllProductsSelected = null;
            categoriesActive = false;
            productActive = false;
        }


        //reset the hidden fields when lineItem
        if (isLineItem) {
            this.findField("excludeItemsWithExistingShippingDiscounts").setValue(false);
            this.findField("excludeItemsWithExistingProductDiscounts").setValue(false);
        }

        this.record.set("includeAllProducts", includeAllProductsSelected);

        // reset product field if category is active;
        if (categoriesActive) {
            me.productList.setValue('');
            me.record.set("products", []);
        }

        // reset category field if product is active;
        if (productActive) {
            me.categoryList.setValue('');
            me.record.set("categories", []);
        }

        this.record.set("maximumQuantityPerRedemption", me.maximumQuantityPerRedemptionTB.getValue());

        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});