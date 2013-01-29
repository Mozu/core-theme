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
        'Taco.view.product.SiteForm',
        'Ext.tab.Panel'
    ],

    layout: 'fit',

    initComponent: function () {
        this.tabpanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: [
                Ext.create('Taco.view.product.GlobalForm'),
                Ext.create('Taco.view.product.SiteForm'),
                Ext.create('Taco.view.product.SiteForm', {
                    title: 'Site Form w/ Overrides',
                    allowOverrides: true
                })
            ]
        });

        this.items = [this.tabpanel];

        this.callParent( arguments );
    }
});