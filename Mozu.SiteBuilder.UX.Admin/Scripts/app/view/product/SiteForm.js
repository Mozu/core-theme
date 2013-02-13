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
    overrideCount: 0,


    header: false,
    persistChangesToModel: true,

    initComponent: function () {
        var subFormCfg;

        this.defaults = this.defaults || {};  // TODO: Are these two lines necessary?
        this.defaults.isSingleSite = this.isSingleSite;

        this.siteId = this.record.get('siteId');

        subFormCfg = {
            record: this.record,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            isSingleSite: this.isSingleSite,
            isGlobal: false,
            persistChangesToModel: true
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

        this.on({
            overrideCountChange: this.handleOverrideChange,
            scope: this
        });
    },

    /**
     * @private
     * @param {int} delta
     *
     * Event handler called when this container receives an 'overrideCountChange' event.
     * This can be used to notify the tab when to change it's appearance to reflect the
     * fact that it contains an overridden fieldset.
     */
    handleOverrideChange: function ( delta ) {
        var tab = this.getTabComponent();
        if( tab ) {
            this.overrideCount += delta;
            if( this.overrideCount ) {
                tab.addCls(Taco.baseCSSPrefix + 'has-overrides');
            } else {
                tab.removeCls(Taco.baseCSSPrefix + 'has-overrides');
            }
        }
    },

    /**
     * @public
     * @return {Taco.core.ux.tab.Tab|Boolean}
     *
     * Gets the Tab component associated with this Form.
     */
    getTabComponent: function () {
        if( this.tab ) {
            return this.tab;
        }
        return false;
    },

    addSaveTasks: function (tasks) {
        if (this.isSingleSite) {
            tasks.add([{
                key: 'save-product-record',
                saveRecord: this.product
            }]);
        }

        return tasks;
    }
});