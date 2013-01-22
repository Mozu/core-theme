/**
 * @class Taco.view.product.Form
 * @author Michael Speed Elder
 *
 */
Ext.define('Taco.view.product.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.product.SingleSiteForm'
    ],

    initComponent: function () {
        this.tabpanel = Ext.create("Ext.tab.Panel", {
            items: [
                Ext.create("Taco.view.product.SingleSiteForm")
            ]
        });

        this.items = [ this.tabpanel ];

        this.callParent( arguments );
    }
});