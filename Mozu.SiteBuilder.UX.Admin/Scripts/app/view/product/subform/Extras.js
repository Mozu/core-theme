/**
 * @class Taco.view.product.subform.Extras
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Extras', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Extras',

    initComponent: function () {
        this.items = [{
            xtype: 'component',
            html: '<div style="font-size: 16px; padding: 8px">TBD</div>'
        }];

        this.callParent( arguments );
    }
});