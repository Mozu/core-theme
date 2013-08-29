/**
 * The discount editor view
 */
Ext.define('Taco.view.discount.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.store.ConfiguredShippingRates', 'Ext.ux.form.field.BoxSelect', 'Taco.core.ux.form.DateTime', 'Taco.core.ux.form.CurrencyField', 'Taco.core.ux.action.SecondaryButton', 'Taco.view.category.Modal', 'Taco.view.product.Modal'],
    // requires: ['Taco.model.CouponCode', 'Taco.core.ux.form.DateTime', 'Taco.core.ux.form.BoxSelect', 'Taco.store.ProductComboBox', 'Taco.core.ux.modal.Content', 'Taco.core.ux.modal.ContentWithActions', 'Taco.core.ux.form.UnitField', 'Taco.core.ux.form.CurrencyField'],
    title: 'Discount',
    // model: 'Taco.model.Discount',
    // type: 'discount',
    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: ''
    },
    initComponent: function() {
        this.buildFormComponents();
        this.callParent(arguments);
        this.setFieldVisibility();
    },
    buildFormComponents: function() {
        var me = this,
            createHr = function() {
                return {
                    xtype: 'box',
                    autoEl:
                        'hr'
                };
            };
        me.nameInput = Ext.create('Ext.form.field.Text', {
            name: 'name',
            fieldLabel: "Name",
            labelAlign: 'top',
            allowBlank: false,
            width: 600,
            enforceMaxLength: true,
            maxLength: 80,
            emptyText: 'Enter a discount name'
        });

        me.scoptTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'scope',
            fieldLabel: "Discount Scope",
            labelAlign: 'top',
            editable: false,
            // hideEmptyLabel:true,
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            width: 600,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["LineItem", "LineItem"],
                    ["Order", "Order"]
                ]
            })
        });

        me.amountTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            fieldLabel: "Type",
            labelAlign: 'top',
            // hideEmptyLabel:true,
            allowBlank: false,
            editable: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',

            flex: 1,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Percentage", "Percentage"],
                    ["Dollar Amount", "Amount"],
                    ["Free", "Free"]

                    //   ["Free Shipping", "FreeShipping"]
                ]
            }),
            listeners: {
                afterrender: me.setTypeFieldVisibility,
                change: me.onAmountTypeInputChange,
                scope: me
            }
        });
        me.amountPrefix = Ext.create('Ext.Component', {
            tpl: ['<tpl>',
                '<tpl if="amountType == \'Amount\' ">',
                '$',
                '</tpl>',
                '</tpl>'],
            padding: '0 5 5 5',
            data: this.record.data
        });
        me.amountSuffix = Ext.create('Ext.Component', {
            tpl: ['<tpl>',
                '<tpl if="amountType == \'Percentage\' ">',
                '% Off',
                '</tpl>',
                '<tpl if="amountType == \'Amount\' ">',
                'Off',
                '</tpl>',
                '</tpl>'],
            padding: '0 5 5 5',
            data: this.record.data
        });
        me.amountInput = Ext.create('Ext.form.field.Number', {
            name: 'amount',
            minValue: 0,
            hideTrigger: true
        });
        me.targetTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'target',
            fieldLabel: "Applies to",
            labelAlign: 'top',
            editable: false,
            allowBlank: false,
            width: 600,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Product", "Product"],
                    ["Shipping", "Shipping"]
                ]
            }),
            listeners: {
                change: me.setFieldVisibility,
                scope: me
            },
            value: "Product"
        });


        me.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'minimumOrderAmount',
            fieldLabel: "Minimum Order Amount",
            labelAlign: 'top',
            width: 600,
            unitString: '$',
            emptyText: '0',
            unitAtEnd: false
        });


        me.includeAllProductsInput = Ext.widget({
            xtype: 'checkbox',
            name: 'includeAllProducts',
            fieldLabel: 'Applies to All Products',
            labelAlign: 'top',
            width: 600,
            value: this.record.get('includeAllProducts'),
            listeners: {
                change: me.setFieldVisibility,
                scope: me
            }
        });

        var catStore = me.record.getCategoryStore();

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categories',
            flex: 1,
            store: catStore,
            getStore: function() {
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
        // reset the list's dirty state when its store first loads
        catStore.on({
            load: function() {
                me.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        me.categoriesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                me.categoryList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: me.launchCategoryModal,
                    scope: me
                }
            ]
        });
        var productStore = me.record.getProductStore();

        var shippingStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ConfiguredShippingRates');


        me.shippingList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'shippingMethods',
            flex: 1,
            store: shippingStore,
            getStore: function() {
                return shippingStore;
            },
            queryMode :'local',
            width: 600,
            hidden: this.record.get('target')!='Shipping',
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            value: this.record.get('shippingMethods'),
            displayField: 'Value',
            fieldLabel: 'Select Shipping Methods',
            valueField: 'Key'
        });        

        me.productList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'products',
            flex: 1,
            store: productStore,
            getStore: function() {
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
            //listConfig: {
            //    disableSelection: true,
            //    itemTpl: ['<span class="x-boundlist-item-content">{productName}</span>', '<span class="x-boundlist-item-close"></span>'],
            //    listeners: {
            //        itemclick: me.onCategoryListItemClick,
            //        scope: this
            //    }
            //}
        });

        // reset the list's dirty state when its store first loads
        productStore.on({
            load: function () {
                me.productList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        me.productsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [
                me.productList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: me.launchProductModal,
                    scope: me
                }
            ]
        });


        me.productCategoryContainer = Ext.create('Ext.container.Container', {
            width: 600,
            
            items: [
                me.includeAllProductsInput,
                me.categoriesBox,
                me.productsBox
            ]
        });

        me.datesContainer = Ext.create('Ext.container.Container', {
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
        me.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: "Create coupon",
            labelAlign: 'right',
            listeners: {
                change: function(cb, newValue) {
                    if (newValue) {
                        me.couponCodeBox.show();
                    } else {
                        me.couponCodeBox.hide();
                    }
                },
                scope: me
            }
        });
        me.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            width: 500,
        });
        me.couponCodeBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            hidden: !(me.record.get('couponCode') || me.record.get('requiresCoupon')),
            items: [
                me.couponCodeInput,
                {
                    xtype: 'secondarybutton',
                    text: 'Random',
                    click: function() {
                        var randomizer = Ext.data.IdGenerator.get('uuid'),
                            code = randomizer.generate().replace(/[^0-9a-z]/g, "").substr(0, 8).toUpperCase();
    
                        me.couponCodeInput.setValue( code );
                    }
                }
            ]
        });

        me.items = [
            me.nameInput,
            me.scoptTypeInput,
            //createHr(),
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width: 600,
                items: [
                    me.amountTypeInput,
                    me.amountPrefix,
                    me.amountInput,
                    me.amountSuffix]
            },
            me.targetTypeInput,
            me.minimumOrderAmountInput,
            me.productCategoryContainer,
            me.shippingList,
            // createHr(),
            me.datesContainer,
            //createHr(),
            me.requiresCouponInput,
            me.couponCodeBox
        ];


        
    },
    

    /*
        Sets the "Applies To" combobox to "Free Shipping" when appropriate.
    */
    onAmountTypeInputChange: function(input, value) {
        var me = this;

        if (!me.rendered) {
            //return;
        }

        me.amountPrefix.update(me.form.getValues());

        me.amountSuffix.update(me.form.getValues());

        // guard against this callback being called before the entire form is rendered
        if (!me.amountInput) {
            return;
        }

        //me.amountInput.hide();

        me.setTypeFieldVisibility(me.amountTypeInput);

        // calling .select() does not fire the change event, fire it manually.
        //me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
    },
    
    setTypeFieldVisibility: function (input) {
        var me = this,
            value = input.getValue();

        if (value === 'Free') {
            me.amountInput.hide();

            me.amountInput.setValue(0);
        } else {
            me.amountInput.show();

            if (me.targetTypeInput.getValue() === "Product") {
                me.targetTypeInput.select("AllProducts");
                me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
            }

            me.targetTypeInput.enable();

            me.amountInput.setMaxValue(value === 'Percentage' ? 100 : Number.MAX_VALUE);
        }
    },


    setFieldVisibility:function () {
        var me = this;
        me.includeAllProductsInput.setVisible(me.targetTypeInput.getValue() != 'Shipping');
        me.shippingList.setVisible(me.targetTypeInput.getValue() == 'Shipping');
        me.categoriesBox.setVisible(!me.includeAllProductsInput.getValue());
        me.productsBox.setVisible(!me.includeAllProductsInput.getValue());
        
    },
    
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function() {
        var list = this.categoryList,
            listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeBySite();
        //Ext.destroy(this.modal);
        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });
        this.modal.on({
            save: this.updateCategoryList,
            scope: this
        });
    },
    /**
     * Opens a modal with a list of products.
     * @private
     */
    launchProductModal: function() {
        var list = this.productList,
            listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });
        
        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        // Simeon: removing this, as its not needed for a Ext.window.
        //this.add(this.modal);

        this.modal.on({
            save: this.updateProductList,
            scope: this
        });

        if (this.modal) {
            this.modal.down('grid').getSelectionModel().deselectAll();
            this.modal.show();
            return;
        }



    },
    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onCategoryListItemClick: function(view, record, item, index, e) {
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
    /**
     * Populates the list with the selected values from the modal's TreePanel.
     * @param  {Taco.core.ux.modal.Modal} modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateCategoryList: function(modal, values) {
        var me = this,
            list = me.categoryList,
            store = list.getStore();
        Ext.each(values, function(value) {
            if (!store.data.getByKey(value.getId())) {
                store.add(value);
            }
        });


        list.setValue(store.collect('id'));

    },
    /**
     * Populates the list with the selected values from the modal's GridPanel.
     * @param  {Taco.core.ux.modal.Modal} modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateProductList: function(modal, values) {
        var me = this,
            list = me.productList,
            store = list.getStore();
        
        Ext.each(values, function(value) {
            if (!store.data.getByKey(value.getId())) {
                store.add(value);
            }
        });


        list.setValue(store.collect('productCode'));
    }
});