/**
 * @class Taco.view.product.option.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.option.Form', {
    extend: 'Taco.core.ux.form.Form',

    requres: [
        'Taco.view.product.option.VariationGrid',
        'Taco.view.product.option.Modal'
    ],

    title: 'Options',

    initComponent: function () {

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.options = Ext.widget({
            xtype: 'container',
            items: [{
                html: 'THING 1'
            }]
        });

        this.variations = Ext.widget({
            xtype: 'container',
            items: [{
                html: 'THING 2'
            }]
        });

        this.items = [{
            xtype: 'container',
            items: [
                this.options,
                this.variations
            ]
        }];

        this.callParent(arguments);

        if (this.productTypeStore.loading) {
            this.productTypeStore.on('load', this.loadByProductTypeId, this, { single: true });
        } else {
            this.loadByProductTypeId();
        }
    },

    loadByProductTypeId: function () {
        var productTypeId = this.product.get('productTypeId');
        
        this.productType = this.productTypeStore.getById(productTypeId);

        if (!this.productType) return;

        this.productTypeOptions = this.productType.getOptions();

        this.buildOptions();
        this.buildVariations();
    },

    buildOptions: function () {
        var items = [];

        this.productTypeOptions.each(function (ptAttribute) {
            items.push({
                xtype: 'component',
                html: ptAttribute.get('attributeName')
            });
        });

        items.push({
            xtype: 'primarybutton',
            text: 'Select Values',
            click: this.launchModal,
            scope: this
        });

        this.options.removeAll();
        this.options.add(items);
    },

    buildVariations: function () {
        
        this.grid = Ext.create('Taco.view.product.option.VariationGrid', {
            product: this.product,
            productType: this.productType
        });

        this.variations.removeAll();
        this.variations.add(this.grid);
    },

    launchModal: function () {
        var modal = Ext.create('Taco.view.product.option.Modal', {
            productType: this.productType,
            listeners: {
                save: function () {
                    modal.hide();
                    this.createVariations();
                },
                scope: this
            }
        });
    },

    createVariations: function () {
        // DO THE THOM CODE HERE....
    }
});