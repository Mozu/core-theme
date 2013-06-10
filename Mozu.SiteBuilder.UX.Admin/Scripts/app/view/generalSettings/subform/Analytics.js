/**
 * @class Taco.view.generalSettings.subform.Analytics
 * @author Bradley Friemel
* @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Analytics', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Analytics',
    initComponent: function () {
        var me = this;
        
        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [
                {
                    xtype: 'textfield',
                    itemId: 'googleAnalyticsId',
                    name: 'googleAnalyticsId',
                    fieldLabel: "User Account (UA#)",
                    //value: me.settings.googleAnalyticsId,
                    //disabled: !me.settings.googleAnalyticsEnabled
                },
                {
                    xtype: 'checkbox',
                    name: 'googleAnalyticsEnabled',
                    itemId: 'googleAnalyticsEnabled',
                    boxLabel: 'Enable Google Analytics on your storefront',
                    boxLabelAlign: 'after',
                    inputValue: true,
                    uncheckedValue: false,
                    //checked: me.settings.googleAnalyticsEnabled,
                    listeners: {
                        change: function (cmp, isChecked) {
                           // me.analytics.getComponent('googleAnalyticsId').setDisabled(!isChecked);
                            //me.analytics.getComponent('googleAnalyticsEcomEnabled').setDisabled(!isChecked);
                        }
                    }
                },
                {
                    xtype: 'checkbox',
                    name: 'googleAnalyticsEcomEnabled',
                    itemId: 'googleAnalyticsEcomEnabled',
                    boxLabel: 'Enable <a target="_blank" href="https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce">Google Analytics eCommerce transaction tracking</a>',
                    boxLabelAlign: 'after',                    inputValue: true,
                    uncheckedValue: false,
                    //checked: me.settings.googleAnalyticsEcomEnabled,
                    //disabled: !me.settings.googleAnalyticsEnabled
                }];

        this.callParent(arguments);
    }
});