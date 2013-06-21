/**
 * @class Taco.view.product.option.Form
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.option.Form', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.optionproductform',
    cls: 'taco-product-options',

    requires: [
        'Taco.view.product.option.VariationGrid',
        'Taco.view.product.option.Modal'
    ],

    title: 'Options',

    initComponent: function () {

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');
        this.productVariationStore = this.product.getVariations();

        this.options = Ext.widget({
            xtype: 'container',
            hidden: true
        });

        this.variations = Ext.widget({
            xtype: 'container',
            hidden: true
        });

        this.items = [{
            xtype: 'container',
            items: [
                this.options,
                this.variations
            ]
        }];

        this.callParent(arguments);

        if (this.productTypeStore.isLoading()) {
            this.productTypeStore.on('load', this.loadByProductTypeId, this, { single: true });
        } else {
            this.loadByProductTypeId();
        }

        if (this.productVariationStore.isLoading()) {
            this.productVariationStore.on('load', this.showHide, this);
        } else {
            this.showHide();
        }
    },

    showHide: function () {
        if (this.productVariationStore.count()) {
            this.options.hide();
            this.variations.show();
        } else {
            this.options.show();
            this.variations.hide();
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
        this.grid = Ext.create('Taco.view.product.option.VariationGrid', {
            product: this.product,
            productType: this.productType,
            listeners: {
                editoption: function (grid, attributeFQN) {
                    this.launchModal(attributeFQN);
                },
                scope: this
            }
        });

        this.variations.removeAll();
        this.variations.add(this.grid);
    },

    launchModal: function (attributeFQN) {
        var modal = Ext.create('Taco.view.product.option.Modal', {
            productType: this.productType,
            product: this.product,
            attributeFQN: attributeFQN,
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
        this.productVariationStore.loadFromOptions();
        this.buildVariations();
        this.options.hide();
        this.variations.show();
    }
});