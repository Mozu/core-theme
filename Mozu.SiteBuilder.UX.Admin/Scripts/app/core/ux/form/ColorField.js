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

    getChannelValues: function(value) {
        if (value.indexOf('rgb') === 0) return value.match(/\d+/g).map(Number);
        var hex = value.match(/0-9a-fA-F+/g);
        if (!hex) return [0, 0, 0];
        return hex.match(new RegExp('.{' + (hex.length / 3) + '}', 'g')).map(function(v) { return parseInt(v, 16); });
    },

    getLuminance: function(value) {
        var channelValues = this.getChannelValues(value),
            red = channelValues[0],
            green = channelValues[1],
            blue = channelValues[2];
        return 0.299 * red + 0.587 * green + 0.114 * blue;
    },

    getContrastColor: function(color) {
        return this.getLuminance(color) > 128 ? '#000000' : '#FFFFFF';
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
            color: this.getContrastColor(this.value)
        });
    },

    setValue: function (value) {
        if (this.inputEl && this.inputEl.setStyle) {
            this.inputEl.setStyle({
                backgroundColor: value,
                color: this.getContrastColor(value)
            });
        }
        this.callParent(arguments);
    }
});
