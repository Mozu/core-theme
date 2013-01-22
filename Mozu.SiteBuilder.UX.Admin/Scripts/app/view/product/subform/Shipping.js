/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Shipping',
    
    initComponent: function () {
        this.items = [{
            fieldLabel: 'Package Weight',
            value: '126 kg'
        }, {
            fieldLabel: 'Package Dimensions',
            value: '2in × 3in × 4in'
        }];

        this.callParent( arguments );
    }
});