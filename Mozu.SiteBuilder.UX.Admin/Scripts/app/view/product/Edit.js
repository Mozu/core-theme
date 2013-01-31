/**
 * @class Taco.view.product.Edit
 * @author Michael Speed Elder
 * Date: 1/21/13
 * Time: 3:02 PM
 *
 *
 */

Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form'
    ],
    formCls: 'Taco.view.product.Form',

    initComponent: function () {

        this.additionalActions = [{
            xtype: 'action',
            text: 'Add to Site',
            click: function () {
                var siteId = prompt("Enter a siteID");
                this.form.addSite(siteId);
            },
            scope: this
        }, {
            xtype: 'action',
            text: 'Remove from Site',
            click: function () {
                var siteId = prompt("Enter a siteID");
                this.form.removeSite(siteId);
            },
            scope: this
        }];

        this.callParent(arguments);
    }
});