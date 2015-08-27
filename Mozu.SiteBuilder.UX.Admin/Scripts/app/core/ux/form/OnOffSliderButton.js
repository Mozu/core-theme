/**
 * @class Taco.core.ux.form.OnOffSliderButton
 * Creates a check box that looks like a slider button
*/
Ext.define('Taco.core.ux.form.OnOffSliderButton', {
    extend: 'Ext.container.Container',  
    alias: ['widget.onoffsliderbutton'],
    constructor: function (config) {
        this.callParent(arguments);
    },
    initComponent: function () {
        this.items = {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'label',
                        cls: Taco.baseCSSPrefix +'onOffSwitchLabel',
                        text: this.text
                    },
                    {
                        xtype: 'checkbox',
                        name: this.name,
                        cls: Taco.baseCSSPrefix +'onoffswitch'
                    }
                ]
            };

        this.callParent(arguments);
    }
});