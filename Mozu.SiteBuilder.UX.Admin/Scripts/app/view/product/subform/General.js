/**
 * @class Taco.view.product.subform.General
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.General', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.shared.view.field.Image'
    ],

    title: 'General',

    initComponent: function () {
        var readOnly,requiredContent,visable;

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.defaults = {
            width: 200,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.record = this.product;

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
            hidden :!visable,
            // width: 200,
            shrinkWrap: 3,
            displayField: 'name',
            valueField: 'id',
            store: this.productTypeStore,
            listeners: {
                change: this.onProductTypeChange
            }
        }, {
            xtype:'formform',
            persistChangesToModel: true,
            record: this.productInSiteInfo,
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
                    value: this.productInSiteInfo ? this.productInSiteInfo .get('isActive') : false
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
                width: '100%',
                //fontFamilies: ['MyriadWebProRegular', 'Arial', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'],
                required: true
            }, {
                xtype: 'htmleditor',
                enableFont:false,
                fieldLabel: 'Full Description',
                name: 'productFullDescription',
                emptyText: 'Words, words, and more words.  Also, with lists.',
                //fontFamilies: ['MyriadWebProRegular', 'Arial', 'Courier New', 'Tahoma', 'Times New Roman', 'Verdana'],
                width: '100%',
                required: true
            }, {
                fieldLabel: 'Product Image',
                name: 'productImages',
                xtype: 'taco.imagefield',
                width: '100%'
            }]
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
                emptyText: '$10.00',
                required: true
            }, {
                fieldLabel: 'Sale Price',
                name: 'salePrice',
                emptyText: 'Enter the sale price here',
                cls: Taco.baseCSSPrefix + 'flex-field-spacing'
            }]
        }];

        this.callParent( arguments );
    },

    onProductTypeChange: function (selectField, value) {
        var parentForm;
        
        parentForm = this.up('productsiteform, productglobalform');

        if (!parentForm) {
            return;
        }

        if (!this.propertiesForm) {
            this.propertiesForm = parentForm.down('productpropertiesform');
        }

        if (this.propertiesForm) {
            this.propertiesForm.loadByProductTypeId(value);    
        }

        if (!this.extrasForm) {
            this.extrasForm = parentForm.down('productextrasform');
        }

        if (this.extrasForm) {
            this.extrasForm.loadByProductTypeId(value);
        }

        if (!this.optionsForm) {
            this.optionsForm = parentForm.down('optionproductform');
        }

        if (this.optionsForm) {
            this.optionsForm.loadByProductTypeId(value);
        }

    }
});