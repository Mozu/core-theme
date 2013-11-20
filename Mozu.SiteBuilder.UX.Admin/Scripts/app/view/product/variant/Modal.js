
/**
 * @class  Taco.view.product.variants.Modal
 * @author Travis Johnson
 * @description Variants modal containing the variant grid
 */
Ext.define('Taco.view.product.variant.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.product.variant.Grid'
    ],

    primaryText: 'Save',
    scale: 'large',
    title: 'Edit Variants',

    initComponent: function () {
        
        this.form = Ext.create('Taco.core.ux.form.Form', {
            items: [
                Ext.create('Taco.view.product.variant.Grid', {
                  shit: true  
                })
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    }
});