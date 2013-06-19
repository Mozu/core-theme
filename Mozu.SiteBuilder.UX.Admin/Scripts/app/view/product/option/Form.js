/**
 * @class Taco.view.product.option.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.option.Form', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.optionproductform',

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

    loadByProductTypeId: function (value) {
        var productTypeId = typeof value === 'number'
                            ? value
                            : this.product.get('productTypeId');
        
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
        var me = this;
        me.grid = Ext.create('Taco.view.product.option.VariationGrid', {
            product: me.product,
            productType: me.productType
        });

        me.variations.removeAll();
        me.variations.add(me.grid);
        

    },

    launchModal: function () {
        var modal = Ext.create('Taco.view.product.option.Modal', {
            productType: this.productType,
            product: this.product,
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
        this.buildVariations();


    }
});