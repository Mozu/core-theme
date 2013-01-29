/**
 * @class Taco.view.product.Form
 * @author Michael Speed Elder
 *
 */
Ext.define('Taco.view.product.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.product.GlobalForm',
        'Taco.view.product.SiteForm',
        'Ext.tab.Panel'
    ],

    initComponent: function () {
        this.tabpanel = Ext.create("Ext.tab.Panel", {
            items: [
                Ext.create("Taco.view.product.GlobalForm"),
                Ext.create("Taco.view.product.SiteForm"),
                Ext.create("Taco.view.product.SiteForm", {
                    title: "Site Form w/ Overrides",
                    allowOverrides: true
                })
            ]
        });

        this.items = [ this.tabpanel ];

        this.callParent( arguments );
    }
});