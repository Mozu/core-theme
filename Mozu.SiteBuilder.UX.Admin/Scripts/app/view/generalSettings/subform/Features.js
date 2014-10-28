/**
 * @class Taco.view.generalSettings.subform.Features
 * @author Zetlen
 * @date 10/24/2014
 *
 */

Ext.define('Taco.view.generalSettings.subform.Features', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Features',
    margin: "0 0 20 0",
    ui: "subform",
    width:"100%",
    //bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    //cls: Taco.baseCSSPrefix + 'form-section',
    initComponent: function() {

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [{
            xtype: 'checkbox',
            name: 'isWishlistCreationEnabled',
            boxLabel: 'Customer Wishlist Enabled',
            boxLabelAlign: 'after',
            inputValue: true,
            uncheckedValue: false
        }];

        this.callParent(arguments);
    }
});