/**
 * @class Taco.view.generalSettings.subform.Maintenance
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.Maintenance', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.core.ux.form.OnOffSliderButton'],
    title: 'Maintenance',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };


        this.items = [
            {
                xtype: 'onoffsliderbutton',
                name: 'maintenance',
                text: 'Your maintenance page is currently'
            },
            {
                xtype: 'label',
                text: 'Change your maintenance message'
            }];

        this.callParent(arguments);
    }
});