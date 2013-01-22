/**
 * @class Taco.view.product.subform.Inventory
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Inventory', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Inventory',
    
    initComponent: function () {
        this.items = [{
            fieldLabel: 'Quantity',
            value: 56
        }, {
            fieldLabel: 'When out of stock',
            value: 'Show'
        }];

        this.callParent( arguments );
    }
});