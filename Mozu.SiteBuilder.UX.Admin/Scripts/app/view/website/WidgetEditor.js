/**
 * @class Taco.view.website.WidgetEditor
 * @author Thomas Phipps
 */

Ext.define('Taco.view.website.WidgetEditor', {
    extend: 'Taco.core.ux.window.Modal',
    alias: 'widget.taco-widgeteditor',

    autoShow: true,
    scale:'large',

    initComponent: function () {
        var me = this;

        if (!this.form) {
            this.form = Ext.create('Taco.core.ux.form.Form', {
                defaults: {
                    xtype: 'textfield'
                },
                items: this.editViewFields || []
            });
        }
        if (Ext.isEmpty(this.items)) {
            this.items = [this.form];
        }

        
        this.callParent(arguments);

        this.setValues();
        
        this.on('beforesave', function () {
            if (me.form.getData) {
                me.widgetData = me.form.getData();
            } else {
                me.widgetData = Ext.apply(me.widgetData, me.form.getForm().getValues(false, false, false, true));
            }
            
        });
    },

    setValues: function () {
        if (this.form.setData) {
            this.form.setData(this.widgetData);
        } else {
            this.form.getForm().setValues(this.widgetData);
        }
        
    }
});
