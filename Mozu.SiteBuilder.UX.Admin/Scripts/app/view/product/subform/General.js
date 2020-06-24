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
        'Taco.core.ux.form.DateTime',
        'Taco.core.util.Validation',
        'Taco.view.product.subform.Images',
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
    title: Localizer.langResources.CATALOG.Products.ProductEdit.general,
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
        me.currencyCode = me.productInCatalogInfo
            && me.productInCatalogInfo.getCatalog
            && me.productInCatalogInfo.getCatalog()
                ? me.productInCatalogInfo.getCatalog().currencyCode
                : me.product.getCurrencyCode();

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

        me.isCreateMode = !me.record.productTypeRecord;

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
                    name: Localizer.langResources.CATALOG.Products.ProductEdit.standard_product,
                    id: "Standard"
                }, {
                    name: Localizer.langResources.CATALOG.Products.ProductEdit.product_with_options,
                    id: "Configurable"
                }, {
                    name: Localizer.langResources.CATALOG.Products.ProductEdit.product_bundle,
                    id: "Bundle"
                }, {
                    name: Localizer.langResources.CATALOG.Products.ProductEdit.bundle_component,
                    id: "Component"
                }
            ]
        });

        // remove for multi site;
        if (this.isGlobal) {


            this.productCodeField = Ext.widget({
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_code,
                name: 'productCode',
                emptyText: '#######',
                width: '50%',
                margin: '0 15 0 0',
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
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_type,
                name: 'productTypeId',
                includeBaseProductType:false,
                readOnly: !this.product.phantom,
                required: true,
                allowBlank: false,
                minChars: 1,
                autoFetchDisplayValue: true,
                autoLoad:false,
                width: '50%',
                margin: '0 15 0 0',
                // extension method that allows the combo to use a preloaded record for its display value;
                getDisplayRecord : function() {
                    return (me.record.productTypeRecord) ? me.record.productTypeRecord : null;
                },
                listeners: {
                    change: {
                        scope: this,
                        fn: 'onProductTypeChange'
                    }
                },
                validator: function(val) {
                    if (me.isCreateMode) {
                        var matches = this.store.queryBy(function(record, id) { return record.get('name') === val });
                        return (matches.items.length === 1) ? true : Localizer.langResources.CATALOG.Products.ProductEdit.no_matches;
                    } else {
                        // previously saved and is uneditable.
                        return true;
                    }
                }
            });


            this.productUsageField = Ext.widget({
                xtype: 'selectfield',
                itemId: 'productUsageField',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_usage,
                name: 'productUsage',
                readOnly: !this.product.phantom,
                required: true,
                queryMode: 'local',
                width: '50%',
                margin: '0 0 0 15',
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
                            var isDigitalCreditProdType = (prodTypeRecord.get('goodsType') === 'DigitalCredit');
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
                columnWidth: 0.5,
                fieldLabel: "",
                hideEmptyLabel : false,
                name: 'isTaxable',
                margin: "10 0 0 15",
                boxLabel: Localizer.langResources.CATALOG.Products.ProductEdit.taxable,
                checked: isTaxable
            });

            this.costField = Ext.widget({
                xtype: 'currencyfield',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.cost,
                currencyCode:me.currencyCode,
                name: 'cost',
                columnWidth: 0.5,
                margin: "0 15 0 0",
                required: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                selectOnFocus: true,
                emptyText: ''
            });

            this.discountsRestrictedField = Ext.widget({
                xtype: 'checkboxfield',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_discounts,
                width: '50%',
                margin: "0 15 0 0",
                boxLabel: Localizer.langResources.CATALOG.Products.ProductEdit.box_label,
                name: 'discountsRestricted',
                checked: isDiscountRestricted,
                handler: me.onDiscountRestrictedChange,
                scope: me
            });

            this.discountsRestrictedStartField = Ext.widget({
                xtype: 'datetime',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.restriction_start_date,
                columnWidth: 0.5,
                margin: '0 15 0 0',
                name: 'discountsRestrictedStartDate',
                itemId: 'discountDateRangeStart',
                disabled: !isDiscountRestricted,
                allowBlank: true,
                validator: function() {
                    return Taco.core.util.Validation.validateDateRange(me.discountsRestrictedStartField, me.discountsRestrictedEndField, Localizer.langResources.CATALOG.Products.ProductEdit.start_date_error_message, 0);
                }

            });

            this.discountsRestrictedEndField = Ext.widget({
                xtype: 'datetime',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.restriction_end_date,
                name: 'discountsRestrictedEndDate',
                columnWidth: 0.5,
                margin: "0 0 0 15",
                itemId: 'discountDateRangeEnd',
                disabled: !isDiscountRestricted,
                allowBlank: true,
                validator: function() {
                    return Taco.core.util.Validation.validateDateRange(me.discountsRestrictedStartField, me.discountsRestrictedEndField, Localizer.langResources.CATALOG.Products.ProductEdit.end_date_error_message, 0);
                }
            });

            this.mfgPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.manufacturer_part_number,
                name: 'mfgPartNumber',
                width: '50%',
                margin: '0 15 0 0',
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.upcField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.universal_product_code,
                name: 'upc',
                width: '50%',
                margin: "0 0 0 15",
                maxLength: 128,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });

            this.distPartNumField = Ext.widget({
                xtype: 'textfield',
                fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.distributor_part_number,
                name: 'distPartNumber',
                width: '50%',
                margin: '0 15 0 0',
                maxLength: 30,
                enforceMaxLength: true,
                required: false,
                selectOnFocus: true
            });
        }

        var priceField = {
            xtype: 'currencyfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.price,
            width: '50%',
            margin: '0 15 0 0',
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
            margin: '0 15 0 0',
            width: '50%',
            border: false,
            style: "font-size:14px;",
            tpl: [
                "<tpl if='price'>",
                "<span>" + Localizer.langResources.CATALOG.Products.ProductEdit.total_price_individual + "</span><br/>",
                "<span class='taco-rolledup-price'>{price}</span>",
                "</tpl>"
            ]
        });


        var salePriceField = {
            xtype: 'currencyfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.sale_price,
            name: 'salePrice',
            margin: "0 0 0 15",
            width: '50%',
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true
        };

        this.creditValueField = Ext.widget({
            xtype: 'currencyfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.gift_card,
            name: 'creditValue',
            margin: "0 15 0 0",
            width: '50%',
            hidden: !isDigitalCredit,
            disabled: (!isDigitalCredit || !this.isGlobal),
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
            width: '50%',
            margin: '0 0 0 15',
            border: false,
            style:"font-size:14px;",
            tpl: [
                "<tpl if='price'>",
                    "<span>" + Localizer.langResources.CATALOG.Products.ProductEdit.sale_price_individual + "</span><br/>",
                    "<span class='taco-rolledup-price'>{price}</span>",
                "</tpl>"
            ]
        });

        var msrpField = {
            xtype: 'currencyfield',
            fieldLabel: 'MSRP',
            name: 'msrp',
            width: '50%',
            margin: "0 15 0 0",
            currencyCode: me.currencyCode,
            hideTrigger: true,
            mouseWheelEnabled: false,
           // emptyText: "Manufacturer's Suggested Retail Price",
            selectOnFocus: true
        };

        var mapField = {
            xtype: 'currencyfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.minimum_advertised_price,
            name: 'map',
            width: '50%',
            margin: '0 15 0 0',
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
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.map_start_date,
            name: 'mapStartDate',
            columnWidth: 0.5,
            margin: "0 15 0 0",
            itemId: 'mapstartdt',
            disabled: !isMapEnabled,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.mapStartField, me.mapEndField, Localizer.langResources.CATALOG.Products.ProductEdit.map_start_date_error, 0);
            }
        });

        this.mapEndField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.map_end_date,
            name: 'mapEndDate',
            itemId: 'mapenddt',
            columnWidth: 0.5,
            margin: "0 0 0 15",
            disabled: !isMapEnabled,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.mapStartField, me.mapEndField, Localizer.langResources.CATALOG.Products.ProductEdit.map_end_date_error, 0);
            }
        });

        // this.imagesConfig = {
        //     fieldLabel: 'Product Image',
        //     name: 'productImages',
        //     xtype: 'taco.imagefield',
        //     width: '100%',
        //     margin: '20 0 0 0',
        //     imageMetadata: me.record.get('productImages'),
        //     filters: function () {
        //         var existingImages = me.record.get('productImages'),
        //             result = [];
        //         if (!existingImages || existingImages.length === 0) return null;
        //         Ext.Array.each(existingImages, function (img) {
        //             result.push({
        //                 property: 'id',
        //                 value: img.cmsId,
        //                 alt: img.alt
        //             });
        //         });
        //         return result;
        //     }()
        // };

        this.activeStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.active_start_date,
            name: 'activeStartDate',
            width: '50%',
            margin: "0 15 0 0",
            itemId: 'activeStartDt',
            hidden: (!this.productInCatalogInfo || this.productInCatalogInfo.get('status') !== 'Scheduled'),
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('activeStartDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                if (me.productInCatalogInfo && me.activeStartDateField.isVisible()) {
                    // if both fields have values we need to validate the dates are in order;
                    var isValid = Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField, Localizer.langResources.CATALOG.Products.ProductEdit.active_start_date_error, 0);
                    return isValid;
                }
                return true;
            }
        });

        this.activeEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.active_end_date,
            name: 'activeEndDate',
            itemId: 'activeEndDt',
            width: '50%',
            margin: "0 0 0 15",
            hidden: (!this.productInCatalogInfo || this.productInCatalogInfo.get('status') !== 'Scheduled'),
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('activeEndDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                if (me.productInCatalogInfo && me.activeEndDateField.isVisible()) {
                    // if both fields have values we need to validate the dates are in order;
                    var isValid = Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField, Localizer.langResources.CATALOG.Products.ProductEdit.active_end_date_error, 0);
                    return isValid;
                }
                return true;
            }
        });

        me.statusCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.status,
            name: 'status',
            labelAlign: 'top',
            hidden: this.isGlobal,
            allowBlank: false,
            editable: false,
            forceSelection: true,
            listConfig: { shadow: false },
            width: '50%',
            minWidth: '200',
            margin: '0 15 0 0',
            store: [['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Disable', 'Disabled']],
            value: this.productInCatalogInfo ? this.productInCatalogInfo.get('status') : 'Disable',
            dateValidationMsg: Localizer.langResources.CATALOG.Products.ProductEdit.date_validation_msg,
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
        });

        var productTitle = {
            xtype: 'textfield',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.product_title,
            allowBlank: false,
            minLength: 3,
            width: '100%',
            margin: '0 0 20 0',
            name: 'productName',
            //hidden: (!this.isGlobal),
            required: true,
            listeners: {
                change: function(cmp, newValue) {
                    cmp.productForm = cmp.productForm || cmp.up('productform');
                    cmp.productForm.fireEvent('productnamechange', this.productInCatalogInfo || this.product, newValue);
                },

                scope: this
            }
        };

        var dirtyControl = {
            xtype: 'textfield',
            allowBlank: true,
            name: 'dirtyControl',
            hidden: true,
            required: true
        };

        var productOverride = {
            xtype: 'productoverride',
            itemId: 'contentOverride',
            overrideFieldName: 'isContentOverridden',
            hideOverride: (me.isGlobal),
            width: '100%',
            items: []
        };

        if (!this.isGlobal) {
            productOverride.items.push(productTitle);
        }
        productOverride.items.push({
            xtype: 'fieldcontainer',
            layout: 'hbox',
            width: '100%',
            items: [
                {
                    xtype: 'htmleditor',
                    flex: 1,
                    enableFont: false,
                    fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.short_description,
                    name: 'productShortDescription',
                    emptyText: Localizer.langResources.CATALOG.Products.ProductEdit.short_emptytext,
                    width: '50%',
                    margin: '0 15 0 0',
                    height: 300,
                    listeners: {
                        editmodechange: htmlEditorEditModeChangeHandler
                    }
                }, {
                    xtype: 'htmleditor',
                    flex: 1,
                    enableFont: false,
                    fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.long_description,
                    name: 'productFullDescription',
                    emptyText: Localizer.langResources.CATALOG.Products.ProductEdit.long_emptytext,
                    //width: classDef.getBufferedWidth(null, '100%'),
                    width: '50%',
                    height: 300,
                    margin: '0 0 0 15',
                    listeners: {
                        editmodechange: htmlEditorEditModeChangeHandler,
                        change: function (cmp, newValue) {
                            cmp.productForm = cmp.productForm || cmp.up('productform');
                            cmp.productForm.fireEvent('productfulldescriptionchange', me.productInCatalogInfo || me.product, newValue);
                        }
                    }
                }
            ]
        });

        // this.productTypeOptionsStore = Ext.create('Ext.data.Store',
        //     {
        //         fields: ['attributeFQN', "name"],
        //         data: (function() {
        //             if(me.product.get('options')) {
        //                return me.product.get('options').map(function(item) {
        //                     var found = me.record.productTypeRecord.get('options').find(function(option) {
        //                         return option.attributeFQN === item.attributeFQN;
        //                     });
                
        //                     return {
        //                             id: item.attributeFQN,
        //                             attributeFQN : item.attributeFQN,
        //                             name: found.adminName 
        //                     };
        //                 })
        //             } else {
        //                 return [];
        //             }
        //         })()
        //     });

    

        me.product.getOptions().on('valuesSetComplete', function() {
            var options = me.product.getOptions();

            Ext.Array.forEach(me.product.get('productImageGroups'), function(imageGroups){
                var tags = imageGroups.productImageGroupTags || [];
                if(tags.length > 0) {
                    Ext.Array.forEach(tags, function(tag){
                        var option = options.findRecord('attributeFQN', tag.fqn);
                        Ext.Array.forEach(tag.values, function(value, idx){
                            if(option.get('values').indexOf(value) < 0){
                                tag.values.splice(idx, 1)
                            }
                        });
                    });
                }
            });

            me.imageForm = Ext.create('Taco.view.product.subform.Images', {
                isGlobal: me.isGlobal,
                product: me.product,
                productForm: me.productForm,
                //productTypeOptionsStore: this.productTypeOptionsStore,
                persistChangesToModel: me.persistChangesToModel,
                productInCatalogInfo: me.productInCatalogInfo,
                hidden: me.hidden,
                globalForm: me.globalForm
            });

        });

        this.imageForm = Ext.create('Taco.view.product.subform.Images', {
            isGlobal: this.isGlobal,
            product: this.product,
            productForm: this.productForm,
            //productTypeOptionsStore: this.productTypeOptionsStore,
            persistChangesToModel: this.persistChangesToModel,
            productInCatalogInfo: this.productInCatalogInfo,
            hidden: this.hidden,
            globalForm: this.globalForm
        });


        productOverride.items.push(this.imageForm);

        if (this.isGlobal) {
            this.items = [
                productTitle,
                dirtyControl,
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    width: '100%',
                    items: [
                        this.productCodeField
                    ]
                }
            ];
        } else {
            this.items = [
                {
                    xtype: 'formform',
                    persistChangesToModel: true,
                    record: this.productInCatalogInfo,
                    hidden: this.isGlobal,
                    header: false,
                    layout: 'hbox',
                    width: '100%',
                    items: [
                        me.statusCombo,
                        {
                            xtype: 'datefield',
                            fieldLabel: 'First Available Date',
                            name: 'dateFirstAvailableInCatalog',
                            labelAlign: 'top',
                            allowBlank: false,
                            hidden: this.isGlobal,
                            width: '50%',
                            margin: '0 0 0 15',
                            value: dateFirstAvailable,
                            itemId: 'first-avail-date',
                            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                elementId: 'first-avail-date',
                                hoverTarget: 'label',
                                messageKey: 'product.general.dateFirstAvailable',
                                offsetLeft: 20,
                                offsetTop: 15
                            })
                        }
                    ]
                }
            ];
        }

        this.items.push({
            xtype: 'formform',
            persistChangesToModel: true,
            record: this.productInCatalogInfo,
            width: '100%',
            header: false,
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    width: '100%',
                    margin: '20 0 0 0',
                    items: [
                        this.activeStartDateField,
                        this.activeEndDateField
                    ]
                }
            ]
        });
        this.items.push({
            xtype: 'fieldcontainer',
            layout: 'hbox',
            width: '100%',
            items: [
                this.productTypeField,
                this.productUsageField
            ]
        });
        this.items.push(productOverride);

        this.items = Taco.core.util.Common.filterNulls(this.items);

        //me.mon(Taco.app, 'image_metadata_updated', me.imageMetadataUpdated, me);

        this.priceOverRideConfig = {
            xtype: 'productoverride',
            //width: classDef.getBufferedWidth(),
            width: '100%',
            overrideFieldName: 'isPriceOverridden',
            hideOverride: (me.isGlobal),
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
                                salePriceField
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            margin: '20 0 0 0',
                            items: [
                                me.creditValueField,
                                {
                                    xtype: 'component',
                                    width: '50%',
                                    margin: '0 0 0 15'
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            itemId: "rollupBundleContainer",
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
                            margin: '20 0 0 0',
                            items: [
                                msrpField,
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'column',
                                    width: '50%',
                                    margin: '0 0 0 15',
                                    items: [
                                        this.costField,
                                        this.isTaxableField
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    width: '100%',
                    margin: '20 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            width: '100%',
                            items: [
                                mapField,
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'column',
                                    width: '50%',
                                    margin: '0 0 0 15',
                                    items: [
                                        this.mapStartField,
                                        this.mapEndField
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    width: '100%',
                    margin: '20 0 0 0',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            hidden: !this.isGlobal,
                            layout: 'hbox',
                            width: '100%',
                            items: [
                                this.discountsRestrictedField,
                                {
                                    xtype: 'fieldcontainer',
                                    hidden: !this.isGlobal,
                                    layout: 'column',
                                    width: '50%',
                                    margin: '0 0 0 15',
                                    items: [
                                        this.discountsRestrictedStartField,
                                        this.discountsRestrictedEndField
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',
                    ui: 'subform-subform',
                    width: '100%',
                    margin: '20 0 0 0',
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
                            hidden: !this.isGlobal,
                            layout: 'hbox',
                            width: '100%',
                            margin: '20 0 0 0',
                            items: [
                                this.distPartNumField,
                                {
                                    xtype: "box",
                                    margin: "0 0 0 15"
                                }
                            ]
                        }
                    ]
                }
            ]
        };


        this.items.push(this.priceOverRideConfig);

        var dateFirstAvailable = this.productInCatalogInfo ? this.productInCatalogInfo.get('dateFirstAvailableInCatalog') : "";
        if (Ext.isEmpty(dateFirstAvailable)) {
            dateFirstAvailable = new Date();
        }

        this.callParent(arguments);

        if (!this.isGlobal) {
            this.mon(Taco.app, 'bundle-item-catalog-sync', this.updatePriceUI, this);
        }

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
                if (!me.isGlobal) {
                    me.mon(Taco.app, 'bundle-item-catalog-added', me.updatePriceUI, me);
                }
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
            bundleItemTotals = (this.isGlobal) ? this.record.getBundleItemTotals() : this.productInCatalogInfo.getBundleItemTotals();

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

    onProductTypeChange: function (selectField, val) {
        var me = this;
        Taco.model.ProductType.load(val, {
            scope: this,
            success: me.onProductTypeLoad,
            failure: function(record, operation) {
                if (operation.error) {
                    Taco.core.util.ExceptionWhiner.handleRemoteFailure(operation.error);
                } else {
                    Taco.app.fireEvent('setmessage', 'Unexpected error: could not find product type', 'error');
                }
            }
        });
    },

    onProductTypeLoad: function (record) {
        var me = this,
            productTypeRecord = record,
            productTypeId = productTypeRecord.get('id'),
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
        product.set('productTypeId', productTypeId);

        if (!me.propertiesForm) {
            me.propertiesForm = parentForm.down('productpropertiesform');
        }

        if (me.propertiesForm) {
            me.propertiesForm.loadByProductTypeId(productTypeId);
        }

        if (!me.extrasForm) {
            me.extrasForm = parentForm.down('productextrasform');
        }

        if (me.extrasForm) {
            me.extrasForm.loadByProductTypeId(productTypeId);
        }

        if (!me.optionsForm) {
            me.optionsForm = parentForm.down('taco-product-options');
        }

        if (me.optionsForm) {
            me.optionsForm.loadByProductTypeId(productTypeId);
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
        // var uploadedImages = [],
        //     form = this.getForm(),
        //     productImagesField = form.findField("productImages");

        // if (productImagesField) {
        //     uploadedImages = Ext.Array.filter(productImagesField.getValue(), function(img) {
        //         return img.isUploaded;
        //     });
        // }

        var uploadedImages = Ext.Array.filter(this.record.data.productImages, function(img) {
            return img.isUploaded;
        });

        var dateFirstAvailableInCatalog = this.findField("dateFirstAvailableInCatalog");
        if (this.productInCatalogInfo) {
            this.productInCatalogInfo.set('dateFirstAvailableInCatalog', dateFirstAvailableInCatalog.getValue());
        }

        // need to update the record manually. form.Form does not extract the value from the imageField automatically.
        //this.record.set("productImages", uploadedImages);
        return true;
    }
});
