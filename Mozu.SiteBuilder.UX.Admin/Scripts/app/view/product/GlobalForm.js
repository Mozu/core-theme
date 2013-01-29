/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping'
    ],
    mixins: {
        scrollspy: 'Taco.core.ux.ScrollSpy'
    },
    scrollSpyOffset: 150,
    // id: "productSingleSiteForm",
    title: 'Global', // *** For tab title

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

        // *** For readability purposes
        this.style = this.style || {};
        this.style["padding-bottom"] = '200px';

        this.callParent( arguments );
    },

    constructor: function () {
        this.callParent( arguments );
        // ExtJS does not call mixin constructors, because it is bad and should feel bad
        this.mixins.scrollspy.constructor.call(this);
    }
});