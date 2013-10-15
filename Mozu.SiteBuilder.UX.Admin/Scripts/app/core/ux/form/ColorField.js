/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.ColorField', {
    extend: 'Ext.form.field.Base',
    requires: [
        'Taco.core.ux.ColorPicker',
        'Taco.core.ux.window.Modal'
    ],
    alias: 'widget.colorfield',

    inputType: 'button',
    value: 'rgba(0,0,0,1)',
    fieldCls: 'x-form-field taco-color-field',
    pickerSize: 50,

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            afterrender: this.initColors,
            scope: this
        });
    },

    initColors: function () {
                
        this.inputEl.on({
            click: function () {
                this.picker = Ext.create('Taco.core.ux.ColorPicker', {
                    value: this.value,
                    listeners: {
                        change: function (value) {
                            this.setValue(value);
                        },
                        scope: this
                    }
                });

                this.modal = Ext.create('Taco.core.ux.window.Modal', {
                    autoShow: true,
                    scale: 'medium',
                    items: [this.picker]
                });
            },
            scope: this
        });

        this.inputEl.setStyle({
            width: this.pickerSize + 'px',
            height: this.pickerSize + 'px',
            backgroundColor: this.value
        });
    },

    setValue: function (value) {
        if (this.inputEl && this.inputEl.setStyle) {
            this.inputEl.setStyle({
                backgroundColor: value
            });
        }
        this.callParent(arguments);
    }
});