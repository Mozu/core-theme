/**
 * @class Taco.shared.view.modal.ImageMetadata
 */
Ext.define('Taco.shared.view.modal.ImageMetadata', {
    extend: 'Taco.core.ux.window.Modal',

    closeAction: 'destroy',
    autoShow: true,
    scale: 'medium',
    title: 'Image Alternative Text',
    primaryText: 'OK',

    initComponent: function () {
        var me = this;

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'anchor'
            },
            items: [{
                xtype: 'textarea',
                name: 'alt',
                fieldLabel: 'Enter Alt Text for this Image',
                allowBlank: true,
                selectOnFocus: true,
                maxLength: 150,                
                width: "100%"
            }]
        });

        this.items = [this.form];

        this.form.getForm().setValues(me.record.getData());

        this.callParent(arguments);

        this.on({
            show: {
                scope: this,
                fn: function () {
                    var field = this.form.findField('alt');
                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    doSave: function () {
        var me = this,
            data = me.form.getValues();

        me.record.set(data);
        me.saveSuccess(me.record);
    }

});

