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

    cls:"taco-product-subform-option",

    initComponent: function () {
        
        this.record = this.product;

        this.items = [{
            xtype: 'component',
                flex:1,
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
                    this.editVariants()
                },
                scope: this
            }];
        this.callParent(arguments);

        this.list = this.down('#list');
        this.loadByProductTypeId();
    },

    onVariantChange: function (view, variantData, optionData) {
        var me = this;
        
        // update the local option data

        // update the local variant data;
        this.list.update(this.buildOptionsHtml());

        
    },

    // get data from optionsStore
    getOptionsData: function () {
        var data = [];
        this.product.getOptions().each(function (item) {
            data.push(Ext.clone(item.data))
        }, this);

        return data;
    },
    // get the unpersisted data from the variations store;
    getVariationsData: function () {
        var data = [];
        this.product.getVariations().each(function (item) {
            data.push(Ext.clone(item.data))
        }, this);

        return data;
    },

    editVariants: function () {

        Ext.create('Taco.view.product.variant.Modal', {
            product: this.product,
            productType: this.productType,
            listeners: {
                aftersaveclose : this.onVariantChange,
                close: function () {

                    //this.product.getVariations().whenLoaded(this.rebuild, this);
                },
                scope: this
            }
        });
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

            ret.push("<div class='option-item' style='padding-bottom:10px;'>");
            ret.push(attribute.get('adminName') + ' - ');

            Ext.each(option.get('values'), function (val, i) {
                var value = Ext.Array.findBy(attribute.get('selectedValues'), function (item) {
                    return typeof item.id !== 'undefined' && (item.id.toString() === val.toString());
                });

                if (!value) return;

                if (i > 0) ret.push(', ');

                ret.push(value.value);
            }, this);

            ret.push("</div>");
            
        }, this);

        return ret.join('');
    },

    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);
    },

    loadByProductTypeId: function (value) {
        var productTypeId = typeof value === 'number' ? value : this.product.get('productTypeId');
        
        this.productType = this.product.productTypeRecord;
        this.rebuild();
    },

    rebuild: function () {
        this.list.update(this.buildOptionsHtml());
    }
});