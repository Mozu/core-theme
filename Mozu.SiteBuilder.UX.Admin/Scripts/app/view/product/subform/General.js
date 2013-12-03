/**
 * @class Taco.view.product.subform.General
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

        

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

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

        
        
        readOnly = this.isEdit() || !(this.isSingleSite || this.isGlobal);
        visable = !readOnly || this.isEdit();
        requiredContent = this.isSingleSite || this.isGlobal;
        this.items = [{
            fieldLabel: 'Code',
            name: 'productCode',
            emptyText: '#######',
            readOnly: readOnly,
            required: true && visable,
            allowBlank: false,
            minLength: visable ? 3 : 0,
            hidden: !visable,
            width: 200,
            xtype: 'textfield'
        }, {
            xtype: 'selectfield',
            fieldLabel: 'Product Type',
            name: 'productTypeId',
            readOnly: readOnly && this.product.get('productTypeId'),
            required: true && visable,
            queryMode: 'local',
            hidden: !visable,
            // width: 200,
            shrinkWrap: 3,
            displayField: 'name',
            valueField: 'id',
            store: this.productTypeStore,
            listeners: {
                change: this.onProductTypeChange
            }
        }, {
            xtype: 'selectfield',
            itemId:"productUsageField",
            fieldLabel: 'Product Usage',
            name: 'productUsage',
            readOnly: !this.product.phantom,
            // field is only editable once a productType is selected;
            disabled: !this.product.get('productTypeId'),
            required: true && visable,
            queryMode: 'local',
            hidden: !visable,
            width: 300,
            shrinkWrap: 3,
            displayField: 'name',
            valueField: 'id',
            store: this.productUsageStore,
            listeners: {
                change: this.onProductUsageChange
            }
        }, {
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
                required: true
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
            defaults: {
                width: 200
            },
            items: [{
                fieldLabel: 'Price',
                name: 'price',
                emptyText: '$10.00'
            }, {
                fieldLabel: 'Sale Price',
                name: 'salePrice',
                emptyText: 'Enter the sale price here',
                cls: Taco.baseCSSPrefix + 'flex-field-spacing'
            }]
        }];

        this.callParent(arguments);
        
        // if we already have a product type selected; we need to filter the productUsage combo
        var productTypeId = this.product.get('productTypeId');
        if (productTypeId) {
            var productTypeRecord = this.productTypeStore.getById(productTypeId);
            me.filterProductUsageField(productTypeRecord.get("productUsages"));
        }

    },

    
    /**
    * when the user chagnes the productUsage type selection, will need to alter the visibility and behavior of several components;
    */ 
    onProductUsageChange: function (field, value) {
        
        var me = this,
            parentForm = me.up('productsiteform, productglobalform'),
            bundleSubForm = parentForm.down('#bundleSubForm');
        
        
        parentForm.onProductUsageChange(me, value);

        // add/ remove the bundle items subPanel based on the productUsage value;;
        

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