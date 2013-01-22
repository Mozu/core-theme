/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'SEO',
    
    initComponent: function () {
        this.items = [{
            fieldLabel: 'Meta Title'
        }, {
            fieldLabel: 'Friendly URL'
        }, {
            fieldLabel: 'Meta Description'
        }];

        this.callParent( arguments );
    }
});