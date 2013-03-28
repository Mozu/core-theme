/**
* The discount editor view
*/
Ext.define('Taco.view.discount.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.CurrencyField', 'Taco.core.ux.action.SecondaryButton', 'Taco.view.category.Modal', 'Taco.view.product.Modal'],
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
    },

    //afterRender: function() {
//    //    var me = this,
//    //        typeInput = me.typeInput,
//    //        typeVal = typeInput.getValue(),
//    //        appliesInput = me.appliesInput
//    //        appliesVal = appliesInput.getValue();
//
    //    // show/hide the appropriate form elements.
    //    me.onAmountTypeChange(typeInput, typeVal);
    //    me.onAppliesToChange(appliesInput, appliesVal);
    //},

    buildFormComponents: function () {
        var me = this;

        me.nameInput = Ext.create('Ext.form.field.Text', {
            name: 'name',
            fieldLabel: "Name",
            labelAlign: 'top',
            allowBlank: false,
            emptyText: 'Enter a discount name'
        });

        me.typeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            fieldLabel: "Type",
            labelAlign: 'top',
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text','value'],
                data: [["Percentage", "Percentage"], ["Dollar Amount", "Amount"], ["Free Shipping", "FreeShipping"]]
            }),
            listeners: {
                change: me.onAmountTypeChange,
                scope: me
            }
        });

        // TODO: the beforeSubTpl / afterSubTpl template does not update when the other field's value changes.
        me.amountInput = Ext.create('Ext.form.field.Number', {
            name: 'amount',
            beforeSubTpl: [
                '<tpl>',
                    '<tpl if="this.isAmount()">',
                        '$',
                    '<tpl else>',
                        '',
                    '</tpl>',
                '</tpl>'
            ],
            afterSubTpl: [
                '<tpl>',
                    '<tpl if="this.isPercentage()">',
                        '% Off',
                    '<tpl elseif="this.isAmount()">',
                        'Off',
                    '<tpl else>',
                        '',
                    '</tpl>',
                '</tpl>',
                {
                    isPercentage: function() {
                        return me.typeInput.getValue() === "Percentage";
                    },
                    isAmount: function() {
                        return me.typeInput.getValue() === "Amount";
                    }
                }
            ]
        });

        me.appliesInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'targetType',
            fieldLabel: "Applies to",
            labelAlign: 'top',
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text','value'],
                data: [["All orders", "AllProducts"], ["Minimum orders of", "Order"], ["Selected Products/Categories", "Product"], ["Free Shipping", "FreeShipping"]]
            }),
            listeners: {
                change: me.onAppliesToChange,
                scope: me
            },
            value: "All orders"
        });

        me.minimumAmountInput = Ext.create('Ext.form.field.Number' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'minimumOrderAmount',
            fieldLabel: "Minimum Foster"
        });

        var catStore = me.record.getCategoryStore();

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.categoryList = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'categories',
            width: 400,
            store: catStore,
            getStore: function () { return catStore; },
            displayField: 'name',
            valueField: 'id',
            listConfig: {
                disableSelection: true,
                itemTpl: [
                    '<span class="x-boundlist-item-content">{name}</span>',
                    '<span class="x-boundlist-item-close"> Close</span>'
                ],
                listeners: {
                    itemclick: me.onCategoryListItemClick,
                    scope: this
                }
            }
        });

        // reset the list's dirty state when its store first loads
        catStore.on({
            load: function () { me.categoryList.resetOriginalValue(); },
            single: true,
            scope: this
        });

        me.categoriesBox = Ext.create('Taco.core.ux.form.FlexBox', {
            items: [
                {
                    xtype: 'box',
                    autoEl: 'hr'
                },
                {
                    xtype: 'secondarybutton',
                    text: 'Manage Scategories',
                    click: me.launchCategoryModal,
                    scope: me
                },
                me.categoryList,
                {
                    xtype: 'box',
                    autoEl: 'hr'
                },
            ]
        });

        var productStore = me.record.getProductStore();

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.productList = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'products',
            width: 400,
            store: productStore,
            getStore: function () { return productStore; },
            displayField: 'productName',
            valueField: 'productCode',
            listConfig: {
                disableSelection: true,
                itemTpl: [
                    '<span class="x-boundlist-item-content">{productName}</span>',
                    '<span class="x-boundlist-item-close"> Close</span>'
                ],
                listeners: {
                    itemclick: me.onCategoryListItemClick,
                    scope: this
                }
            }
        });

        // reset the list's dirty state when its store first loads
        productStore.on({
            load: function () { me.productList.resetOriginalValue(); },
            single: true,
            scope: this
        });

        me.productsBox = Ext.create('Taco.core.ux.form.FlexBox', {
            items: [
                {
                    xtype: 'box',
                    autoEl: 'hr'
                },
                {
                    xtype: 'secondarybutton',
                    text: 'Manage Products',
                    click: me.launchProductModal,
                    scope: me
                },
                me.productList,
                {
                    xtype: 'box',
                    autoEl: 'hr'
                },
            ]
        });

        me.datesInput = Ext.create('Taco.core.ux.form.FlexBox', {
            width: 400,
            defaults: {
                xtype: 'combobox',
                labelAlign: 'top',
                allowBlank: false,
                forceSelection: true,
                labelSeparator: '',
            },
            items: [
                {
                    //name: 'startDate',
                    fieldLabel: "Starts",
                    store: ["Now", "Soon"],
                    value: "Now"
                },
                {
                    //name: 'endDate',
                    fieldLabel: "Ends",
                    store: ["Never", "Someday"],
                    value: "Never"
                }
            ]
        });

        me.typeu = Ext.create('Taco.core.ux.form.FlexBox', {
            width: 800,
            items: [ me.typeInput, me.amountInput, me.amountLabel ]
        });

        me.appliesu = Ext.create('Taco.core.ux.form.FlexBox', {
            width: 800,
            items: [ me.appliesInput, me.minimumAmountInput ]
        });

        me.couponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: "Create coupon",
            labelAlign: 'right',
        });

        me.items = [
            me.nameInput,
            {
                xtype: 'box',
                autoEl: 'hr'
            },
            me.typeu,
            {
                xtype: 'box',
                autoEl: 'hr'
            },
            me.appliesu,
            me.categoriesBox,
            me.productsBox,
            me.datesInput,
            {
                xtype: 'box',
                autoEl: 'hr'
            },
            me.couponInput,
            {
                xtype: 'box',
                autoEl: 'hr'
            }
        ];
    },

    /*
        Sets the "Applies To" combobox to "Free Shipping" when appropriate.
    */
    onAmountTypeChange: function(input, value) {
        var me = this;

        // guard against this callback being called before the entire form is rendered
        if (!me.amountInput)
        {
            return;
        }

        me.amountInput.hide();

        if (value === "Percentage" || value === "Amount")
        {
            me.amountInput.show();

            if (me.appliesInput.getValue() === "FreeShipping")
            {
                me.appliesInput.select("AllProducts");
            }

            me.appliesInput.enable();
        }
        else if (value === "FreeShipping")
        {
            me.amountInput.hide();
            me.appliesInput.select("FreeShipping");
            me.appliesInput.disable();
        }

        // calling .select() does not fire the change event, fire it manually.
        me.appliesInput.fireEvent('change', me.appliesInput, me.appliesInput.getValue());
    },

    /*
        Shows or hides the "minimum order amount" input box based on discount type selection.
    */
    onAppliesToChange: function(input, value) {
        var me = this;

        // guard against this callback being called before the entire form is rendered
        if (!me.minimumAmountInput)
        {
            return;
        }

        if (value === "AllProducts")
        {
            me.minimumAmountInput.hide();
        }
        else
        {
            me.minimumAmountInput.show();
        }

        return;

        if (value === "Order" || value === "FreeShipping")
        {
            me.minimumAmountInput.show();
        }
        else
        {
            me.minimumAmountInput.hide();
        }
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function () {
        var list = this.categoryList,
            listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeBySite();
        
        Ext.destroy(this.modal);

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore,
            preselection: listStore.getRange()
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
    launchProductModal: function () {
        var list = this.productList,
            listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate( { type:'Taco.store.Products',  clearFilters: true, clearSort: true, autoLoad: true })
        ;
        
        Ext.destroy(this.modal);

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore,
            preselection: listStore.getRange()
        });

        this.modal.on({
            save: this.updateProductList,
            scope: this
        });
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

    /**
     * Populates the list with the selected values from the modal's TreePanel.
     * @param  {Taco.core.ux.modal.Modal} modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateCategoryList: function (modal, values) {
        var me = this,
            list = me.categoryList,
            store = list.getStore();

        store.remove(store.getRange());
        store.add(values);
        list.setValue(store.collect('id'));
    },

    /**
     * Populates the list with the selected values from the modal's GridPanel.
     * @param  {Taco.core.ux.modal.Modal} modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateProductList: function (modal, values) {
        var me = this,
            list = me.productList,
            store = list.getStore();

        store.remove(store.getRange());
        store.add(values);
        list.setValue(store.collect('productCode'));
    },



//////
/// OLD CODE
//////

    /**
    * Based on which type is selected, various values in the form are set-reset
    */
    toggleTargetTypeStoreData: function (type) {
        var me = this;

        if (type == "FreeShipping") {

            me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);

            me.targetTypeStore.loadData([{
                text: Taco.locale.Strings.get("discount-allproducts"),
                id: 'allproducts'
            }, {
                text: Taco.locale.Strings.get("discount-selectedproductsandcategories"),
                id: 'Product'
            }]);

            // Do stuff
            var targetType = me.tabForm.getForm().findField("targetType").getValue();
            me.minOrderAmountContainer.setVisible(false);

            switch (targetType) {
                case "Order":
                    me.selectorContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("allproducts");
                    break;
                case "Product":
                    me.selectorContainer.setVisible(true);
                    me.tabForm.getForm().findField("targetType").setValue("Product");
                    break;
                case "allproducts":
                    me.selectorContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("allproducts");
                    break;
                default:
                    me.selectorContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("allproducts");
                    break;
            }
        } else {

            me.tabForm.getForm().findField("shippingMethods").setValue([]);

            me.targetTypeStore.loadData([{
                text: Taco.locale.Strings.get("discount-allproducts"),
                id: 'allproducts'
            }, {
                text: Taco.locale.Strings.get("discount-selectedproductsandcategories"),
                id: 'Product'
            }, {
                text: co.locale.Strings.get("discount-minimumordersof"),
                id: 'Order'
            }]);

            var targetType = me.tabForm.getForm().findField("targetType").getValue();

            switch (targetType) {
                case "Order":
                    me.selectorContainer.setVisible(false);
                    me.minOrderAmountContainer.setVisible(true);
                    me.tabForm.getForm().findField("targetType").setValue("Order");
                    break;
                case "Product":
                    me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);
                    me.selectorContainer.setVisible(true);
                    me.minOrderAmountContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("Product");
                    break;
                case "allproducts":
                    me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);
                    me.selectorContainer.setVisible(false);
                    me.minOrderAmountContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("allproducts");
                    break;
                default:
                    me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);
                    me.selectorContainer.setVisible(false);
                    me.minOrderAmountContainer.setVisible(false);
                    me.tabForm.getForm().findField("targetType").setValue("allproducts");
                    break;
            }
        }
    },

    /**
    * Handler for the "Applies to" select list.
    */
    onTargetTypeChange: function (field, newVal, oldVal, opts) {
        var me = this;
        var selection = newVal[0].get("id");

        if (selection == "allproducts") {
            me.minOrderAmountContainer.setVisible(false);
            me.selectorContainer.setVisible(false);
            me.tabForm.getForm().findField("products").setValue([]);
            me.tabForm.getForm().findField("categories").setValue([]);
            me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);
        }

        if (selection == "Product") {
            me.minOrderAmountContainer.setVisible(false);
            me.selectorContainer.setVisible(true);
            me.tabForm.getForm().findField("minimumOrderAmount").setValue(0);
        }

        if (selection == "Order") {
            me.minOrderAmountContainer.setVisible(true);
            me.selectorContainer.setVisible(false);
            me.tabForm.getForm().findField("products").setValue([]);
            me.tabForm.getForm().findField("categories").setValue([]);
        }
    },

    /**
    * Handler for when the user attempts to navigate away from this view
    */
    onNavigate: function (newState) {
        var md = newState.getMetaData();
        if (md.controller && md.controller === "discounts" && (md.action === "index" || !md.action)) {
            this.destroy();
            return false;
        }
    },

    /**
    * Handler to set the amount field. The model has a single field for both dollar amount and percentage.
    * This function determines which is active and retrieves the correct value.
    */
    onBeforeSave: function () {
        var me = this,
            atype = this.down('[name=amountType]').value,
            percentageField = me.percentageField,
            currencyField = me.currencyField,
            amountField = me.amountField;

        if (atype === 'Amount')
            amountField.setValue(currencyField.getValue());
        else if (atype === 'Percentage')
            amountField.setValue(percentageField.getValue());
    },

    /**
    * Dirty state stuff
    */
    onFormStateChange: function (form) {
        if (!this.dirtyButton) {
            return;
        }
        if (!form || !form.isValid || !form.isDirty) {
            form = this.tabForm.getForm();
        }
        this.dirtyButton.setDirty(form.isValid() && form.isDirty());
    }
});

