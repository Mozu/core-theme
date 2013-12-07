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
                xtype: 'textfield'
            });


            this.productTypeField = Ext.widget({
                //xtype: 'selectfield',
                xtype: 'combobox',
                fieldLabel: 'Product Type',
                name: 'productTypeId',
                readOnly: !this.product.phantom,
                required: true,
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


        }
        
        



        
        
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
                    store: [[false, 'Hide in website'], [true, 'Show on website']],
                    value: this.productInCatalogInfo ? this.productInCatalogInfo .get('isActive') : false
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
                        me.up("productform").fireEvent('productnamechange', this.productInCatalogInfo || this.product, newValue);
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
                    editmodechange: htmlEditorEditModeChangeHandler
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
                    xtype: "fieldcontainer",
                    layout: 'hbox',
                    fieldLabel: 'Price',
                    items: [
                        {
                            xtype:"numberfield",
                            width: 200,
                            name: 'price',
                            forcePrecision:true,
                            hideTrigger: true,
                            mouseWheelEnabled: false,
                            selectOnFocus: true,
                            emptyText: '$10.00'
                        },{
                            xtype: "editabledisplayfield",
                            itemId:"rollupBundlePrice",
                            flex: 1,
                            margin: "0 0 0 5",
                            border:false,
                            tpl: [
                                "<tpl if='price'>",
                                    "<span class='taco-rolledup-price'>{price:usMoney}</span> (Total price of individual products)",
                                "</tpl>"
                            ]
                        }
                    ],
                    width: "100%"
                },
                {
                    xtype: "fieldcontainer",
                    layout: 'hbox',
                    fieldLabel: 'Sale Price',
                    items: [
                        {
                            xtype: "numberfield",
                            width: 200,
                            forcePrecision:true,
                            name: 'salePrice',
                            emptyText: 'Enter the sale price here',
                            //cls: Taco.baseCSSPrefix + 'flex-field-spacing'
                            hideTrigger: true,
                            mouseWheelEnabled: false,
                            selectOnFocus: true
                        
                        }, {
                            xtype: "editabledisplayfield",
                            itemId: "rollupBundleSalePrice",
                            flex: 1,
                            margin: "0 0 0 5",
                            border: false,
                            tpl: [
                                "<tpl if='price'>",
                                    "<span class='taco-rolledup-price'>{price:usMoney}</span> (Total sale price of individual products)",
                                "</tpl>"
                            ]
                        }
                    ],
                    width: "100%"
                }
                
                
            ]
        }];

        
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
            rollupBundlePriceField = this.down('#rollupBundlePrice'),
            price = 0,
            rollupBundleSalePriceField = this.down('#rollupBundleSalePrice'),
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

        rollupBundlePriceField.setValue({
            price: price
        });
        
        
        rollupBundleSalePriceField.setValue({
            price:salePrice
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

    }
});