/**
 * @class Taco.view.product.subform.SEO
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.SEO', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'SEO',
    
    initComponent: function () {
        this.defaults.width = '100%';

        this.items = [{
            xtype: 'productoverride',
            items: [{
                fieldLabel: 'Meta Title'
            }, {
                fieldLabel: 'Friendly URL'
            }, {
                fieldLabel: 'Meta Description',
                xtype: 'textarea'
            }]
        }];

        this.callParent( arguments );
    }
});