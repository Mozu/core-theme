/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Options', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.taco-product-options',

    requires: ['Taco.view.product.variant.Modal',
        'Taco.view.product.variant.Grid',
        'Taco.view.product.variant.Options'],

    title: 'Options',

    initComponent: function () {

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');
        this.record = this.product;

        this.items = [{
                xtype: 'component',
                itemId: 'list',
                html: ''
            }, {
                xtype: 'button',
                text: 'Select Values',
                scale: 'medium',
                ui: 'action',
                width: 150,

                handler: function () {
                    //if (this.product.phantom) {
                    //    Taco.MessageBox.alert(
                    //        'Sorry!',
                    //        'You must first finish and save the Product before assigning option values.'
                    //    );
                    //    return;
                    //}
                    Ext.create('Taco.view.product.variant.Modal', {
                        product: this.product,
                        productType: this.productType,
                        listeners: {
                            close: function () {
                                this.product.getVariations().whenLoaded(this.rebuild, this);
                            },
                            scope: this
                        }
                    });
                },
                scope: this
            }];
        this.callParent(arguments);

        this.list = this.down('#list');
        this.loadByProductTypeId();

        this.on('afterrender', function () {
            this.productTypeStore.whenLoaded(this.loadByProductTypeId, this);
        }, this, { single: true, delay: 15 });
    },

    buildOptionsHtml: function () {
        var ret = [];

        if (!this.productType) return '';

        this.product.getOptions().each(function (option) {
            var attribute;

            if (!option.get('values').length) return;

            attribute = this.findAttribute(option);

            if (!attribute) {
                console.log('Failed to find Attribute for option: ', option);
                return;
            }

            ret.push(attribute.get('attributeName') + ' - ');

            Ext.each(option.get('values'), function (val, i) {
                var value = Ext.Array.findBy(attribute.get('selectedValues'), function (item) {
                    return typeof item.id !== 'undefined' && (item.id.toString() === val.toString());
                });

                if (!value) return;

                if (i > 0) ret.push(', ');

                ret.push(value.value);
            }, this);

            ret.push('<br>');
        }, this);

        return ret.join('');
    },

    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);
    },

    loadByProductTypeId: function (value) {
        var productTypeId = typeof value === 'number' ? value : this.product.get('productTypeId');
        this.productType = this.productTypeStore.getById(productTypeId);
        this.rebuild();
    },

    rebuild: function () {
        this.list.update(this.buildOptionsHtml());
    }
});