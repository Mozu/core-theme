/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.ColorField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.colorfield',
    requires: [
        'Taco.core.ux.ColorPicker',
        'Taco.core.ux.window.Modal'
    ],

    fieldCls: 'x-form-field taco-color-field',
    value: 'rgba(0,0,0,1)',

    pickerSize: 50,

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            afterrender: this.initColors,
            scope: this
        });
    },

    initColors: function () {
        this.on({
            focus: {
                scope: this,
                fn: function () {
                    this.picker = Ext.create('Taco.core.ux.ColorPicker', {
                        value: this.value
                    });

                    this.picker.on({
                        change: {
                            scope: this,
                            fn: function (value) {
                                this.setValue(value);
                            }
                        }
                    });

                    this.modal = Ext.create('Taco.core.ux.window.Modal', {
                        autoShow: true,
                        closeAction: 'destroy',
                        title: 'Select Color',
                        width: 400,
                        height: 480,
                        items: [this.picker]
                    });
                }
            }
        });

        this.inputEl.setStyle({
            backgroundColor: this.value,
            color: this.value
        });
    },

    setValue: function (value) {
        if (this.inputEl && this.inputEl.setStyle) {
            this.inputEl.setStyle({
                backgroundColor: value,
                color: value
            });
        }
        this.callParent(arguments);
    }
});
