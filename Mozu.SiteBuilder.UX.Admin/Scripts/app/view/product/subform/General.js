/**
 * @class Taco.view.product.subform.General
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.General', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'General',

    initComponent: function () {
        var readOnly;

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

        console.log('length = ', this.productTypeStore.data.length, readOnly);

        this.items = [{
            fieldLabel: 'Code',
            name: 'productCode',
            emptyText: '#######',
            readOnly: readOnly,
            required: true,
            width: 200,
            xtype: 'textfield'
        }, {
            xtype: 'productoverride',
            overrideFieldName: 'isContentOverridden',
            hideOverride: this.isSingleSite,
            width: '100%',
            items: [{
                fieldLabel: 'Name',

                name: 'productName',
                emptyText: 'Some product description',
                width: "100%",
                required: true
            }, {
                fieldLabel: 'Description',
                name: 'productFullDescription',
                emptyText: 'Words, words, and more words.  Also, with lists.',
                xtype: 'textarea',
                width: "100%",
                required: true
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
        }, {
            fieldLabel: 'Product Type',
            name: 'productTypeId',
            readOnly: readOnly,
            required: true,
            width: 200,
            xtype: 'selectfield',
            displayField: 'name',
            valueField: 'id',
            store: this.productTypeStore
        }];

        this.callParent( arguments );
    }
});