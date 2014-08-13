
/**
 * @class  Taco.view.product.variants.Modal
 * @author Travis Johnson
 * @description Variants modal containing the variant grid
 */
Ext.define('Taco.view.product.variant.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.product.variant.Grid',
        'Taco.view.product.variant.Options'
    ],

    primaryText: 'Save',
    closeAction :'destroy',

    secondaryHandler: function () {
        this.onCancel();
    },

    scale: 'large',
    title: 'Edit Variants',

    layout: 'fit',

    autoShow: true,

    actions: [{
        xtype: 'button',
        text: 'Update Options',
        ui: 'action',
        scale: 'medium',
        handler: function() {
            this.updateOptions.apply(this, arguments);
        }
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        formBind: true
    }],

    initComponent: function () {
        
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: 'fit',
            items: [
                Ext.create('Taco.view.product.variant.Grid', {
                  product: this.product,
                  productType: this.productType
                })
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            beforesave: this.onBeforeSave,
            scope: this
        });
    },

    onBeforeSave: function () {

    },

    updateOptions: function () {
        Ext.create('Taco.view.product.variant.Options', {
            product: this.product,
            productType: this.productType,
            listeners: {
                redooptions: this.redrawGrid,
                scope: this
            }
        })
    },

    doSave: function () {
        //saving on product form save
       // this.product.getVariations().sync();
        this.close();
    },

    onCancel: function () {
        var options = this.product.getOptions(),
            variants = this.product.getVariations();

        options.rejectChanges();

        variants.whenLoaded(function () {
            variants.rejectChanges();
            this.hide();
        }, this);
    },

    redrawGrid: function () {
        this.removeAll();
        this.add(Ext.create('Taco.view.product.variant.Grid', {
            product: this.product,
            productType: this.productType
        }));
    }
});