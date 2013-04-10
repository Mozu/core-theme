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
    initComponent: function () {
        this.buildFormComponents();
        this.callParent(arguments);
    },
    buildFormComponents: function () {
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
            emptyText: 'Enter a discount name'
        });
        me.amountTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            fieldLabel: "Type",
            labelAlign: 'top',
            // hideEmptyLabel:true,
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            
            flex:1,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Percentage", "Percentage"],
                    ["Dollar Amount", "Amount"],
                 //   ["Free Shipping", "FreeShipping"]
                ]
            }),
            listeners: {
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
            hideTrigger: true
        });
        me.targetTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'targetType',
            fieldLabel: "Applies to",
            labelAlign: 'top',
            allowBlank: false,
            flex:1,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["All orders", "AllProducts"],
                    ["Minimum orders of", "Order"],
                    ["Selected Products/Categories", "Product"]
                ]
            }),
            listeners: {
                change: me.onAppliesToChange,
                scope: me
            },
            value: "All orders"
        });
        me.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.UnitField' /*'Taco.core.ux.form.CurrencyField'*/, {
            name: 'minimumOrderAmount',
            unitString: '$',
            unitAtEnd:false
        });
        var catStore = me.record.getCategoryStore();
        
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.categoryList = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'categories',
            flex: 1,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            
            displayField: 'name',
            valueField: 'id',
            fieldLabel: 'Select Categories',
            listConfig: {
                disableSelection: true,
                itemTpl: ['<span class="x-boundlist-item-content">{name}</span>', '<span class="x-boundlist-item-close"> Close</span>'],
                listeners: {
                    itemclick: me.onCategoryListItemClick,
                    scope: this
                }
            }
        });
        // reset the list's dirty state when its store first loads
        catStore.on({
            load: function () {
                me.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        me.categoriesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align:'bottom'
            },
            items: [
                
                me.categoryList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: me.launchCategoryModal,
                    scope: me
                },
            ]
        });
        var productStore = me.record.getProductStore();
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.productList = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'products',
            flex:1,
            store: productStore,
            getStore: function () {
                return productStore;
            },
            displayField: 'productName',
            fieldLabel:'Select Products',
            valueField: 'productCode',
            listConfig: {
                disableSelection: true,
                itemTpl: ['<span class="x-boundlist-item-content">{productName}</span>', '<span class="x-boundlist-item-close"> Close</span>'],
                listeners: {
                    itemclick: me.onCategoryListItemClick,
                    scope: this
                }
            }
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
                align:'bottom'
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
            width:600,
            items: [
                me.categoriesBox,
                me.productsBox
            ]
        });

        me.datesContainer = Ext.create('Ext.container.Container',{
            layout: {
                type:'hbox',
                align:'bottom'
            },
            width: 600,
            defaults: {
                xtype: 'combobox',
                labelAlign: 'top',
                allowBlank: false,
                forceSelection: true,
                labelSeparator: '',
            },
            items: [{
                //name: 'startDate',
                fieldLabel: "Starts",
                store: ["Now", "Soon"],
                value: "Now"
            }, {
                //name: 'endDate',
                fieldLabel: "Ends",
                store: ["Never", "Someday"],
                value: "Never"
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
                        me.couponCodeInput.show();
                    } else {
                        me.couponCodeInput.hide();
                    }
                },
                scope:me
            }
        });
        me.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            width: 600,
            hidden: !(me.record.get('couponCode') || me.record.get('requiresCoupon'))
        });

        me.items = [
            me.nameInput,
            createHr(),
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width:600,
                items: [
                    me.amountTypeInput,
                    me.amountPrefix,
                    me.amountInput,
                    me.amountSuffix]
            },
            createHr(),
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width: 600,
                items: [me.targetTypeInput, me.minimumOrderAmountInput]
            }, 
            me.productCategoryContainer,
            createHr(),
            me.datesContainer,
            createHr(),
            me.requiresCouponInput,
            me.couponCodeInput
        ];
    },
    

    /*
        Sets the "Applies To" combobox to "Free Shipping" when appropriate.
    */
    onAmountTypeInputChange: function (input, value) {
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
        if (value === "Percentage" || value === "Amount") {
            me.amountInput.show();
            if (me.targetTypeInput.getValue() === "Product") {
                me.targetTypeInput.select("AllProducts");
                me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
            }
            me.targetTypeInput.enable();
        } else if (value === "FreeShipping") {
            me.amountInput.hide();
            me.amountInput.setValue(0);
          
        }
        // calling .select() does not fire the change event, fire it manually.
        //me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
    },
    /*
        Shows or hides the "minimum order amount" input box based on discount type selection.
    */
    onAppliesToChange: function(input, value) {
        var me = this;
        // guard against this callback being called before the entire form is rendered
        if (!me.minimumOrderAmountInput) {
            return;
        }
        if (value === "Order") {
            me.minimumOrderAmountInput.show();

        } else {
            me.minimumOrderAmountInput.hide();
            me.minimumOrderAmountInput.setValue(0);
            me.productList.setValue([]);
            me.categoryList.setValue([]);

            
        }
        if (value === "Product") {
            me.productCategoryContainer.show();
        } else {
            me.productCategoryContainer.hide();

            me.productList.setValue([]);
            me.categoryList.setValue([]);

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
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });
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
   
});