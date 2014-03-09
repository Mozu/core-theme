/**
 * @class Taco.view.price.subform.General
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.General', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productgeneralsubform',
    requires: [
        'Taco.core.ux.HtmlEditor',
        'Taco.view.product.subform.OverrideForm',
        'Ext.form.field.ComboBox',
        'Taco.view.product.subform.Bundle',
        'Taco.core.ux.form.Form',
        'Ext.data.Store',
        'Ext.form.field.Text',
        'Taco.shared.view.field.Image',
        'Taco.core.ux.form.SelectField',
        'Taco.store.ProductTypes'
    ],

    title: 'General',
    margin: '20 0',
    initComponent: function () {
        var me = this,
            readOnly,
            requiredContent,
            visable;


        // get the data from the preloaded product type store;
        var tempProductTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        // need to cache the data because other stores are requesting the store to be loaded and its reseting the filters;
        var data = Ext.clone(tempProductTypeStore.data.items);

        this.productTypeStore = Ext.create('Ext.data.Store', {
            model: "Taco.model.ProductType",
            data:data
        });

        // filter out the base productType, its not allowed to be a basis for products
        // note: the store is set to auto clear filters so this filter should not effect other stores.
        this.productTypeStore.filter([
            {
                filterFn: function (item) {
                    return !item.get('isBase');
                }
            }
        ]);


        this.defaults = {
            width: 200,
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.record = this.product;

        // sync changes from code view of the htmleditor to WYSIWYG view
        var htmlEditorEditModeChangeHandler = function(el, editMode, eOpts) {
            if (editMode) {
                if (!this.textareaEl._syncInited) {
                    this.textareaEl.on('keydown', function() {
                        this.fireEvent('sync', this, this.textareaEl.getValue());
                        this.fireEvent('change', this, this.textareaEl.getValue());
                    }, this, { buffer: 50 });
                }
                this.textareaEl._syncInited = true;
            }
            ;
        };

        this.productUsageStore = Ext.create('Ext.data.Store', {
            fields: ['id', "name"],
            data: [
                {
                    name: "Standard Product",
                    id: "Standard"
                }, {
                    name: "Configurable Product With Options",
                    id: "Configurable"
                }, {
                    name: "Product Bundle",
                    id: "Bundle"
                }, {
                    name: "Bundle Component",
                    id: "Component"
                }
            ]
        });


        // remove for multi site;
        if (this.isGlobal || this.isSingleSite) {


            this.productCodeField = Ext.widget({
                fieldLabel: 'Code',
                name: 'productCode',
                emptyText: '#######',
                readOnly: !this.product.phantom,
                required: true,
                allowBlank: false,
                minLength: 3,
                //hidden: !visable,
                width: 200,
                xtype: 'textfield',
                listeners: {
                    change:function ( cmp, newValue) {
                        this.record.tempProductCode = newValue;
                    },
                    scope:this
                }
            });


            this.productTypeField = Ext.widget({
                //xtype: 'selectfield',
                xtype: 'combobox',
                fieldLabel: 'Product Type',
                name: 'productTypeId',
                readOnly: !this.product.phantom,
                required: true,
                allowBlank: false,
                editable: false,
                queryMode: 'local',
                //hidden: !visable,
                // width: 200,
                shrinkWrap: 3,
                displayField: 'name',
                valueField: 'id',
                //  queryCaching: true,
                store: this.productTypeStore,
                listeners: {
                    change: this.onProductTypeChange
                }
            });

            this.productUsageField = Ext.widget({
                xtype: 'selectfield',
                itemId: "productUsageField",
                fieldLabel: 'Product Usage',
                name: 'productUsage',
                readOnly: !this.product.phantom,
                // field is only editable once a productType is selected;
                //disabled: !this.product.phantom,
                required: true,
                queryMode: 'local',
                // hidden: !visable,
                width: 300,
                shrinkWrap: 3,
                displayField: 'name',
                valueField: 'id',
                store: this.productUsageStore,
                listeners: {
                    change: function(view, value) {
                        // update the record immediately;
                        me.product.set("productUsage", value);
                        // kick of the visibility snerst for the subForms;
                        var parentForm = me.up('productsiteform, productglobalform');
                        parentForm.onProductUsageChange(me, value);
                    }
                }
            });

            this.isTaxableField = Ext.widget({
                name: 'isTaxable',
                xtype: 'checkboxfield',
                boxLabel: 'Taxable'
            });


        }

        var isMapDisabled = (this.record.get("map") === null);
        var isDiscountRestricted = this.record.get("discountsRestricted");


        var mfgPartNumField = {
            xtype: 'textfield',
            fieldLabel: 'Manufacturer Part Number',
            name: 'mfgPartNumber',
            anchor: '96%',
            width: 200,
            required: false,
            selectOnFocus: true,
        };

        var upcField = {
            xtype: 'textfield',
            fieldLabel: 'Universal Product Code (UPC)',
            name: 'upc',
            anchor: '96%',
            width: 200,
            required: false,
            selectOnFocus: true,
        };

        var distPartNumField = {
            xtype: 'textfield',
            fieldLabel: 'Distributor Part Number',
            name: 'distPartNumber',
            anchor: '96%',
            width: 200,
            required: false,
            selectOnFocus: true,
        };

        var priceField = {
            xtype: 'numberfield',  //'currencyfield', //,
            fieldLabel: 'Price',
            name: 'price',
            anchor: '96%',
            width: 200,
            forcePrecision: true,
            required: true,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: 'Enter price'
        };

        this.rollupBundlePriceField = Ext.widget({
            xtype: "editabledisplayfield",
            itemId: "rollupBundlePrice",
            anchor: '96%',
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price:usMoney}</span>",
                "</tpl>"
            ]
        });

        var salePriceField = {
            xtype: 'numberfield',
            fieldLabel: 'Sale Price',
            name: 'salePrice',
            anchor: '96%',
            forcePrecision: true,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: '$10.00'
        };

        this.rollupBundleSalePriceField = Ext.widget({
            xtype: "editabledisplayfield",
            itemId: "rollupBundleSalePrice",
            anchor: '96%',
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total sale price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price:usMoney}</span>",
                "</tpl>"
            ]
        });

        var msrpField = {
            xtype: 'numberfield',
            fieldLabel: 'MSRP',
            name: 'msrp',
            anchor: '96%',
            forcePrecision: true,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: "Manufacturer's Suggested Retail Price"
        };

        var costField = {
            xtype: 'numberfield',
            fieldLabel: 'Cost',
            name: 'cost',
            anchor: '96%',
            width: 200,
            forcePrecision: true,
            required: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: ''
        };

        var mapField = {
            xtype: 'numberfield',
            fieldLabel: 'Minimum Advertised Price',
            name: 'map',
            anchor: '96%',
            width: 200,
            forcePrecision: true,
            required: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            enableKeyEvents: true,
            listeners: {
                keyup: {
                    fn: function (source, evt) {
                        var isDisabled = ((source.getValue() == null) || (source.getValue().length == 0));
                        me.mapStartField.setDisabled(isDisabled);
                        me.mapEndField.setDisabled(isDisabled);                        
                    }
                }
            }
        };

        this.mapStartField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Effective Date',
            name: 'mapStartDate',
            anchor: '96%',
            width: 200,
            //emptyText: 'Start Date',
            pickerOffset: 4,
            disabled: isMapDisabled
        });

        this.mapEndField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'mapEndDate',
            anchor: '96%',
            width: 200,
            //emptyText: 'End Date',
            pickerOffset: 4,
            disabled: isMapDisabled
        });

        this.discountsRestrictedField = Ext.widget({
            xtype: 'checkboxfield',
            margin: '0 0 0 10',
            fieldLabel: 'Product Discounts',
            boxLabel: 'Restrict Discount on this product',
            name: 'discountsRestricted',
            anchor: '96%',
            checked: isDiscountRestricted,
            handler: me.onDiscountRestrictedChange,
            scope: me
        });

        this.discountsRestrictedStartField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Effective Date',
            name: 'discountsRestrictedStartDate',
            anchor: '96%',
            width: 200,
            pickerOffset: 4,
            disabled: ! isDiscountRestricted
        });

        this.discountsRestrictedEndField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'discountsRestrictedEndDate',
            anchor: '96%',
            width: 200,
            pickerOffset: 4,
            disabled: !isDiscountRestricted
        });



        readOnly = this.isEdit() || !(this.isSingleSite || this.isGlobal);
        visable = !readOnly || this.isEdit();
        requiredContent = this.isSingleSite || this.isGlobal;



        this.items = [
            this.productCodeField,
            this.productTypeField,
            this.productUsageField,


            {
                xtype:'formform',
                persistChangesToModel: true,
                record: this.productInCatalogInfo,
                hidden: this.isGlobal,
                width: '100%',
                header:false,
                items: [
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Status',
                        name: 'isActive',
                        labelAlign: 'top',
                        hidden: this.isGlobal,
                        allowBlank: false,
                        editable: false,
                        forceSelection: true,
                        listConfig: { shadow: false },
                        shrinkWrap: 3,
                        store: [[false, 'Disable'], [true, 'Active']],
                        value: this.productInCatalogInfo ? this.productInCatalogInfo.get('isActive') : false
                    }
                ]

            }, {
                xtype: 'productoverride',
                overrideFieldName: 'isContentOverridden',
                hideOverride: this.isSingleSite,
                width: '100%',
                items: [{
                    fieldLabel: 'Name',
                    allowBlank: false,
                    minLength: 3,
                    name: 'productName',

                    emptyText: 'Some product description',
                    width: '100%',
                    required: true,
                    listeners: {
                        change: function (cmp, newValue ) {
                            cmp.productForm = cmp.productForm || cmp.up('productform');
                            cmp.productForm.fireEvent('productnamechange', this.productInCatalogInfo || this.product, newValue);
                        },
                        scope:this
                    }
                }, {
                    xtype: 'htmleditor',
                    enableFont: false,
                    fieldLabel: 'Short Description',
                    name: 'productShortDescription',
                    emptyText: 'Words',
                    listeners: {
                        editmodechange: htmlEditorEditModeChangeHandler
                    },
                    width: '100%'
                    //fontFamilies: ['MyriadWebProRegular', 'Arial', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'],
                }, {
                    xtype: 'htmleditor',
                    enableFont:false,
                    fieldLabel: 'Full Description',
                    name: 'productFullDescription',
                    emptyText: 'Words, words, and more words.  Also, with lists.',
                    //fontFamilies: ['MyriadWebProRegular', 'Arial', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'],
                    listeners: {
                        editmodechange: htmlEditorEditModeChangeHandler,
                        change: function (cmp, newValue) {
                            cmp.productForm = cmp.productForm || cmp.up('productform');
                            cmp.productForm.fireEvent('productfulldescriptionchange', me.productInCatalogInfo || me.product, newValue);
                        }
                    },
                    width: '100%'
                },



                {
                    fieldLabel: 'Product Image',
                    name: 'productImages',
                    xtype: 'taco.imagefield',
                    width: '100%'
                }

                ]
            }, {
                xtype: 'productoverride',
                width: '100%',
                overrideFieldName: 'isPriceOverridden',
                hideOverride: this.isSingleSite,

                items: [
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    layout: {
                        type: 'column',
                        align: 'top'
                    },
                    fieldDefaults: {
                        labelAlign: 'top',
                        msgTarget: 'side'
                    },
                    width: '100%',
                    margin: '10 0 0',
                    items: [
                        {
                            xtype: 'container',
                            columnWidth: .3,
                            layout: 'anchor',
                            items: [
                                priceField,
                                this.rollupBundlePriceField,
                                msrpField
                            ]
                        }, {
                            xtype: 'container',
                            columnWidth: .2,
                            layout: 'anchor',
                            items: [
                                {
                                    xtype: 'tbspacer'
                                },
                                {
                                    xtype: 'tbspacer'
                                },
                                {
                                    xtype: 'tbspacer'
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            columnWidth: .3,
                            layout: 'anchor',
                            items: [
                                salePriceField,
                                this.rollupBundleSalePriceField,
                                costField
                            ]
                        },
                        {
                            xtype: 'container',
                            columnWidth: .2,
                            layout: 'anchor',
                            items: [
                                this.isTaxableField
                            ]
                        }
                    ]
                },
                //{
                //    xtype: 'menuseparator',
                //    width: '100%',
                //    height: 5,
                    
                //},
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    layout: {
                        type: 'column',
                        align: 'top'
                    },
                    fieldDefaults: {
                        labelAlign: 'top',
                        msgTarget: 'side'
                    },
                    width: '100%',
                    margin: '10 0 0',
                    defaultType: 'container',
                    items: [
                        {
                            columnWidth: .4,
                            layout: 'anchor',
                            items: [
                                mapField
                            ]
                        },
                        {
                            columnWidth: .2,
                            layout: 'anchor',
                            items: [
                                this.mapStartField
                            ]
                        },
                        {
                            columnWidth: .2,
                            layout: 'anchor',
                            items: [
                                this.mapEndField
                            ]
                        }
                    ]
                }, {
                        xtype: 'container',
                        anchor: '100%',
                        layout: 'column',
                        items: [
                            {
                                xtype: 'container',
                                columnWidth: .4,
                                layout: 'anchor',
                                items: [
                                    this.discountsRestrictedField
                                ]
                            },
                            {
                                xtype: 'container',
                                columnWidth: .2,
                                layout: 'anchor',
                                items: [
                                    this.discountsRestrictedStartField
                                ]
                            },
                            {
                                xtype: 'container',
                                columnWidth: .2,
                                layout: 'anchor',
                                items: [
                                    this.discountsRestrictedEndField
                                ]
                            }
                        ]
                    }

            ]
        }, {
                xtype: 'formform',
                ui: 'subform-subform',
                layout: {
                    type: 'column',
                    align: 'top'
                },
                fieldDefaults: {
                    labelAlign: 'top',
                    msgTarget: 'side'
                },
                width: '100%',
                margin: '10 0 0',
                defaultType: 'container',
                items: [
                            {
                                columnWidth: .3,
                                layout: 'anchor',
                                items: [
                                    mfgPartNumField,
                                    distPartNumField
                                ]
                            }, {
                                columnWidth: .2,
                                layout: 'anchor',
                                items: [
                                    {
                                        xtype: 'tbspacer'
                                    },
                                    {
                                        xtype: 'tbspacer'
                                    }
                                ]
                            }, {
                                columnWidth: .3,
                                layout: 'anchor',
                                items: [
                                    upcField
                                ]
                            }
                ]
            }

        ];


        this.items = Taco.core.util.Common.filterNulls(this.items);


        this.callParent(arguments);

        // if we already have a product type selected; we need to filter the productUsage combo
        // we will not have to tdo this if there is no productUsage field (siteForm in a multi site configuration)
        if (this.productUsageField) {
            var productTypeId = this.product.get('productTypeId');
            if (productTypeId) {
                var productTypeRecord = this.productTypeStore.getById(productTypeId);
                me.filterProductUsageField(productTypeRecord.get("productUsages"));
            }
        }

        // listend for changes to the productUsage and bundleItem changes on the main form;
        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.updatePriceUI, me);
            me.mon(productForm, 'bundleItemChange', me.updatePriceUI, me);

        }, me);


        this.down('#productName')
    },



    /**
    * when the productUsage changes, will need to alter the ux for price on the general form;
    */
    updatePriceUI: function () {
        var me = this,
            productUsageValue = me.product.get("productUsage"),
            price = 0,
            salePrice = 0,
            bundledProducts;



        // calculate the combined prices of each item
        if (productUsageValue == 'Bundle') {
            //store
            bundledProducts = this.record.getBundledProducts();

            bundledProducts.each(function (item) {
                price += item.data.price * item.data.quantity;

                if (item.data.salePrice) {
                    salePrice += item.data.salePrice * item.data.quantity;
                } else {
                    // no sale price for this item, use the full price
                    salePrice += item.data.price * item.data.quantity;
                }


                /*
                    packageHeight: 1
                    packageLength: 4
                    packageWeight: 2
                    packageWidth: 1
                    price: 3.99
                    productCode: "tentSpike-1"
                    productName: "TentSpike"
                    quantity: 1
                    salePrice: 2.69
                */

            });
        }
        this.rollupBundlePriceField.setValue({
            price: price
        });

        this.rollupBundleSalePriceField.setValue({
            price: salePrice
        });



    },

    loadRecord: function (record) {
        var me = this;
        me.updatePriceUI(me, record.get("productUsage"));

        me.callParent(arguments);
    },

    /**
    *  Filter the ProductUsageField values based on the values that are alllowed. These are taken from the current productType Selection;
    */
    filterProductUsageField: function (values) {
        var me = this,
            validProductUsages,
            productUsageField,
            currentValue,
            currentValueValid,
            store;

        productUsageField = me.query("#productUsageField")[0];
        currentValue = productUsageField.getValue();
        store = productUsageField.store;


        // values could be a string if there was only one value; 
        if (values && Ext.isString(values)) {
            validProductUsages = [values];
        } else {
            // already and array. good to go;
            validProductUsages = values;
        }

        store.clearFilter();
        store.filter([
            {
                filterFn: function (record) {
                    var isValid = Ext.Array.some(validProductUsages, function (item, index, array) {
                        return (item == record.data.id);
                    });

                    // see if the current value is still available in the list of valid values;
                    if (currentValue == record.data.id) {
                        currentValueValid = isValid
                    }

                    return isValid;
                },
                scope:me
            }
        ]);


        //if the current value of the field is no longer valid after the filtering then remove it;
        if (currentValue !="" && !Ext.Array.contains(validProductUsages, currentValue)) {

            productUsageField.clearValue();
        }

    },

    onProductTypeChange: function (selectField, value) {
        var me = this,
            productTypeRecord = selectField.store.getById(value),
            productUsages = productTypeRecord.get("productUsages"),
            productUsageField,
            parentForm,
            product;

        parentForm = me.up('productsiteform, productglobalform');

        if (!parentForm) {
            return;
        }

        // once a productType is selected, enable the productUsage field;
        productUsageField = parentForm.findField("productUsage");
        productUsageField.enable();

        // when the user changes the productType field we need to update the available productUsages based on the selected productType
        me.ownerCt.filterProductUsageField(productUsages);

        //need to set the productTypeId for variations to work.
        product = parentForm.product || parentForm.record;
        product.set('productTypeId', value);

        if (!me.propertiesForm) {
            me.propertiesForm = parentForm.down('productpropertiesform');
        }

        if (me.propertiesForm) {
            me.propertiesForm.loadByProductTypeId(value);
        }

        if (!me.extrasForm) {
            me.extrasForm = parentForm.down('productextrasform');
        }

        if (me.extrasForm) {
            me.extrasForm.loadByProductTypeId(value);
        }

        if (!me.optionsForm) {
            me.optionsForm = parentForm.down('taco-product-options');
        }

        if (me.optionsForm) {
            me.optionsForm.loadByProductTypeId(value);
        }

    },

    onDiscountRestrictedChange: function (source, isChecked) {
        var me = source.scope;
        if (!isChecked) {
            me.discountsRestrictedStartField.setValue('');
            me.discountsRestrictedEndField.setValue('');         
        } 
        me.discountsRestrictedStartField.setDisabled(!isChecked);
        me.discountsRestrictedEndField.setDisabled(!isChecked);        
    }
});