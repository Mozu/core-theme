/**
 * @class Taco.view.generalSettings.subform.Analytics
 * @author Bradley Friemel
* @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Analytics', {
    //extend: 'Taco.view.product.subform.Subform',
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Analytics',
    margin: "0 0 20 0",
    ui: "subform",
    
    initComponent: function () {
        var me = this;
        
        this.defaults = {
            width: "100%",
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [
                {
                    xtype: 'textfield',
                    itemId: 'googleAnalyticsCode',
                    name: 'googleAnalyticsCode',
                    fieldLabel: "User Account (UA#)"
                },
                {
                    xtype: 'checkbox',
                    name: 'isGoogleAnalyticsEnabled',
                    itemId: 'isGoogleAnalyticsEnabled',
                    boxLabel: 'Enable Google Analytics on your storefront',
                    boxLabelAlign: 'after',
                    inputValue: true,
                    uncheckedValue: false
                },
                {
                    xtype: 'checkbox',
                    name: 'isGoogleAnalyticsEcommerceEnabled',
                    itemId: 'isGoogleAnalyticsEcommerceEnabled',
                    boxLabel: 'Enable <a target="_blank" href="https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce">Google Analytics eCommerce transaction tracking</a>',
                    boxLabelAlign: 'after',
                    inputValue: true,
                    uncheckedValue: false
                }];

        this.callParent(arguments);
    }
});