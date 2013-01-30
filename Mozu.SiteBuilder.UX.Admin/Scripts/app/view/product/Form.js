/**
 * @class Taco.view.product.Form
 * @author Michael Speed Elder
 *
 */
Ext.define('Taco.view.product.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.tab.Panel',
        'Taco.view.product.GlobalForm',
        'Taco.view.product.SiteForm'
    ],

    layout: 'fit',

    initComponent: function () {
        this.tabpanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: [{
                xtype: 'productglobalform'
            }, {
                xtype: 'productsiteform'
            }, {
                xtype: 'productsiteform',
                title: 'Site Form w/ Overrides',
                allowOverrides: true
            }]
        });

        this.items = [this.tabpanel];

        this.callParent( arguments );
    }
});