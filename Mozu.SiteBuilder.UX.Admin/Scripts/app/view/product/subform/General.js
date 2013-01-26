/**
 * @class Taco.view.product.subform.General
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.General', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'General',

    initComponent: function () {
        this.defaults.width = 200;

        this.items = [{
            fieldLabel: 'Code',
            name: 'productCode',
            emptyText: '#######',
            required: true
        }, {
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
        }, {
            fieldLabel: 'Price',
            name: 'price',
            emptyText: '$10.00',
            required: true
        }, {
            fieldLabel: 'Sale Price',
            name: 'salePrice',
            emptyText: 'Enter the sale price here',
            cls: Taco.baseCSSPrefix + 'flex-field-spacing'
        }];

        this.callParent( arguments );
    }
});