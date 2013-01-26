/**
 * @class Taco.view.product.subform.Categories
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Categories', {
    extend: 'Taco.view.product.subform.Subform',

    title: 'Categories',

    initComponent: function () {
        this.items = [{
            xtype: 'component',
            width: '100%',
            html: '<div style="width: 100%; overflow: hidden; font-size: 16px; padding: 8px 0"><div style="float: left">You have no categories applied to this product</div><a href="javascript:;" style="float: right">Add category</a></div>'
        }];

        this.callParent( arguments );
    }
});