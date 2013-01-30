/**
 * @class Taco.view.product.SiteForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.SiteForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.productsiteform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping',
        'Taco.view.product.subform.Categories',
        'Taco.view.product.subform.Merchandising',
        'Taco.view.product.subform.SEO'
    ],
    // id: "productSingleSiteForm",
    title: 'Site Form', // *** For tab title
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'single-site-admin-form'],

    initComponent: function () {
        this.defaults = this.defaults || {};
        this.defaults.isSingleSite = this.isSingleSite;

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
            Ext.create('Taco.view.product.subform.Shipping'),
            Ext.create('Taco.view.product.subform.Categories'),
            Ext.create('Taco.view.product.subform.Merchandising'),
            Ext.create('Taco.view.product.subform.SEO')
        ];

        this.callParent(arguments);

        // *** Enable override frames where applicable
        if(!this.isSingleSite) {
            // *** Get an array of all Override Containers (containers with xtype: override)
            var overrides = this.query('override');

            // *** Loop over override array, add CSS class 'active' to each, and disable their children fields.
            Ext.each( overrides, function (overrideContainer) {
                overrideContainer.addCls('active').disable( true );
            });
        }
    }
});