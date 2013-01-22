/**
 * @class Taco.view.product.subform.Properties
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Properties', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Properties',
    
    initComponent: function () {
        this.items = [{
            xtype: 'component',
            html: '<div style="font-size: 16px; padding: 8px">TBD</div>'
        }];

        this.callParent( arguments );
    }
});