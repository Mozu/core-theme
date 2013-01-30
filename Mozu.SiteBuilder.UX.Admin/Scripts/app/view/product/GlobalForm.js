/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping'
    ],

    scrollSpyOffset: 150,

    createTitle: 'Global', // *** For tab title
    editTitle: 'Global',
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'global-admin-form'],

    initComponent: function () {
        this.items = [
            {
                xtype: 'combobox',
                fieldLabel: 'Status',
                labelAlign: 'top',
                allowBlank: false,
                forceSelection: true,
                store: ['Hide in website', 'Show on website'],
                value: 'Hide in website'
            },
            Ext.create('Taco.view.product.subform.General'),
            Ext.create('Taco.view.product.subform.Inventory'),
            Ext.create('Taco.view.product.subform.Properties'),
            Ext.create('Taco.view.product.subform.Extras'),
            Ext.create('Taco.view.product.subform.Shipping')
        ];

        this.callParent( arguments );
    }
});