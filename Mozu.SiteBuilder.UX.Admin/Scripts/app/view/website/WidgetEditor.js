/**
 * @class Taco.view.website.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.WidgetEditor', {
    extend: 'Taco.core.ux.window.Modal',
    scale:'large',
    alias: 'widget.taco-widgetEditor',
    'autoShow': true ,
    initComponent: function () {
        var me = this;

        this.form = Ext.create('Taco.core.ux.form.Form', {
            xtype: 'form',
            defaults: {
                xtype: 'textfield'
            },
            items: this.editViewFields || []
        });
        this.items = [this.form];
        
        this.callParent(arguments);
        this.form.getForm().setValues(this.widgetData);
        
        this.on('beforesave', function () {
            me.widgetData = me.form.getForm().getValues(false, false, false, true);
        });
    },

});