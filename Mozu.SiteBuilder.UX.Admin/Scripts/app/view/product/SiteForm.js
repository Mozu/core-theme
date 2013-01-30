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
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'single-site-admin-form'],

    initComponent: function () {
        this.defaults = this.defaults || {};
        this.defaults.isSingleSite = this.isSingleSite;

        this.editTitle = this.createTitle = 'Site ID: ' + this.record.get('siteId');

        var subFormCfg = {
            record: this.record,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            isSingleSite: true
        };

        this.generalForm = Ext.create('Taco.view.product.subform.General', subFormCfg);
        this.inventoryForm = Ext.create('Taco.view.product.subform.Inventory', subFormCfg);
        this.propertyForm = Ext.create('Taco.view.product.subform.Properties', subFormCfg);
        this.extrasForm = Ext.create('Taco.view.product.subform.Extras', subFormCfg);
        this.shippingForm = Ext.create('Taco.view.product.subform.Shipping', subFormCfg);
        this.categoriesForm = Ext.create('Taco.view.product.subform.Categories', subFormCfg);
        this.merchandisingForm = Ext.create('Taco.view.product.subform.Merchandising', subFormCfg);
        this.seoForm = Ext.create('Taco.view.product.subform.SEO', subFormCfg);

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
            this.generalForm,
            this.inventoryForm,
            this.propertyForm,
            this.extrasForm,
            this.shippingForm,
            this.categoriesForm,
            this.merchandisingForm,
            this.seoForm
        ];

        this.callParent(arguments);
    }
});