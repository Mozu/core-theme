/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm2',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Bundle',
        'Taco.view.product.subform.Options',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping',
        'Taco.view.product.subform.SEO'
        //'Taco.view.product.subform.CrossSale'
    ],
    
    mixins: {
        bundleable: 'Taco.view.product.mixins.Bundleable'
    },


    

    // need to move the left nav up to align with the top edge of the tab bar;
    leftNavTopOffset: -60,
    

    persistChangesToModel: true,

    title: 'Global',
    header: false,
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'global-admin-form'],

    initComponent: function () {
        var me = this,
            subformCfg = {
                isGlobal: true,
                product: this.record,
                persistChangesToModel: true
            };

        me.isGlobal = true;

        me.product = this.record;
        
        this.callParent(arguments);

        //initialize the bundling mixin
        this.mixins.bundleable.constructor.apply(this, arguments);

        this.buildForm();
        
        
    },

    buildForm: function () {
        
        var subFormCfg = {
                isGlobal: true,
                product: this.record,
                productForm: this.productForm,
                persistChangesToModel: true,
                hidden:false
            },
            items = [];


        var globalSubFormCfg = {
            isGlobal: true,
            product: this.record,
            productForm: this.productForm,
            persistChangesToModel: true,
            hidden: false
        };
        
        Ext.Array.push(items, [
            Ext.create('Taco.view.product.subform.General', globalSubFormCfg)
        ]);
        
        // if this product has a product usage of type "Bundle" add the subPanel for managing its items
        
        if (this.record.get("productUsage") == "Bundle") {
            Ext.Array.push(items, [
                Ext.create('Taco.view.product.subform.Bundle', subFormCfg)
            ]);
        }

        if (!this.isSingleSite) {
            Ext.Array.push(items, [
                Ext.create('Taco.view.product.subform.Inventory', subFormCfg),
                Ext.create('Taco.view.product.subform.Options', subFormCfg),
                Ext.create('Taco.view.product.subform.Properties', subFormCfg),
                Ext.create('Taco.view.product.subform.Extras', subFormCfg)
            ]);
        }

        Ext.Array.push(items, [
            Ext.create('Taco.view.product.subform.Shipping', subFormCfg),
            Ext.create('Taco.view.product.subform.SEO', subFormCfg)
        ]);

        this.loadNavItems(items);

        

        //need to initialize the visibility of the subForms
        this.updateSubFormVisibility(this.product.get('productUsage'));
    }
});