/**
 * @class Taco.view.generalSettings.subform.Maintenance
 * @author Bradley Friemel
 * @date 6/10/2013
 * Note: (Simeon) it is not clear if this class was ever completed.  There appears to be no backend for this component;
 */

Ext.define('Taco.view.generalSettings.subform.Maintenance', {
    //extend: 'Taco.view.product.subform.Subform',
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.OnOffSliderButton'],
    title: 'Maintenance',
    margin: "0 0 20 0",
    ui: "subform",
    
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };


        this.items = [
            {
                xtype: 'onoffsliderbutton',
                margin:"10 0 10 0",
                name: 'maintenance',
                fieldLabel:'Your maintenance page is currently',
                text: 'Your maintenance page is currently'
            },
            {
                xtype: 'label',
                text: 'Change your maintenance message'
            }];

        this.callParent(arguments);
    }
});