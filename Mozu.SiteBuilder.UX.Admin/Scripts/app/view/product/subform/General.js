/**
 * @class Taco.view.price.subform.General
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.General', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productgeneralsubform',
    requires: [
        'Ext.form.field.HtmlEditor',
        //'Taco.core.ux.HtmlEditor',
        'Taco.view.product.subform.OverrideForm',
        'Ext.form.field.ComboBox',
        'Taco.view.product.subform.Bundle',
        'Taco.core.ux.form.Form',
        'Ext.data.Store',
        'Ext.form.field.Text',
        'Taco.shared.view.field.Image',
        'Taco.core.ux.form.SelectField',
        'Taco.store.ProductTypes',
        'Taco.core.ux.form.CurrencyField'
    ],
    statics: {
        sizes: {},
        getBufferedWidth: function (buffer, defaultValue) {
            if (this.sizes.lastWidth) {
                return this.sizes.lastWidth - (buffer||60);
            }
            return defaultValue;
        }
    },
    title: 'General',
    margin: '0 0 20 0',
    initComponent: function () {


        var me = this,
            readOnly,
            requiredContent,
            classDef = this.statics(),
            visable,
            isMapEnabled = (this.product.get("map") != null),
            isDiscountRestricted = this.product.get("discountsRestricted"),
            isTaxable = (this.product.get("isTaxable")),
            isDigitalCredit = false,
            productUsage = this.product.get("productUsage"),
            productTypeId = this.product.get('productTypeId'),
            productTypeRecord = null,
            invalidDateText = "{0} is not a valid date - it must be in the format mm/dd/yy";

        me.on('resize', function (cmp, width, height) {
            classDef.sizes.lastWidth = width;
            classDef.sizes.lastHeight = height;
        });

        me.record = this.product;
        me.currencyCode = me.productInCatalogInfo ? me.productInCatalogInfo.getCatalog().currencyCode : me.product.getCurrencyCode();
        //used for data range validation key value lookup, since multiple pair of fields
        me.dateRangeFieldMap = {};

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

        if (productTypeId) {
            productTypeRecord = this.productTypeStore.getById(productTypeId);
            if (productTypeRecord)
                isDigitalCredit = (productTypeRecord.get("goodsType") === 'DigitalCredit');
        }

        this.defaults = {
            width: 200,
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

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
                    change: {
                        scope: this,
                        fn: 'onProductTypeChange'
                    }
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

                        var prodTypeId = me.productTypeField.getValue();
                        if (prodTypeId) {
                            var prodTypeRecord = me.productTypeStore.getById(prodTypeId);
                            var isDigitalCreditProdType = (prodTypeRecord.get("goodsType") === 'DigitalCredit');
                            me.setDigitalCreditDefaults(isDigitalCreditProdType, value);
                        }

                        // kick of the visibility snerst for the subForms;
                        var parentForm = me.up('productsiteform, productglobalform');
                        parentForm.onProductUsageChange(me, value);
                    }
                }
            });

            this.isTaxableField = Ext.widget({
                xtype: 'checkboxfield',
                name: 'isTaxable',
                boxLabel: 'Taxable',
                checked: isTaxable
            });

            this.costField = Ext.widget({
                xtype: 'currencyfield',
                fieldLabel: 'Cost',
                currencyCode:me.currencyCode,
                name: 'cost',
                required: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                selectOnFocus: true,
                emptyText: ''
            });

            this.discountsRestrictedField = Ext.widget({
                xtype: 'checkboxfield',
                fieldLabel: 'Product Discounts',
                boxLabel: 'Restrict discounts on this product',
                name: 'discountsRestricted',
                checked: isDiscountRestricted,
                handler: me.onDiscountRestrictedChange,
                scope: me
            });

            this.discountsRestrictedStartField = Ext.widget({
                xtype: 'datefield',
                fieldLabel: 'Restriction Effective Date',
                name: 'discountsRestrictedStartDate',
                itemId: 'discountDateRangeStart',
                endDateField: 'discountDateRangeEnd',
                pickerOffset: 4,
                disabled: !isDiscountRestricted,
                allowBlank: !isDiscountRestricted,
                emptyText: 'mm/dd/yy',
                invalidText: invalidDateText,
                listeners: {
                    change: {
                        scope: me,
                        fn: me.onDateRangeChange
                    }
                }
            });
            me.dateRangeFieldMap['discountDateRangeStart'] = this.discountsRestrictedStartField;

            this.discountsRestrictedEndField = Ext.widget({
                xtype: 'datefield',
                fieldLabel: 'Restriction End Date',
                name: 'discountsRestrictedEndDate',
                itemId: 'discountDateRangeEnd',
                startDateField: 'discountDateRangeStart',
                pickerOffset: 4,
                disabled: !isDiscountRestricted,
                allowBlank: !isDiscountRestricted,
                invalidText: invalidDateText,
                emptyText: 'mm/dd/yy',
                listeners: {
                    change: {
                        scope: me,
                        fn: me.onDateRangeChange
                    }
                }
            });
            me.dateRangeFieldMap['discountDateRangeEnd'] = this.discountsRestrictedEndField;

            this.mfgPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Manufacturer Part Number',
                name: 'mfgPartNumber',
                anchor: '96%',
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.upcField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Universal Product Code (UPC)',
                name: 'upc',
                anchor: '96%',
                maxLength: 128,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.distPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Distributor Part Number',
                name: 'distPartNumber',
                anchor: '96%',
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });


        }

        var priceField = {
            xtype: 'currencyfield',
            fieldLabel: 'Price',
            name: 'price',
            required: true,
            allowBlank: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            currencyCode: me.currencyCode,
            selectOnFocus: true,
            emptyText: 'Enter price',
            listeners: {
                blur: {
                    scope: me,
                    fn: function onPriceBlurSetDefaultGiftCardValue (el) {
                        if (! me.creditValueField.isDisabled())
                        {
                            var price = el.getValue();
                            me.creditValueField.setValue(price);
                        }
                    }
                }
            }
        };

        this.rollupBundlePriceField = Ext.widget({
            xtype: "editabledisplayfield",
            itemId: "rollupBundlePrice",
            margins: '0 50 0 0',
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price}</span>",
                "</tpl>"
            ]
        });
        
        var salePriceField = {
            xtype: 'currencyfield',
            fieldLabel: 'Sale Price',
            name: 'salePrice',
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true
        };

        this.creditValueField = Ext.widget({
            xtype: 'currencyfield',
            fieldLabel: 'Gift Card/Credit Value',
            name: 'creditValue',
            hidden: !isDigitalCredit,
            disabled: (!isDigitalCredit || !(this.isGlobal || this.isSingleSite)),
            allowBlank: (!isDigitalCredit || (productUsage === "Configurable")),
            required: (isDigitalCredit && (productUsage != "Configurable")),
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true
        });

        this.rollupBundleSalePriceField = Ext.widget({
            xtype: "editabledisplayfield",
            itemId: "rollupBundleSalePrice",
            anchor: '96%',
            margins: '0 50 0 10',
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total sale price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price}</span>",
                "</tpl>"
            ]
        });

        var msrpField = {
            xtype: 'currencyfield',
            fieldLabel: 'MSRP',
            name: 'msrp',
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: "Manufacturer's Suggested Retail Price"
        };

        var mapField = {
            xtype: 'currencyfield',
            fieldLabel: 'Minimum Advertised Price',
            name: 'map',
            currencyCode: me.currencyCode,
            required: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            enableKeyEvents: true,
            scope: me,
            listeners: {
                keyup: {
                    scope: me,
                    fn: function (source) {
                        var isEnabled = (source.getValue() != null);
                        me.enableDateRangeFields(source, me.mapStartField, me.mapEndField, isEnabled);
                    }
                }
            }
        };

        this.mapStartField = Ext.widget({
            xtype: 'datefield',
            fieldLabel: 'MAP Effective Date',
            name: 'mapStartDate',
            itemId: 'mapstartdt',
            endDateField: 'mapenddt',
            pickerOffset: 4,
            disabled: !isMapEnabled,
            allowBlank: !isMapEnabled,
            invalidText: invalidDateText,
            emptyText: 'mm/dd/yy',
            listeners: {
                change: {
                    scope: me,
                    fn: me.onDateRangeChange
                }
            }
        });
        me.dateRangeFieldMap['mapstartdt'] = this.mapStartField;

        this.mapEndField = Ext.widget({
            xtype: 'datefield',
            fieldLabel: 'MAP End Date',
            name: 'mapEndDate',
            itemId: 'mapenddt',
            startDateField: 'mapstartdt',
            pickerOffset: 4,
            disabled: !isMapEnabled,
            allowBlank: !isMapEnabled,
            invalidText: invalidDateText,
            emptyText: 'mm/dd/yy',
            listeners: {
                change: {
                    scope: me,
                    fn: me.onDateRangeChange
                }
            }
        });
        me.dateRangeFieldMap['mapenddt'] = this.mapEndField;

        readOnly = this.isEdit() || !(this.isSingleSite || this.isGlobal);
        visable = !readOnly || this.isEdit();
        requiredContent = this.isSingleSite || this.isGlobal;

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                defaults: {
                    width: 250,
                    margin: '0 50 0 0'
                },
                items: [
                    this.productCodeField,
                    {
                        xtype: 'formform',
                        persistChangesToModel: true,
                        record: this.productInCatalogInfo,
                        hidden: this.isGlobal,
                        width: '100%',
                        header: false,
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
                    }
                ]
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                defaults: {
                    width: 250,
                    margin: '0 50 0 0'
                },
                items: [
                    this.productTypeField,
                    this.productUsageField
                ]
            }, {
                xtype: 'productoverride',
                itemId: 'contentOverride',
                overrideFieldName: 'isContentOverridden',
                hideOverride: this.isSingleSite,
                width: classDef.getBufferedWidth(null,'100%'),
                items: [
                    {
                        fieldLabel: 'Name',
                        allowBlank: false,
                        minLength: 3,
                        name: 'productName',

                        emptyText: 'Some product description',
                        
                        required: true,
                        listeners: {
                            change: function(cmp, newValue) {
                                cmp.productForm = cmp.productForm || cmp.up('productform');
                                cmp.productForm.fireEvent('productnamechange', this.productInCatalogInfo || this.product, newValue);
                            },
                            
                            scope: this
                        }
                    },
                    {
                        xtype: 'htmleditor',
                        enableFont: false,
                        fieldLabel: 'Short Description',
                        name: 'productShortDescription',
                        emptyText: 'Words',
                        minWidth: 600,
                      //  width:300,
                        width: classDef.getBufferedWidth(null,'100%'),
                        height: 300,

                        listeners: {
                            editmodechange: htmlEditorEditModeChangeHandler,


                        },


                    }, {
                        xtype: 'htmleditor',
                        enableFont: false,
                        fieldLabel: 'Full Description',
                        name: 'productFullDescription',
                        emptyText: 'Words, words, and more words.  Also, with lists.',
                        width: classDef.getBufferedWidth(null, '100%'),
                        height: 300,

                        listeners: {
                            editmodechange: htmlEditorEditModeChangeHandler,
                            change: function (cmp, newValue) {
                                cmp.productForm = cmp.productForm || cmp.up('productform');
                                cmp.productForm.fireEvent('productfulldescriptionchange', me.productInCatalogInfo || me.product, newValue);
                            }
                        },

                    }
                  
                ]
            },
           
        ];

        
        this.items = Taco.core.util.Common.filterNulls(this.items);

        //this.items = [];

        this.callParent(arguments);

        this.on('afterrender', function () {

            this.imagesConfig = {
                fieldLabel: 'Product Image',
                name: 'productImages',
                xtype: 'taco.imagefield',
                width: classDef.getBufferedWidth(),
                listeners: {
                    image_metadata_updated: {
                        scope: this,
                        fn: this.onImageMetadataUpdated
                    }
                },
                filters: function () {
                    var existingImages = me.record.get('productImages'),
                        result = [];
                    if (!existingImages || existingImages.length === 0) return null;
                    Ext.Array.each(existingImages, function(img) {
                        result.push({
                            property: 'id',
                            value: img.cmsId
                        });
                    });
                    return result;
                }()
            };

            //me.mon(Taco.app, 'image_metadata_updated', me.imageMetadataUpdated, me);

            this.priceOverRideConfig = {
                xtype: 'productoverride',
                width: classDef.getBufferedWidth(),
               
                overrideFieldName: 'isPriceOverridden',
                hideOverride: this.isSingleSite,
                margin: '10 0 0',
                items: [
                    {
                        xtype: 'container',
                        ui: 'subform-subform',
                        width: '100%',

                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    priceField,
                                    salePriceField,
                                    me.creditValueField,
                                    {
                                        xtype: 'container',
                                        flex: 1,
                                        items: [
                                            this.isTaxableField
                                        ]
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: '100%',
                                hidden: (productUsage != "Bundle"),
                                defaults: {
                                    width: 250
                                },
                                items: [
                                    this.rollupBundlePriceField,
                                    this.rollupBundleSalePriceField
                                ]
                            },
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    msrpField,
                                    this.costField
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        ui: 'subform-subform',
                        width: '100%',
                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    mapField,
                                    this.mapStartField,
                                    this.mapEndField
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        ui: 'subform-subform',
                        width: '100%',
                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                hidden: (!(this.isGlobal || this.isSingleSite)),
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    this.discountsRestrictedField,
                                    this.discountsRestrictedStartField,
                                    this.discountsRestrictedEndField
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        ui: 'subform-subform',
                        width: '100%',
                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                hidden: (!(this.isGlobal || this.isSingleSite)),
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    this.mfgPartNumField,
                                    this.upcField
                                ]
                            },
                            {
                                xtype: 'fieldcontainer',
                                hidden: (!(this.isGlobal || this.isSingleSite)),
                                layout: 'hbox',
                                width: '100%',
                                defaults: {
                                    width: 250,
                                    margins: '0 50 0 10'
                                },
                                items: [
                                    this.distPartNumField
                                ]
                            }
                        ]
                    }
                ]
            };
           




            //suspendEvents?
            this.down('#contentOverride').add(this.imagesConfig);
            this.add(this.priceOverRideConfig);
            // if we already have a product type selected; we need to filter the productUsage combo
            // we will not have to tdo this if there is no productUsage field (siteForm in a multi site configuration)
            if (this.productUsageField) {
                if (productTypeId && productTypeRecord) {
                    me.filterProductUsageField(productTypeRecord.get("productUsages"));
                }
            }

            var productForm = me.up("productform");
                if (productForm) {
                    me.mon(productForm, 'productusagechange', me.updatePriceUI, me);
                    me.mon(productForm, 'bundleItemChange', me.updatePriceUI, me);
                }

           


        }, this, {single:true, delay:1});

       


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
      //  me.updatePriceUI(me, record.get("productUsage"));

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

    setDigitalCreditDefaults: function (isDigitalCredit, productUsage) {
        var me = this,
            isTaxable = !isDigitalCredit,
            isDiscountRestricted = isDigitalCredit,
            isConfigurable = (productUsage === 'Configurable');

        if (me.isTaxableField) {
            if (isTaxable != me.isTaxableField.getValue())
            {
                me.isTaxableField.setValue(isTaxable);
            }
        }

        if (me.discountsRestrictedField) {
            if (isDiscountRestricted != me.discountsRestrictedField.getValue()) {
                me.discountsRestrictedField.setValue(isDiscountRestricted);
                if (isDiscountRestricted) {
                    var restrictStartDate = new Date();
                    var restrictEndDate = new Date(restrictStartDate.getFullYear() + 10, 11, 31);
                    me.discountsRestrictedStartField.setValue(restrictStartDate);
                    me.discountsRestrictedEndField.setValue(restrictEndDate);
                }
            }
        }
        if (me.creditValueField) {
            if (isDigitalCredit) {
                me.creditValueField.show();
                me.creditValueField.allowBlank = isConfigurable;
                me.creditValueField.enable();
            } else {
                me.creditValueField.hide();
                me.creditValueField.allowBlank = true;
                me.creditValueField.disable();
            }
            me.creditValueField.validate();
        }
    },

    onProductTypeChange: function (selectField, value) {
        var me = this,
            productTypeRecord = selectField.store.getById(value),
            productUsages = productTypeRecord.get("productUsages"),
            isDigitalCreditProductType = (productTypeRecord.get("goodsType") === 'DigitalCredit'),
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
        me.filterProductUsageField(productUsages);

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

        // gift card behavior.
        me.setDigitalCreditDefaults(isDigitalCreditProductType, productUsageField.getValue());

        Taco.app.fireEvent('producttypechanged', productTypeRecord);
    },

    onDiscountRestrictedChange: function (source, isChecked) {
        var me = source.scope;
        me.enableDateRangeFields(source, me.discountsRestrictedStartField, me.discountsRestrictedEndField, isChecked);
    },

    enableDateRangeFields: function(source, startField, endField, isEnabled) {
        var me = source.scope;
        
        if (isEnabled) {
            me.enableDateField(startField);
            me.enableDateField(endField);
        } else {
            me.disableDateField(startField);
            me.disableDateField(endField);
        }

        startField.validate();
        endField.validate();
    },

    disableDateField: function (dateField) {
        dateField.allowBlank = true;
        dateField.setDisabled(true);
        dateField.setValue(null);
        dateField.setMaxValue(null);
        dateField.setMinValue(null);
        this.product.set(dateField.name, null);
    },

    enableDateField: function (dateField) {
        dateField.allowBlank = false;
        dateField.setDisabled(false);
    },

    //modified from http://docs.sencha.com/extjs/4.2.2/#!/example/form/adv-vtypes.html

    onDateRangeChange: function (field, val, oldVal, eOpts) {
        var me = eOpts.scope, date = field.parseDate(val);

        //invalid date.  Null value ok to clear max|min
        if (!date && val != null) {
            return false;
        }
        if (field.startDateField) { 
            //var start = field.up('form').down('#' + field.startDateField);
            var start = me.dateRangeFieldMap[field.startDateField];
            if (start == null) {
                return true;
            }
            start.setMaxValue(date);
            start.validate();
        } else if (field.endDateField) {
            //var end = field.up('form').down('#' + field.endDateField);
            var end = me.dateRangeFieldMap[field.endDateField];
            if (end == null) {
                return true;
            }
            end.setMinValue(date);
            end.validate();
        }
        return true;
    },

    onImageMetadataUpdated: function (imgMetadata) {



        Ext.Array.each(this.record.get('productImages'), function (item) {
            if (imgMetadata.get('cmsId') === item.cmsId) {
                item.alt = imgMetadata.get('alt');
                return false;
            }
            return true;
        });


        //this.upsertArray(this.selectedImages, imgMetadata, function(item) {
        //    return (item.get('cmsId') === imgMetadata.get('cmsId'));
        //});


        console.log(imgMetadata);
    }

});

