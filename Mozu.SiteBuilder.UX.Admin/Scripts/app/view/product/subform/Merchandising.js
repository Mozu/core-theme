/**
 * @class Taco.view.product.subform.Merchandising
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Merchandising', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productmerchandisingsubform',
    title: 'Merchandising',

    initComponent: function () {
        this.items = [{
            xtype: 'component',
            html: '<div style="font-size: 16px; padding: 8px">TBD</div>'
        }];

        this.callParent( arguments );
    }
});