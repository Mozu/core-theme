/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Options', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.taco-product-options',

    requires: ['Taco.view.product.option.Form'],

    title: 'Options',
    
    initComponent: function () {
        var track = this.product.get('manageStock'),
            manageStock,
            outOfStockState,
            options;

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.record = this.product;

        // options = Ext.create('Taco.view.product.option.Form', {
        //     product: this.product
        // });

        // this.items = [options];

        this.items = [{
            xtype: 'component',
            itemId: 'list',
            html: ''
        }, {
            xtype: 'button',
            text: 'Select Values',
            scale: 'medium',
            ui: 'action',

            handler: function() {
                Ext.create('Taco.view.product.variant.Modal', {
                    product: this.product,
                    productType: this.productType,
                    listeners: {
                        hide: function () {
                            console.log('rebuilding when variations are loaded');
                            this.product.getVariations().whenLoaded(this.rebuild, this);
                        },
                        scope: this
                    }
                });
            },
            scope: this
        }]

        this.callParent(arguments);

        this.list = this.down('#list');

        this.productTypeStore.whenLoaded(this.loadByProductTypeId, this);
    },

    buildOptionsHtml: function () {
        var ret = [];

        if (!this.productType) return '';

        this.product.getOptions().each(function (option) {
            var attributeName;
            console.log(option.raw);

            if (!option.get('values').length) return;

            attributeName = this.findAttributeName(option);

            ret.push(attributeName + ' - ');

            Ext.each(option.get('values'), function (val, i) {
                if (i > 0) ret.push(', ');
                ret.push(val);
            });

            ret.push('<br>');
        }, this);

        return ret.join('');
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return option.get('attributeName');
    },

    loadByProductTypeId: function (value) {
        var productTypeId = typeof value === 'number'
                            ? value
                            : this.product.get('productTypeId');
        this.productType = this.productTypeStore.getById(productTypeId);
        this.rebuild();
    },

    rebuild: function () {
        this.list.update(this.buildOptionsHtml());
    }
});