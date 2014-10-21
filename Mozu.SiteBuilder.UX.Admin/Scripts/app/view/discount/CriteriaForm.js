/**
 * @class  Taco.view.discount.CriteriaForm
 * @author Travis Johnson
 * @description Discount Target Criteria
 */
Ext.define('Taco.view.discount.CriteriaForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-criteria',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Target Criteria',

    initComponent: function () {
        var catStore,
            productStore,
            zoneStore,
            shippingStore,
            me = this;

        this.includeAllProductsInput = Ext.widget({
            xtype: 'checkbox',
            name: 'includeAllProducts',
            boxLabel: 'Applies to All Products',
            width: 300,
            value: this.record.get('includeAllProducts'),
            listeners: {
                change: function() {
                    this.parentForm.setFieldVisibility();
                    enableDisableCriteriaQuantities();
                },
                scope: this
            }
        });

        this.appliesToSaleProducts = Ext.widget({
            xtype: 'checkbox',
            name: 'appliesToSalePrice',
            boxLabel: 'Applies to On Sale Products',
            width: 300,
            value: this.record.get('doesNotApplyToSalePrice') !== true,
            listeners: {
                change: function(field, newValue) {
                    this.record.set('doesNotApplyToSalePrice', !newValue);
                },
                scope: this
            }
        });

        catStore = this.record.getCategoryStore();
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
            width: 382,
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
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        function disableCmp(cmp) { cmp.disable(); }
        function enableCmp(cmp) { cmp.enable(); }
        function enableDisableCriteriaQuantities() {
            var fn = me.includeAllProductsInput.getValue() ? disableCmp : enableCmp;
            var box = me.productsBox.down('radio').getValue() ? me.productsBox : me.categoriesBox;
            Ext.Array.each(box.query('[isFormField]'), fn);
        }

        function toggleEnabledCriteriaQuantities(toEnable) {
            var toDisable = toEnable === me.productsBox ? me.categoriesBox : me.productsBox,
                maximumQuantity = me.record.get("maximumQuantityPerRedemption"),
                isEdit = me.up('formform').isEdit();

            Ext.Array.each(toDisable.query('[isFormField]'), function(cmp) {
                if (cmp.xtype !== "radio") {
                    cmp.disable();
                }
                if (cmp.itemId === "maxQuantity") cmp.setValue(maximumQuantity);
            });
            toDisable.down('button').disable();
            Ext.Array.each(toEnable.query('[isFormField]'), function(cmp) {
                cmp.enable();
                if (cmp.itemId === "maxQuantity") {
                    cmp.setValue(toDisable.down('#maxQuantity').getValue() || (isEdit ? maximumQuantity : 1));
                }
            });
            toEnable.down('button').enable();
        }

        this.categoriesBox = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            //width: 600,
            items: [
                {
                    xtype: 'radio',
                    name: 'typeOfMinimumToEnforce',
                    value: 'category',
                    handler: function(box, isChecked) {
                        toggleEnabledCriteriaQuantities(isChecked ? me.categoriesBox : me.productsBox);
                    },
                    padding: '0 10px 0 0'
                },
                {
                    xtype: 'numberfield',
                    itemId: 'maxQuantity',
                    hideTrigger: true,
                    width: 80,
                    minValue: 1,
                    allowBlank: true,
                    labelAlign: 'right',
                    hideLabel: true,
                    listeners: {
                        change: function(f, newValue) {
                            me.maximumQuantityPerRedemptionTB.setValue(newValue);
                        }
                    }
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
                    handler: function() {
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
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'name',
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

        productStore.on({
            load: function () {
                this.productList.resetOriginalValue();
            },
            single: true,
            scope: this
        });

        this.productList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'products',
            width: 382,
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
                    xtype: 'radio',
                    name: 'typeOfMinimumToEnforce',
                    value: 'product',
                    padding: '0 10px 0 0'
                },
                {
                    xtype: 'numberfield',
                    itemId: 'maxQuantity',
                    hideTrigger: true,
                    width: 80,
                    minValue: 1,
                    allowBlank: true,
                    labelAlign: 'right',
                    hideLabel: true,
                    listeners: {
                        change: function(f, newValue) {
                            me.maximumQuantityPerRedemptionTB.setValue(newValue);
                        }
                    }
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
                    handler: function() {
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

        this.maximumQuantityPerRedemptionTB = Ext.widget({
            xtype: 'numberfield',
            name: 'maximumQuantityPerRedemption',
            hidden: true,
            hideTrigger: true,
            width: 600,
            minValue: 0,
            labelAlign: 'top',
            fieldLabel: 'Maximum Quantity Per Redemption'
        });

        this.productCategoryContainer = Ext.create('Ext.container.Container', {
            width: 600,

            items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    width: 600,
                    margin: '10 0 0 0',
                    items: [
                        this.includeAllProductsInput,
                        this.appliesToSaleProducts
                    ]
            },
            {
                xtype: 'component',
                html: 'Select the quantity of products that the shopper will receive the discount on:',
                cls: 'x-form-item-label x-unselectable x-form-item-label-top'
            },
                this.productsBox,
            {
                xtype: 'component',
                html: 'Select the quantity of products from the categories that the shopper will receive the discount on:',
                cls: 'x-form-item-label x-unselectable x-form-item-label-top'
            },
                this.categoriesBox,
                {
                    xtype: 'component',
                    html: '<hr />',
                    padding: '20px 0 0 0'
                },
                this.excludeCategoriesBox,
                this.productsExcludeBox,
                this.maximumQuantityPerRedemptionTB
            ]
        });


        shippingStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');

        zoneStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones');


        this.shippingList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingMethods',
            // width: 520,
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
            //displayField: 'Value',
            displayField: 'name',
            fieldLabel: 'Select Shipping Methods',
            valueField: 'code',

        });

        var trimmedZones = function() {
            var zones = me.record.get('shippingZones');
            if (!zones || zones.length === 0) return zones;
            for (var i = 0; i < zones.length; i++) {
                zones[i] = zones[i].trim();
            }
            return zones;
        }();

        this.shippingZoneList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingZones',
            // width: 520,
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
            //displayField: 'Value',
            displayField: 'code',
            fieldLabel: 'Select Shipping Zones',
            valueField: 'code',

        });

        this.items = [{
                xtype: 'component',
                html: 'Choose which products or categories are eligible to receive the discount if the conditions are met',
                margin: '15 0 0 0'
            }, {
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

        //// trying to fix the UI jump
        
        //this.on('boxready', function() {
        //    var scrollContainer = this.up('fulleditor').getEl(),
        //        el = this.getEl(),
        //        fixScroll = function() { console.log('trying?'); el.scrollIntoView(scrollContainer); }
        //    el.on('click', function() {
        //        console.log('wasclicked?');
        //        this.on('render', fixScroll, this, { single: true });
        //    }, this);
        //}, this, { single: true })

        this.on('boxready', function() {
            var products = this.record.get('products');
            var activeQuantityMeasure = (products && products.length) ? this.productsBox : this.categoriesBox;
            activeQuantityMeasure.down('radio').setValue(true);
            toggleEnabledCriteriaQuantities(activeQuantityMeasure);
            enableDisableCriteriaQuantities();
        }, this);

    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

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
        var gridStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products',
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        });

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        this.modal.on({
            savesuccess: function(modal, values) {
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
            return false;
        }
    },

    setShippingListVisibility: function (appliesToShipping) {
        this.shippingList.setVisible(appliesToShipping);
        this.shippingZoneList.setVisible(appliesToShipping);
        if (!appliesToShipping) {
            this.shippingList.setValue('');
            this.shippingZoneList.setValue('');
        }
    },

    //todo: gm split prodCat containter into include and exclude. On includeAll checked, then only show exclude.
    setProductCategoryContainerVisibility: function (isLineItem) {
        this.productCategoryContainer.setVisible(isLineItem);
        if (!isLineItem) {
            this.includeAllProductsInput.setValue(false);
            this.categoryList.setValue('');
            this.productList.setValue('');
            this.excludeCategoryList.setValue('');
            this.productExcludeList.setValue('');
        }
    },

    setFieldVisibility: function (isLineItem, appliesToShipping) {
        this.setVisible(isLineItem || appliesToShipping);
        this.setProductCategoryContainerVisibility(isLineItem);
        this.setShippingListVisibility(appliesToShipping);
    }

});