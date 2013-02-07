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
    
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'single-site-admin-form'],

    header: false,
    persistChangesToModel: true,

    initComponent: function () {
        var subFormCfg;

        this.defaults = this.defaults || {};
        this.defaults.isSingleSite = this.isSingleSite;

        this.editTitle = this.createTitle = 'Site ID: ' + this.record.get('siteId');

        subFormCfg = {
            record: this.record,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            isSingleSite: this.isSingleSite,
            isGlobal: false
        };

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
            Ext.create('Taco.view.product.subform.General', subFormCfg),
            Ext.create('Taco.view.product.subform.Inventory', subFormCfg),
            Ext.create('Taco.view.product.subform.Properties', subFormCfg),
            Ext.create('Taco.view.product.subform.Extras', subFormCfg),
            Ext.create('Taco.view.product.subform.Shipping', subFormCfg),
            Ext.create('Taco.view.product.subform.Categories', subFormCfg),
            Ext.create('Taco.view.product.subform.Merchandising', subFormCfg),
            Ext.create('Taco.view.product.subform.SEO', subFormCfg)
        ];

        this.callParent(arguments);
    },

    addSaveTasks: function (tasks) {
        if (this.isSingleSite) {
            tasks.add([{
                key: 'save-product-record',
                saveRecord: this.record
            }]);
        }

        return tasks;
    }
});