/**
 * @class Taco.view.generalSettings.subform.Robots
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Robots', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    
    title: 'Robots',
    initComponent: function () {
        var me = this;
        
        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        me.robotsOverride = Ext.create('Ext.form.field.TextArea', {
            xtype: 'textarea',
            name: 'robotsOverride',
            itemId: 'robotsOverride',
            width: "100%",
            disabled:!this.record.get("robotsOverrideEnabled"),
            fieldLabel: "ROBOTS.TXT Contents"
            /*,
                value: me.settings.robotsOverrideEnabled ? me.settings.robotsOverride : 'User-agent: *',
                disabled: !me.settings.robotsOverrideEnabled*/
        });


        this.items = [
            me.robotsOverride,
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
                        me.robotsOverride.setDisabled(!isChecked);
                    }
                }
            }];

        this.callParent(arguments);
    }
});