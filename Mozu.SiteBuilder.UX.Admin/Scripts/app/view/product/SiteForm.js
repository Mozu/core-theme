/**
 * @class Taco.view.product.SiteForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.SiteForm', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm2',
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
    mixins: {
        scrollspy: 'Taco.core.ux.ScrollSpy' // TODO: resolve JS error with this and getEl()
    },
    scrollSpyOffset: 240,

    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'single-site-admin-form'],
    overrideCount: 0,

    header: false,
    persistChangesToModel: true,

    initComponent: function () {
        var subFormCfg,
            items = [];

        this.defaults = this.defaults || {};
        this.defaults.isSingleSite = this.isSingleSite;

        this.siteId = this.record.get('siteId');

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title']
        });

        this.callParent(arguments);

        this.buildForm();

        this.on({
            overrideChange: this.handleOverrideChange,
            scrollspy: this.updateScrollPosition,
            render:this.handleOverrideChange,
                
            scope: this
        });
    },

    buildForm: function () {
        var items = [],
            subFormCfg = {
                record: this.record,
                product: this.product,
                productInCatalogInfo: this.productInCatalogInfo,
                isSingleSite: this.isSingleSite,
                isGlobal: false,
                persistChangesToModel: true
            };

        Ext.Array.push(items, [
            Ext.create('Taco.view.product.subform.General', subFormCfg)
        ]);

        if (this.isSingleSite) {
            Ext.Array.push(items, [
                Ext.create('Taco.view.product.subform.Inventory', subFormCfg),
                Ext.create('Taco.view.product.subform.Properties', subFormCfg),
                Ext.create('Taco.view.product.subform.Extras', subFormCfg),
                Ext.create('Taco.view.product.subform.Shipping', subFormCfg)
            ]);

            
        }

        Ext.Array.push(items, [
            
            Ext.create('Taco.view.product.subform.Categories', subFormCfg),
            Ext.create('Taco.view.product.subform.Merchandising', subFormCfg),
            Ext.create('Taco.view.product.subform.SEO', subFormCfg)
        ]);

        this.loadNavItems(items);
    },

    constructor: function () {
        this.callParent(arguments);
        // ExtJs does not call mixin constructors, because it is bad and should feel bad
        this.mixins.scrollspy.constructor.call(this); // TODO: uncomment this when scrollspy works
    },

    /**
     *
     * Event handler called when this container receives an 'overrideChange' event.
     * This can be used to notify the tab when to change it's appearance to reflect the
     * fact that it contains an overridden fieldset.
     */
    handleOverrideChange: function (  ) {
        var tab = this.getTabComponent(),
            isOverridden = this.productInCatalogInfo.get('isContentOverridden') || this.productInCatalogInfo.get('isPriceOverridden') || this.productInCatalogInfo.get('isSEOContentOverridden');
        if (tab) {
            if (isOverridden) {
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
                saveRecord: this.product,
                dependencies: 'bind-extras'
            }, {
                key: 'bind-extras',
                fn: function (tasks) {
                    console.log('bind-extras');
                    var extrasForm = this.down('productextrasform');

                    if (extrasForm) {
                        extrasForm.bindExtras();
                    }

                    tasks.callback();
                },
                scope: this
            }]);
            this.addStoreSaveTasks(tasks);
        }

        return tasks;
    },

    updateScrollPosition: function (newTarget, oldTarget) {
        // console.log('\nupdateScrollPosition', newTarget.sideNavLink, oldTarget.sideNavLink);
        if( newTarget && newTarget.sideNavLink ) {
            newTarget.sideNavLink.addCls('scrollspy');
        }
        if( oldTarget && oldTarget.sideNavLink ) {
            oldTarget.sideNavLink.removeCls('scrollspy');
        }
    }
});