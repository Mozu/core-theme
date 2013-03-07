/**
* The discount editor view
*/
Ext.define('Taco.view.pageTemplates.Edit', {
    extend: 'Taco.core.ux.form.Editor',
    requires: ['Taco.model.CouponCode', 'Taco.core.ux.form.DateTime', 'Taco.core.ux.form.BoxSelect', 'Taco.store.ProductComboBox', 'Taco.core.ux.modal.Content', 'Taco.core.ux.modal.ContentWithActions', 'Taco.core.ux.form.UnitField', 'Taco.core.ux.form.CurrencyField'],
    title: 'New Discount',
    model: 'Taco.model.Discount',
    type: 'discount',
    displayAssociations: [],

    initComponent: function () {
        var me = this;

        if (me.recordId.isModel && me.recordId.get("name") != Ext.emptyString) {
            me.title = 'Discount / ' + me.recordId.get("name");
        }

        me.on({
            load: {
                fn: me.onLoad,
                scope: me
            },
            beforeSave: {
                fn: me.onBeforeSave,
                scope: me
            }
        });

        me.minOrderAmountContainer = Ext.create('Ext.container.Container', {
            width: 500,
            layout: {
                type: 'hbox'
            },
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float'
            },
            items: [
                {
                    xtype: 'label',
                    forId: 'type',
                    width: 5,
                    text: '$',
                    margin: '55 5 0 0'
                },
                {
                    name: 'minimumOrderAmount',
                    width: 60,
                    allowBlank: false,
                    fieldLabel: '&nbsp;'
                },
                me.amountLabel]
        });

        me.typeContainer = Ext.create('Ext.container.Container', {
            width: 500,
            layout: {
                type: 'hbox'
            },
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float'
            },
            items: [
                    {
                        xtype: 'unitfield',
                        name: 'amount-percent',
                        itemId: 'amount-discount-percent',
                        unitString: '%',
                        minValue: 1,
                        maxValue: 100,
                        value: 5,
                        width: 60,
                        allowBlank: false,
                        fieldLabel: '&nbsp;',
                        submitValue: false
                    },
                    {
                        xtype: 'currencyfield',
                        name: 'amount-currency',
                        itemId: 'amount-discount-currency',
                        width: 60,
                        value: 1,
                        allowBlank: false,
                        fieldLabel: '&nbsp;',
                        submitValue: false
                    },
                    {
                        xtype: 'label',
                        cls: 'amountlabel',
                        forId: 'amount',
                        text: Taco.locale.Strings.get("discount-off"),
                        margin: '56 0 0 0'
                    },
                    {
                        xtype: 'hiddenfield',
                        itemId: 'amount',
                        name: 'amount'
                    }
                ]
        });

        me.startDate = Ext.create('Taco.core.ux.form.DateTime', {
            name: 'startDate',
            fieldLabel: Taco.locale.Strings.get("discount-starts"),
            emptyText: Taco.locale.Strings.get("discount-now"),
            labelAlign: 'top',
            labelSeparator: '',
            width: 230,
            componentCls: 'taco-form-field-float'
        });

        me.endDate = Ext.create('Taco.core.ux.form.DateTime', {
            name: 'endDate',
            emptyText: Taco.locale.Strings.get("discount-never"),
            fieldLabel: Taco.locale.Strings.get("discount-ends"),
            labelAlign: 'top',
            labelSeparator: '',

            width: 230,
            componentCls: 'taco-form-field-float'
        });

        me.dateRangeContainer = Ext.create('Ext.container.Container', {
            width: 500,
            layout: {
                type: 'hbox'
            },
            items: [me.startDate, me.endDate]
        });

        me.couponContainer = Ext.create('Ext.container.Container', {
            width: 500,
            layout: {
                type: 'hbox'
            },
            defaults: {
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float'
            },
            items: [{
                xtype: 'textfield',
                name: 'couponCode',
                emptyText: Taco.locale.Strings.get("discount-entercode"),
                width: 250
            }, {
                xtype: 'button',
                height: 30,
                text: Taco.locale.Strings.get("discount-randomcode"),
                handler: me.onRandomButtonClick,
                scope: me
            }]
        });

        me.selectorContainer = Ext.create('Ext.container.Container', {
            width: 700,
            layout: {
                type: 'vbox'
            },
            defaults: {
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float'
            },
            items: [{
                name: 'categories',
                fieldLabel: Taco.locale.Strings.get("discount-categories"),
                width: 550,
                minChars: 2,
                xtype: 'boxselect',
                cls: 'taco-boxselect',
                queryMode: 'local',
                store: { type: 'Taco.store.Categories', autoLoad: true, id: 'categoryComboBox' },
                displayField: 'path',
                valueField: 'id',
                shortField: 'name',
                triggerOnClick: false,
                pinList: false,
                onTriggerClick: function () {
                    var me = this,
                            categoryModal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
                                combobox: me,
                                autoShow: true,
                                autoSize: true,
                                isValid: true,
                                isDirty: true,
                                title: Taco.locale.Strings.get("discount-selectcategories"),
                                listeners: {
                                    save: function () {
                                        var s = this.down('categoryselector').getChecked();
                                        this.combobox.setValue(Ext.Array.pluck(s, 'internalId'));
                                        this.hide();
                                    }
                                },
                                items: [{
                                    xtype: 'categoryselector',
                                    selected: me.getValue(),
                                    height: 400,
                                    width: 600,
                                    flex: 0,
                                    showCheckBoxes: true,
                                    enableRowReorder: false
                                }]
                            });
                }
            }, {
                name: 'products',
                fieldLabel: Taco.locale.Strings.get("discount-products"),
                width: 550,
                minChars: 2,
                xtype: 'boxselect',
                cls: 'taco-boxselect',
                store: Ext.create('Taco.store.ProductComboBox'),
                displayField: 'display',
                valueField: 'value',
                shortField: 'display',
                triggerOnClick: false,
                pinList: false,
                onTriggerClick: function () {
                    var me = this,
                            productModal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
                                combobox: me,
                                autoShow: true,
                                autoSize: true,
                                isValid: true,
                                isDirty: true,
                                title: Taco.locale.Strings.get("discount-selectproducts"),
                                listeners: {
                                    save: function () {
                                        var s = this.down('gridpanel').getSelectionModel().getSelection();
                                        this.combobox.setValue(Ext.Array.pluck(s, 'internalId'));
                                        this.hide();
                                    }
                                },
                                items: [{
                                    xtype: 'gridpanel',
                                    height: 400,
                                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                                        checkOnly: true
                                    }),
                                    store: Ext.create('Taco.store.Products', { autoLoad: true }),
                                    columns: [{
                                        header: 'Name',
                                        dataIndex: 'productName',
                                        flex: 1
                                    }],
                                    listeners: {
                                        afterrender: function () {
                                            this.getStore().on({
                                                load: function () {
                                                    var products = new Array();
                                                    var selected = me.getValue();
                                                    var store = this.getStore();

                                                    Ext.Array.each(selected, function (productId, index, list) {
                                                        var p = store.getById(productId);
                                                        if (p) {
                                                            products.push(p);
                                                        }
                                                    });

                                                    if (products.length > 0) {
                                                        this.getSelectionModel().select(products, true, true);
                                                    }
                                                },
                                                scope: this
                                            });
                                        }
                                    }
                                }]
                            });
                }
            }]
        });

        me.shippingContainer = Ext.create('Ext.container.Container', {
            width: 700,
            layout: {
                type: 'vbox'
            },
            defaults: {
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float'
            },
            items: [{
                name: 'shippingMethods',
                fieldLabel: Taco.locale.Strings.get("discount-shippingmethods"),
                width: 550,
                minChars: 2,
                xtype: 'boxselect',
                cls: 'taco-boxselect',
                store: Ext.create('Taco.store.TargetedShippingMethods'),
                displayField: 'name',
                valueField: 'code',
                shortField: 'name',
                triggerOnClick: false,
                pinList: false,
                onTriggerClick: function () {
                    var me = this,
                            shippingMethodModal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
                                combobox: me,
                                autoShow: true,
                                autoSize: true,
                                isValid: true,
                                isDirty: true,
                                title: Taco.locale.Strings.get("discount-selectshippingmethods"),
                                listeners: {
                                    save: function () {
                                        var s = this.down('gridpanel').getSelectionModel().getSelection();
                                        var selections = new Array();

                                        Ext.Array.each(s, function (sel, index, list) {
                                            selections.push({ code: sel.get("code") });
                                        });

                                        this.combobox.setValue(Ext.Array.pluck(selections, 'code'));
                                        this.hide();
                                    }
                                },
                                items: [{
                                    xtype: 'gridpanel',
                                    height: 400,
                                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                                        checkOnly: true
                                    }),
                                    store: Ext.create('Taco.store.TargetedShippingMethods', { autoLoad: true }),
                                    columns: [{
                                        header: 'Name',
                                        dataIndex: 'name',
                                        flex: 1
                                    }],
                                    listeners: {
                                        afterrender: function () {
                                            this.getStore().on({
                                                load: function () {
                                                    var methods = new Array();
                                                    var selected = me.getValue();
                                                    var store = this.getStore();

                                                    Ext.Array.each(selected, function (code, index, list) {
                                                        var m = store.getById(code);
                                                        if (m) {
                                                            methods.push(m);
                                                        }
                                                    });

                                                    if (methods.length > 0) {
                                                        this.getSelectionModel().select(methods, true, true);
                                                    }
                                                },
                                                scope: this
                                            });
                                        }
                                    }
                                }]
                            });
                }
            }]
        });

        me.targetTypeStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data: [{
                text: Taco.locale.Strings.get("discount-allproducts"),
                id: 'allproducts'
            }, {
                text: Taco.locale.Strings.get("discount-selectedproductsandcategories"),
                id: 'Product'
            }, {
                text: Taco.locale.Strings.get("discount-minimumordersof"),
                id: 'Order'
            }]
        });

        me.tabs = [{
            title: 'Basic Info',
            layout: {
                type: 'vbox'
            },
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float',
                width: 500
            },
            items: [{
                name: 'name',
                width: 550,
                fieldLabel: Taco.locale.Strings.get("discount-name"),
                emptyText: 'Example: \"Free shipping on all orders over $100\"',
                allowBlank: false
            }, {
                xtype: 'container',
                width: 420,
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeparator: '',
                    componentCls: 'taco-form-field-float'
                },
                items: [{
                    name: 'amountType',
                    xtype: 'combo',
                    fieldLabel: Taco.locale.Strings.get("discount-type"),
                    labelAlign: 'top',
                    width: 250,
                    queryMode: 'local',
                    displayField: 'text',
                    valueField: 'id',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', 'text'],
                        data: [{
                            text: Taco.locale.Strings.get("discount-percentage"),
                            id: 'Percentage'
                        }, {
                            text: Taco.locale.Strings.get("discount-dollaramount"),
                            id: 'Amount'
                        }, {
                            text: Taco.locale.Strings.get("discount-freeshipping"),
                            id: 'FreeShipping'
                        }]
                    }),
                    listeners: {
                        select: me.onTypeChange,
                        scope: me
                    }
                },
                    me.typeContainer]
            },
                me.shippingContainer,
                {
                    xtype: 'container',
                    width: 420,
                    layout: {
                        type: 'hbox'
                    },
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'top',
                        labelSeparator: '',
                        componentCls: 'taco-form-field-float'
                    },
                    items: [{
                        name: 'targetType',
                        xtype: 'combo',
                        fieldLabel: Taco.locale.Strings.get("discount-appliesto"),
                        labelAlign: 'top',
                        width: 250,
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'id',
                        store: me.targetTypeStore,
                        listeners: {
                            select: me.onTargetTypeChange,
                            scope: me
                        }
                    },
                    me.minOrderAmountContainer]
                },
                me.selectorContainer,
                me.dateRangeContainer,
                {
                    name: "requiresCoupon",
                    xtype: "checkbox",
                    boxLabel: Taco.locale.Strings.get("discount-createcoupon"),
                    listeners: {
                        change: me.onCouponChange,
                        scope: me
                    }
                },
                me.couponContainer]
        }];

        me.actions = [{
            xtype: 'secondarybutton',
            text: 'Cancel',
            eventName: 'cancel'
        }, {
            xtype: 'dirtybutton',
            text: 'Save',
            eventName: 'save'
        }];

        me.callParent(arguments);

        // save some accessors for later
        me.percentageField = me.typeContainer.getComponent('amount-discount-percent'),
            me.currencyField = me.typeContainer.getComponent('amount-discount-currency'),
            me.amountField = me.typeContainer.getComponent('amount');

        me.setInitialState();
    },

    /**
    * Handler that generates a random coupon code and displays its value in the couponCode field
    */
    onRandomButtonClick: function () {
        var me = this;

        Taco.model.CouponCode.load(1, {
            success: function (record, op) {
                me.tabForm.getForm().findField("couponCode").setValue(record.get("code"));
            }
        });
    },

    /**
    * The state of this editor varies based on the data. This method wires up the initial state based on the 
    * data the editor is initialized with
    */
    setInitialState: function () {
        var me = this,
                ttype = me.recordId.get("targetType"),
                atype = me.recordId.get("amountType"),
                percentageField = me.percentageField,
                currencyField = me.currencyField,
                amountField = me.amountField;

        if (me.recordId.get("amountType") == Ext.emptyString) {
            // This is a new discount
            me.tabForm.getForm().findField("amountType").setValue("Percentage");
            me.tabForm.getForm().findField("targetType").setValue("allproducts");
            me.shippingContainer.setVisible(false);
            me.selectorContainer.setVisible(false);
            me.couponContainer.setVisible(false);
            me.minOrderAmountContainer.setVisible(false);
            percentageField.setVisible(true);
            currencyField.setVisible(false);
        } else {
            me.couponContainer.setVisible(me.recordId.get("requiresCoupon"));
            me.selectorContainer.setVisible(ttype == "Product");
            me.shippingContainer.setVisible(atype == "FreeShipping");
            me.minOrderAmountContainer.setVisible(ttype == "Order");
            me.typeContainer.setVisible(atype != "FreeShipping");
            percentageField.setVisible(atype == "Percentage");
            currencyField.setVisible(atype == "Amount");
        }

        percentageField.setValue(amountField.getValue()).resetOriginalValue();
        currencyField.setValue(amountField.getValue()).resetOriginalValue();
    },

    /**
    * Handler for when the "Create coupon" checkbox is selected/de-selected
    */
    onCouponChange: function (field, newVal, oldVal, opts) {
        var me = this;

        if (!newVal) {
            me.tabForm.getForm().findField("couponCode").setValue(Ext.emptyString);
        }

        me.couponContainer.setVisible(newVal);
    },

    /**
    * Handler for when the "Type" selector value changes. This change cause several components to hide/show.
    */
    onTypeChange: function (field, newVal, oldVal, opts) {
        var me = this;
        var selection = newVal[0].get("id");
        var percentageField = me.percentageField,
                currencyField = me.currencyField;

        if (selection == "Percentage") {
            me.toggleTargetTypeStoreData(selection);
            me.typeContainer.setVisible(true);
            me.shippingContainer.setVisible(false);
            percentageField.setVisible(true);
            currencyField.setVisible(false);
        }

        if (selection == "Amount") {
            me.toggleTargetTypeStoreData(selection);
            me.typeContainer.setVisible(true);
            me.shippingContainer.setVisible(false);
            percentageField.setVisible(false);
            currencyField.setVisible(true);
        }

        if (selection == "FreeShipping") {
            me.toggleTargetTypeStoreData(selection);
            me.typeContainer.setVisible(false);
            //me.amountLabel.setText("SHIPPING");
            me.shippingContainer.setVisible(true);
            percentageField.setVisible(false);
            currencyField.setVisible(false);
        }
    },

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

