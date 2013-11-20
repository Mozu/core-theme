
/**
 * @class  Taco.view.product.variant.Grid
 * @author Travis Johnson
 * @description The grid panelt to edit and enable variants
 */
Ext.define('Taco.view.product.variant.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-product-variant-grid',

    initComponent: function () {
        this.callParent(arguments)
    }
});