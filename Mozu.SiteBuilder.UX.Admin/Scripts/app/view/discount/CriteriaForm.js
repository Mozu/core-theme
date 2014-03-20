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
        var me  = this;

        this.includeAllProductsInput = Ext.widget({
            xtype: 'checkbox',
            name: 'includeAllProducts',
            boxLabel: 'Applies to All Products',
            width: 300,
            value: this.record.get('includeAllProducts'),
            listeners: {
                change: function () {
                    this.parentForm.setFieldVisibility();
                },
                scope: this
            }
        });

        this.appliesToSaleProducts = Ext.widget({
            xtype: 'checkbox',
            name: 'doesNotApplyToSalePrice',
            boxLabel: 'Does Not Apply to On Sale Products',
            width: 300,
            value: this.record.get('doesNotApplyToSalePrice') === true
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
                this.categoriesBox,
                this.productsBox,
                this.exclueCategoriesBox,
                this.productsExcludeBox
            ]
        });

        
        var shippingStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');        
        shippingStore.filter(function (record) {            
            return (record.get('isConfigured') ||  record.get("rateProvider")=="custom");
        });

        this.shippingList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingMethods',
            flex: 1,
            store: shippingStore,
            getStore: function () {
                return shippingStore;
            },
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
            valueField: 'code'
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
            this.shippingList
        ];

        this.callParent(arguments);

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
    },

    setShippingListVisibility: function (appliesToShipping) {
        this.shippingList.setVisible(appliesToShipping);
        if (!appliesToShipping) {
            this.shippingList.setValue('');
        }
    },

    //todo: gm split prodCat containter into include and exclude. On includeAll checked, then only show exclude.
    setProductCategoryContainerVisibility: function(isLineItem) {
        this.productCategoryContainer.setVisible(isLineItem);
        if (!isLineItem) {
            this.includeAllProductsInput.setValue(false);
            this.categoryList.setValue('');
            this.productList.setValue('');
            this.exclueCategoryList.setValue('');
            this.productExcludeList.setValue('');
        }
    },

    setFieldVisibility: function (isLineItem, appliesToShipping) {
        this.setVisible(isLineItem || appliesToShipping);
        this.setProductCategoryContainerVisibility(isLineItem);
        this.setShippingListVisibility(appliesToShipping);
    }

});