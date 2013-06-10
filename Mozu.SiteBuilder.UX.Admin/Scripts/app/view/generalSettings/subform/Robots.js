/**
 * @class Taco.view.generalSettings.subform.Robots
 * @author Bradley Friemel
 *
 */

Ext.define('Taco.view.generalSettings.subform.Robots', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Robots',
    initComponent: function () {
        var me = this;
        
        this.defaults = {
            width: 200,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };


        this.items = [
            {
                xtype: 'textarea',
                name: 'robotsOverride',
                itemId: 'robotsOverride',
                fieldLabel: "ROBOTS.TXT Contents"/*,
                value: me.settings.robotsOverrideEnabled ? me.settings.robotsOverride : 'User-agent: *',
                disabled: !me.settings.robotsOverrideEnabled*/
            },
            {
                xtype: 'checkbox',
                name: 'robotsOverrideEnabled',
                itemId: 'robotsOverrideEnabled',
                boxLabel: 'Override the site default ROBOTS.TXT',
                boxLabelAlign: 'after',
                //checked: me.settings.robotsOverrideEnabled,                inputValue: true,
                uncheckedValue: false,
                listeners: {
                        change: function (cmp, isChecked) {
                        me.robots.getComponent('robotsOverride').setDisabled(!isChecked);
                    }
                }
            }];

        this.callParent(arguments);
    }
});