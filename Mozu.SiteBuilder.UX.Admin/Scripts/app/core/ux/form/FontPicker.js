/**
 * @class Taco.core.ux.form.FontPicker
 */
Ext.define('Taco.core.ux.form.FontPicker', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.fontpicker',
    width: 800,

    initComponent: function () {

        this.fontFamily = Ext.create('Ext.form.ComboBox', {
            xtype: 'combobox',
            fieldLabel: 'Font',
            name: 'fontFamily',
            store: ['Helvetica', 'Arial', 'Comic Sans', 'sans-serif', 'Times New Roman', 'Courier New', 'serif'],
            width: 600
        });

        this.items = [{
            xtype: 'checkbox',
            boxLabel: 'Bold',
            name: 'fontWeight',
            inputValue: 'bold'
        }, {
            xtype: 'checkbox',
            boxLabel: 'Italic',
            name: 'fontStyle',
            inputValue: 'italic'
        }, 
        this.fontFamily, {
            xtype: 'combobox',
            fieldLabel: 'Size',
            name: 'fontSize',
            store: ['9px', '10px', '11px', '12px', '13px', '14px', '16px', '21px', '28px']
        }, {
            xtype: 'combobox',
            fieldLabel: 'Line Height',
            name: 'lineHeight',
            store: ['normal', '12px', '13px', '14px', '16px', '21px', '28px', '35px', '48px']
        }];

        this.callParent(arguments);

        //console.log(this.getForm().getFields().items[2].getPicker());

        this.on({
            afterrender: function () {
                this.getForm().setValues(this.value);
                this.relayEvents(this, ['change'], 'font');
                //this.updatePickerFonts();
            },
            change: function () {
                this.fontFamily.inputEl.setStyle({
                    fontFamily: this.fontFamily.getValue()
                });
            },
            scope: this
        });

        this.fontFamily.on({
            expand: function () {
                this.updatePickerFonts();
            },
            scope: this
        });
    },

    buildFontShorthand: function (font) {
        var shorthand = '';

        Ext.each(this.fontParameters, function (parameter) {
            if (font[parameter] === 'normal' || font[parameter] === undefined) {
                return;
            }

            shorthand += (parameter === 'lineHeight' ? '/' : ' ') + font[parameter];
        }, this);

        return shorthand.trim();
    },

    updatePickerFonts: function () {
        var pickerEl = this.fontFamily.getPicker().getEl();

        if (!pickerEl) {
            return;
        }

        Ext.each(pickerEl.query('li'), function () {
            var itemEl = Ext.fly(this);
            itemEl.setStyle({
                fontFamily: itemEl.getHTML()
            });
        });
    }
});