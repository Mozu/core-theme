/**
 * @class Taco.view.settings.paymentTypes.subform.CheckByMail
 *
 */

Ext.define('Taco.view.settings.paymentTypes.subform.CheckByMail', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Check by Mail',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        var me = this;
        
        this.items = [
            Ext.create('Ext.panel.Panel', {
            items: [
                {
                    xtype: 'checkbox',
                    name: 'payByMail',
                    boxLabel: 'Accept checks by mail'
                }

            ]
        })];

        this.callParent(arguments);
        
    }
});