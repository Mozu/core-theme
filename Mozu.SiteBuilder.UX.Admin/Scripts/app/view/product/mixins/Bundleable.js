/**
 * @class Taco.view.product.mixins.Bundleable
 * Grid Mixin that adds support for bundling. 
  
  // to include this mixin in your class:

        mixins: {
            bundleable: 'Taco.view.product.mixins.Bundleable'
        },


  
    < ... code fragment ... >

        initComponent: function (){

            //initialize the grid paging toolbar
            this.mixins.bundleable.constructor.apply(this, arguments);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.view.product.mixins.Bundleable', {
    requires: [
    ],
    
    constructor: function () {
        this.initBundleable();
    },
    
    initBundleable: function () {
        var me = this;
        

    },
    
    updateSubFormVisibility: function (productUsageValue) {
        var me = this,
            viewConfig,
            siteConfig,
            globalConfig,
            subForms = {
                general: me.down('productgeneralsubform'),
                inventory: me.down('productinventorysubform'),
                options: me.down('taco-product-options'),
                properties: me.down('productpropertiesform'),
                extras: me.down('productextrasform'),
                shipping: me.down('productshippingsubform'),
                seo: me.down('productseosubform'),
                categories: me.down('productcategoriessubform'),
                merchandising: me.down('productmerchandisingsubform')
            },
            value = productUsageValue || this.product.get('productUsage');
        
        // siteForm
        siteConfig = {
            general: true,
            categories: true,
            merchandising: true,
            seo: true
        };

        // siteForm and singleSite
        if (!this.isGlobal && this.isSingleSite) {
            Ext.apply(siteConfig, {
                inventory: true,
                options: true,
                properties: true,
                extras: true,
                shipping: true
            });
        }

        // globalForm
        globalConfig = {
            general: true,
            shipping: true,
            merchandising: true,
            seo: true
        };

        // globalForm and NOT singleSite
        if (this.isGlobal && !this.isSingleSite) {
            Ext.apply(globalConfig, {
                inventory: true,
                options: true,
                properties: true,
                extras: true
            });
        }


        if (this.isGlobal) {
            // we are looking at a global view;
            viewConfig = Ext.clone(globalConfig);
        } else {
            // we are looking at a site view. apply the siteConfig
            viewConfig = Ext.clone(siteConfig);
        }


        // do any productUsage specific visibility overrides
        switch (value) {
            case "Bundle":
                
                Ext.apply(viewConfig, {
                    options: false
                });
                
                if (this.isGlobal || this.isSingleSite) {
                    
                    // a global site or a siteForm when there is a singleSite enabled;
                    this.enableBundling();
                    Ext.apply(viewConfig, {
                        bundle: true
                    });
                    
                } else {
                    
                    // this is when you have multiple sites enabled and this is a siteform
                    this.disableBundling();
                    Ext.apply(viewConfig, {
                        bundle: false
                    });
                }

                break;
            case "Standard":
                this.disableBundling();
                Ext.apply(viewConfig, {
                    bundle: false,
                    options: false
                });

                break;
            case "Configurable":
                this.disableBundling();
                Ext.apply(viewConfig, {
                    bundle: false,
                    options: true
                });

                break;
            case "Component":
                this.disableBundling();
                Ext.apply(viewConfig, {
                    bundle: false,
                    options: false,
                    extras: false,
                    seo: false
                });
                break;
        }
        
        //if there is no productUsageValue Selected need to ignore the stuff above and disable everything except general subform for the globale tab;
        
        if(!value || value=="") {
            this.disableBundling();
            viewConfig = {
                general: true,
                bundle:false,
                inventory: false,
                options: false,
                properties: false,
                extras: false,
                shipping: false,
                seo: true,
                categories: true,
                merchandising: true
            };
        
        }

        Ext.suspendLayouts();
        Ext.Object.each(viewConfig, function (key, value, me) {
            // only toggle visiblity if its present in the form;
            // note: categories will not be present until the user enables a site;
            if (subForms[key]) {
                // hide or show the subform based on the viewConfig;
                subForms[key].setVisible(value);
            }
        });

        Ext.resumeLayouts(true);

        me.loadNavItems();


    },

    onProductUsageChange: function (generalView, value) {
        var me = this;
        // persist the value to the record;
        this.product.set('productUsage', value);

        // hide and show the various subForms based on selection;
        this.updateSubFormVisibility(value);
        
        // fire event so the varios subForms can update based on the change;
        me.up("productform").fireEvent('productusagechange', me, value);
    },
    
    enableBundling : function() {
        var me = this,
            bundleSubForm = me.down('#bundleSubForm')
        
        if (!bundleSubForm) {
            me.formContainer.insert(
                1,
                Ext.create('Taco.view.product.subform.Bundle', {
                    isGlobal: true,
                    product: me.product,
                    persistChangesToModel: true
                }
                )
            );
        }
    },

    disableBundling: function () {
        var me = this,
            bundleSubForm = me.down('#bundleSubForm')
        
        if (bundleSubForm) {
            // if we already have a bundle subForm destroy it;
            bundleSubForm.destroy();
        }
        
        
        // hide the rollup prices (general sub form)
        // update product images (general sub form)

        // update the shipping size and weight;

        // update inventory


    }
});