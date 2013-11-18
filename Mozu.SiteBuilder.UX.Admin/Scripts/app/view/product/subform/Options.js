/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Options', {
    extend: 'Taco.view.product.subform.Subform',

    requires: ['Taco.view.product.option.Form'],

    title: 'Options',
    
    initComponent: function () {
        var track = this.product.get('manageStock'),
            manageStock,
          //  stockOnHand,
            outOfStockState,
            options;

        this.record = this.product;
        
       

        options = Ext.create('Taco.view.product.option.Form', {
            product: this.product
        });

        this.items = [options];

        this.callParent(arguments);
       
    }

    
});