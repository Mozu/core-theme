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
        'Taco.view.product.subform.OverrideForm',
        'Ext.form.field.ComboBox',
        'Taco.view.product.subform.Bundle',
        'Taco.core.ux.form.Form',
        'Ext.data.Store',
        'Ext.form.field.Text',
        'Taco.shared.view.field.Image',
        'Taco.core.ux.form.SelectField',
        'Taco.store.ProductTypes',
        'Taco.core.ux.form.CurrencyField',
        'Taco.shared.view.field.ProductTypePickerField',
        'Taco.core.ux.form.DateRange',
        'Taco.core.ux.form.DateTime',
        'Taco.core.util.Validation'
        //'Taco.core.ux.form.DateRangeContainer'
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
    bodyPadding: '0',
    initComponent: function () {

        var me = this,
            classDef = this.statics(),
            isMapEnabled = false,
            isDiscountRestricted = this.product.get("discountsRestricted"),
            isTaxable = (this.product.get("isTaxable")),
            isDigitalCredit = false,
            productUsage = this.product.get("productUsage"),
            productTypeId = this.product.get('productTypeId'),
            productTypeRecord = null;
            
        var currentGlobalMapValue = this.product.get("map");

        //isMapEnabled = (this.productInCatalogInfo ? (this.productInCatalogInfo.get('map') !== null) : (this.product.get("map") !== null));
        

        // if we have a site specific override of the map field and this is a siteform;
        if (this.productInCatalogInfo && this.productInCatalogInfo.get('map') !== null) {
            isMapEnabled = true;
        } else if (this.productForm && this.productForm.getForm()) {
            // if user has entered a map value into the global form but hasnt persisted it yet;
            var globalMapField = this.productForm.getForm().findField("map");
            currentGlobalMapValue = globalMapField.getValue();
            if (currentGlobalMapValue) {
                isMapEnabled = true;
            }
        } else if (currentGlobalMapValue !== null && currentGlobalMapValue > 0) {
            // user previously persisted a map value and the form hasn't been rendered yet;
            isMapEnabled = true;
        }
        

        me.on('resize', function (cmp, width, height) {
            //console.log("resize = " + width)
            classDef.sizes.lastWidth = width;
            classDef.sizes.lastHeight = height;            
        }, me, {
            buffer:10
        });

        me.record = this.product;
        me.currencyCode = me.productInCatalogInfo ? me.productInCatalogInfo.getCatalog().currencyCode : me.product.getCurrencyCode();

        // horizontal space between fields
        var defaultFieldMargin = 50;
        // how wide should fields be that display currency amounts
        var defaultFieldWidth = 166; // 3 column width
        //widest width that will fit in an override container at the smallest browser width;
        var fullFieldWidth = (defaultFieldWidth * 3) + (2 * defaultFieldMargin);
        // field width when part of a two column layout
        var twoColumnFieldWidth = (fullFieldWidth / 2)  -  (defaultFieldMargin/2);

        
        if (productTypeId) {
            productTypeRecord = this.record.productTypeRecord;
            
            if (productTypeRecord)
                isDigitalCredit = (productTypeRecord.get("goodsType") === 'DigitalCredit');
        }

        this.defaults = {            
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,            
            persistChangesToModel: true
        };

        // sync changes from code view of the htmleditor to WYSIWYG view
        var htmlEditorEditModeChangeHandler = function(el, editMode) {
            if (editMode) {
                if (!this.textareaEl._syncInited) {
                    this.textareaEl.on('keydown', function() {
                        this.fireEvent('sync', this, this.textareaEl.getValue());
                        this.fireEvent('change', this, this.textareaEl.getValue());
                    }, this, { buffer: 50 });
                }
                this.textareaEl._syncInited = true;
            }
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
                width: twoColumnFieldWidth,
                margin: '0 50 0 0',
                readOnly: !this.product.phantom,
                required: true,
                allowBlank: false,
                minLength: 3,                
                xtype: 'textfield',
                listeners: {
                    change:function ( cmp, newValue) {
                        this.record.tempProductCode = newValue;
                    },
                    scope:this
                }
            });

            


            this.productTypeField = Ext.widget({
                xtype: 'taco-producttypepickerfield',
                fieldLabel: 'Product Type',
                name: 'productTypeId',
                includeBaseProductType:false,
                readOnly: !this.product.phantom,
                required: true,
                allowBlank: false,
                minChars: 1,
                autoFetchDisplayValue: true,
                autoLoad:false,
                width: twoColumnFieldWidth,
                margin: '0 50 0 0',
                // extension method that allows the combo to use a preloaded record for its display value;
                getDisplayRecord : function() {
                    return (me.record.productTypeRecord) ? me.record.productTypeRecord : null;
                },
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
                required: true,
                queryMode: 'local',                
                width: twoColumnFieldWidth,
                margin: '0 0 0 0',                
                displayField: 'name',
                valueField: 'id',
                store: this.productUsageStore,
                listeners: {
                    change: function(view, value) {
                        // update the record immediately;
                        me.product.set("productUsage", value);

                        var prodTypeId = me.productTypeField.getValue();
                        if (prodTypeId) {
                            var prodTypeRecord = me.record.productTypeRecord;
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
                flex: 1,
                fieldLabel: "",
                hideEmptyLabel : false,
                name: 'isTaxable',
                margin:"10 0 0 50",
                boxLabel: 'Taxable',
                checked: isTaxable
            });

            this.costField = Ext.widget({
                xtype: 'currencyfield',
                fieldLabel: 'Cost',
                currencyCode:me.currencyCode,
                name: 'cost',
                //flex: 1,
                width: defaultFieldWidth,
                margin:"0 0 0 50",
                required: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                selectOnFocus: true,
                emptyText: ''
            });

            this.discountsRestrictedField = Ext.widget({
                xtype: 'checkboxfield',
                fieldLabel: 'Product Discounts',
                width:defaultFieldWidth,
                boxLabel: 'Restrict discounts on this product',
                name: 'discountsRestricted',
                checked: isDiscountRestricted,
                handler: me.onDiscountRestrictedChange,
                scope: me
            });

            this.discountsRestrictedStartField = Ext.widget({
                xtype: 'daterange',
                fieldLabel: 'Restriction Effective Date',
                width: defaultFieldWidth,
                margin:"0 0 0 50",
                name: 'discountsRestrictedStartDate',
                itemId: 'discountDateRangeStart',
                endDateFieldName: 'discountsRestrictedEndDate',
                pickerOffset: 4,
                disabled: !isDiscountRestricted,
                allowBlank: !isDiscountRestricted  
            });
            
            this.discountsRestrictedEndField = Ext.widget({
                xtype: 'daterange',
                fieldLabel: 'Restriction End Date',
                name: 'discountsRestrictedEndDate',
                width: defaultFieldWidth,
                margin: "0 0 0 50",
                itemId: 'discountDateRangeEnd',
                startDateFieldName: 'discountsRestrictedStartDate',
                pickerOffset: 4,
                disabled: !isDiscountRestricted,
                allowBlank: !isDiscountRestricted
            });
            
            this.mfgPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Manufacturer Part Number',
                name: 'mfgPartNumber',
                width: defaultFieldWidth + 25 + (defaultFieldWidth / 2),
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.upcField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Universal Product Code (UPC)',
                name: 'upc',
                width: defaultFieldWidth + 25 + (defaultFieldWidth / 2),
                margin: "0 0 0 50",
                maxLength: 128,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.distPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: 'Distributor Part Number',
                name: 'distPartNumber',
                width: defaultFieldWidth + 25 + (defaultFieldWidth / 2),
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });


        }

        var priceField = {
            xtype: 'currencyfield',
            fieldLabel: 'Price',
            //flex:1,
            width: defaultFieldWidth,
            name: 'price',
            itemId: 'price',
            required: true,
            allowBlank: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            currencyCode: me.currencyCode,
            selectOnFocus: true,
            //emptyText: 'Enter price',
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
            xtype: "component",
            itemId: "rollupBundlePrice",
            margins: '0 50 0 0',            
            width: defaultFieldWidth,
            border: false,
            style: "font-size:14px;",
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
            margin:"0 0 0 50 ",            
            width: defaultFieldWidth,
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true
        };

        this.creditValueField = Ext.widget({
            xtype: 'currencyfield',
            fieldLabel: 'Gift Card/Credit Value',
            name: 'creditValue',            
            margin:"0 0 0 50",
            width: defaultFieldWidth,
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
            xtype: "component",
            itemId: "rollupBundleSalePrice",            
            margins: '0 50 0 0',            
            width: defaultFieldWidth,
            border: false,
            style:"font-size:14px;",
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
            width: defaultFieldWidth,
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
           // emptyText: "Manufacturer's Suggested Retail Price",
            selectOnFocus: true
            
        };

        var mapField = {
            xtype: 'currencyfield',
            fieldLabel: 'Minimum Advertised Price',
            name: 'map',            
            width: defaultFieldWidth,
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
                    fn: me.onMapFieldChange
                }
            }
        };

        this.mapStartField = Ext.widget({
            xtype: 'daterange',
            fieldLabel: 'MAP Effective Date',
            name: 'mapStartDate',
            width: defaultFieldWidth,
            margin:"0 0 0 50",
            itemId: 'mapstartdt',
            endDateFieldName: 'mapEndDate',
            pickerOffset: 4,
            disabled: !isMapEnabled,
            allowBlank: true
        });
        
        this.mapEndField = Ext.widget({
            xtype: 'daterange',
            fieldLabel: 'MAP End Date',
            name: 'mapEndDate',
            itemId: 'mapenddt',
            width: defaultFieldWidth,
            margin: "0 0 0 50",
            startDateFieldName: 'mapStartDate',
            pickerOffset: 4,
            disabled: !isMapEnabled,
            allowBlank: true
        });

        this.imagesConfig = {
            fieldLabel: 'Product Image',
            name: 'productImages',
            xtype: 'taco.imagefield',
            //width: classDef.getBufferedWidth(),            
            width: fullFieldWidth,
            imageMetadata: me.record.get('productImages'),
            filters: function () {
                var existingImages = me.record.get('productImages'),
                    result = [];
                if (!existingImages || existingImages.length === 0) return null;
                Ext.Array.each(existingImages, function (img) {
                    result.push({
                        property: 'id',
                        value: img.cmsId,
                        alt: img.alt
                    });
                });
                return result;
            }()
        };

        this.activeStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active Start Date',
            name: 'activeStartDate',
            width: twoColumnFieldWidth,
            margin:"0 50 0 0",
            itemId: 'activeStartDt',
            pickerOffset: 4,
            hidden: (!this.productInCatalogInfo || this.productInCatalogInfo.get('status') !== 'Scheduled'),
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('activeStartDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                if (me.productInCatalogInfo && me.activeStartDateField.isVisible()) {
                    // if both fields have values we need to validate the dates are in order;
                    var isValid = Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField, "Start date must be before end date", 0);
                    return isValid;
                }
                return true;
            }
        });

        this.activeEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active End Date',
            name: 'activeEndDate',
            itemId: 'activeEndDt',
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            pickerOffset: 4,
            hidden: (!this.productInCatalogInfo || this.productInCatalogInfo.get('status') !== 'Scheduled'),
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('activeEndDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                if (me.productInCatalogInfo && me.activeEndDateField.isVisible()) {
                    // if both fields have values we need to validate the dates are in order;
                    var isValid = Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField, "End date must be after start date", 0);
                    return isValid;
                }
                return true;
            }
        });

        me.statusCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Status',
            name: 'status',
            labelAlign: 'top',
            hidden: this.isGlobal,
            allowBlank: false,
            editable: false,
            forceSelection: true,
            listConfig: { shadow: false },
            width: twoColumnFieldWidth,
            store: [['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Disable', 'Disable']],
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('status') : 'Disable',
            dateValidationMsg: "An active start or end date is required",
            //validateDate: function() {
            //    if (Ext.isEmpty(me.activeStartDateField.getValue()) && Ext.isEmpty(me.activeEndDateField.getValue())) {
            //        this.markInvalid(this.dateValidationMsg);
            //    }
            //},
            validator: function () {
                // check to see if the start and end dates have a value;
                if (this.getValue() === 'Scheduled' && Ext.isEmpty(me.activeStartDateField.getValue()) && Ext.isEmpty(me.activeEndDateField.getValue())) {
                    return this.dateValidationMsg;
                }
                return true;
            },
            listeners: {
                change: function (cmp, newValue) {
                    me.productInCatalogInfo.set('isActive', newValue === 'Scheduled' || newValue === 'Active');
                    //show eff dates.
                    //me.enableDateRangeFields(me, me.activeStartDateField, me.activeEndDateField, (newValue === 'Scheduled'));
                    me.activeStartDateField.setVisible(newValue === 'Scheduled');
                    //me.activeStartDateField.setDisabled(newValue !== 'Scheduled');
                    me.activeEndDateField.setVisible(newValue === 'Scheduled');
                    //me.activeEndDateField.setDisabled(newValue !== 'Scheduled');
                    if (newValue !== 'Scheduled') {
                        me.activeStartDateField.setValue(null);
                        //me.activeStartDateField
                        me.activeEndDateField.setValue(null);
                    }
                    // force the combo to do a validity check and bypass the ext check for changes in validity;
                    cmp.wasValid = null;


                },

                scope: this
            }
        })

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',                
                items: [
                    this.productCodeField,
                    {
                        xtype: 'formform',
                        persistChangesToModel: true,
                        record: this.productInCatalogInfo,
                        hidden: this.isGlobal,
                        header: false,
                        items: [
                            me.statusCombo
                        ]
                    }
                ]
            },
            {
                xtype: 'formform',
                persistChangesToModel: true,
                record: this.productInCatalogInfo,
                //hidden: this.isGlobal,
                width: '100%',
                header: false,
                items: [
                    {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        width: '100%',
                        items: [
                            this.activeStartDateField,
                            this.activeEndDateField
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '600',                
                items: [
                    this.productTypeField,
                    this.productUsageField
                ]
            }, {
                xtype: 'productoverride',
                itemId: 'contentOverride',
                overrideFieldName: 'isContentOverridden',
                hideOverride: this.isSingleSite,
                //width: classDef.getBufferedWidth(null, '100%'),
                width:'100%',
                items: [
                    {
                        fieldLabel: 'Name',
                        allowBlank: false,
                        minLength: 3,
                        width: fullFieldWidth,
                        name: 'productName',

                        //emptyText: 'Some product description',
                        
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
                        //width: classDef.getBufferedWidth(null, '100%'),
                        width: fullFieldWidth,
                        height: 300,

                        listeners: {
                            editmodechange: htmlEditorEditModeChangeHandler
                        }
                    }, {
                        xtype: 'htmleditor',
                        enableFont: false,
                        fieldLabel: 'Full Description',
                        name: 'productFullDescription',
                        emptyText: 'Words, words, and more words.  Also, with lists.',
                        //width: classDef.getBufferedWidth(null, '100%'),
                        width: fullFieldWidth,
                        height: 300,

                        listeners: {
                            editmodechange: htmlEditorEditModeChangeHandler,
                            change: function (cmp, newValue) {
                                cmp.productForm = cmp.productForm || cmp.up('productform');
                                cmp.productForm.fireEvent('productfulldescriptionchange', me.productInCatalogInfo || me.product, newValue);
                            }
                        }
                    },

                    this.imagesConfig
                  
                ]
            }
        ];

        
        this.items = Taco.core.util.Common.filterNulls(this.items);

        //this.items = [];



        

        //me.mon(Taco.app, 'image_metadata_updated', me.imageMetadataUpdated, me);

        this.priceOverRideConfig = {
            xtype: 'productoverride',
            //width: classDef.getBufferedWidth(),               
            width: '100%',
            overrideFieldName: 'isPriceOverridden',
            hideOverride: this.isSingleSite,
            margin: '10 0 0 0',
            items: [
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    width: '100%',
                    margin: '10 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            items: [
                                priceField,
                                salePriceField,
                                me.creditValueField
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            itemId:"rollupBundleContainer",
                            hidden: (productUsage != "Bundle"),
                            items: [
                                this.rollupBundlePriceField,
                                this.rollupBundleSalePriceField
                                
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            items: [
                                msrpField,
                                this.costField,
                                this.isTaxableField
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    width: '100%',
                    margin: '10 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
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
                    margin: '10 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            hidden: (!(this.isGlobal || this.isSingleSite)),
                            layout: 'hbox',
                            width: '100%',
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
                    margin: '10 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            hidden: (!(this.isGlobal || this.isSingleSite)),
                            layout: 'hbox',
                            width: '100%',
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
                            items: [
                                this.distPartNumField,
                                {
                                    xtype: "box",
                                    margin: "0 0 0 50",
                                    flex: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        };


        this.items.push (this.priceOverRideConfig);


        
        var dateFirstAvailable = this.productInCatalogInfo ? this.productInCatalogInfo.get('dateFirstAvailableInCatalog') : "";
        if (Ext.isEmpty(dateFirstAvailable)) {
            dateFirstAvailable = new Date();
        }
        
        this.items.push(
            Taco.core.ux.TooltipLabel.wrapConfig('product.general.dateFirstAvailable', me, {
                xtype: 'datefield',
                fieldLabel: 'First Available Date',
                name: 'dateFirstAvailableInCatalog',
                labelAlign: 'top',
                allowBlank:false,
                hidden: this.isGlobal,
                width: twoColumnFieldWidth,
                value: dateFirstAvailable
            }, Ext.id())
        );


        this.callParent(arguments);

        this.on('afterrender', function () {


            
            
           




            //suspendEvents?
            //this.down('#contentOverride').add(this.imagesConfig);
            //this.add(this.priceOverRideConfig);
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
            bundleItemTotals,
            rollupBundleContainer;


        rollupBundleContainer = me.down("#rollupBundleContainer");

        // calculate the combined prices of each item
        if (productUsageValue == 'Bundle') {
            //store
            rollupBundleContainer.show();
            bundleItemTotals = this.record.getBundleItemTotals();

            this.rollupBundlePriceField.update({
                price: this.record.formatCurrency(bundleItemTotals.price)
            });

            this.rollupBundleSalePriceField.update({
                price: this.record.formatCurrency(bundleItemTotals.salePrice)
            });

        } else {
            rollupBundleContainer.hide();
        }
    },

    loadRecord: function (record) {

        var me = this;
        me.updatePriceUI();
        
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
                    var isValid = Ext.Array.some(validProductUsages, function (item) {
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

        
        // cache the record for the other forms in case they need it to control their layout;
        me.record.productTypeRecord = productTypeRecord;

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

    onMapFieldChange: function (field) {
        var me = this,
            isEnabled = (field.getValue() != null);
        
        me.enableDateRangeFields(me, me.mapStartField, me.mapEndField, isEnabled);

        // if this is a change to the global form's map field we will need to update the value on the site forms that are not in an override state to keep them current and in sync.
    },

    onDiscountRestrictedChange: function (source, isChecked) {
        //var me = source.scope;
        var me = this;


        me.enableDateRangeFields(source, me.discountsRestrictedStartField, me.discountsRestrictedEndField, isChecked);
    },

    enableDateRangeFields: function(source, startField, endField, isEnabled) {
        //var me = source.scope;
        var me = this;
        
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
        //dateField.allowBlank = true;
        dateField.setDisabled(true);
        dateField.setValue(null);
        dateField.setMaxValue(null);
        dateField.setMinValue(null);
        this.product.set(dateField.name, null);
    },

    enableDateField: function (dateField) {
        //dateField.allowBlank = false;
        dateField.setDisabled(false);
    },

    beforeSave: function () {
        var uploadedImages = [],
            form = this.getForm(),
            productImagesField = form.findField("productImages");

        if (productImagesField) {
            uploadedImages = Ext.Array.filter(productImagesField.getValue(), function(img) {
                return img.isUploaded;
            });
        }


        
        
        var dateFirstAvailableInCatalog = this.findField("dateFirstAvailableInCatalog");
        if (this.productInCatalogInfo) {
            this.productInCatalogInfo.set('dateFirstAvailableInCatalog', dateFirstAvailableInCatalog.getValue());
        }
        

        // need to update the record manually. form.Form does not extract the value from the imageField automatically.
        this.record.set("productImages", uploadedImages);
        return true;
    }


});

