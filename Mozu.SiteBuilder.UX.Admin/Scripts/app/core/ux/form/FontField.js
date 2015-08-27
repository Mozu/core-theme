/**
 * @class Taco.core.ux.form.FontField
 */
Ext.define('Taco.core.ux.form.FontField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.fontfield',
    requires: [
        'Taco.core.ux.form.FontPicker',
        'Taco.core.ux.window.Modal'
    ],

    inputType: 'hidden',
    value: '14px/21px Sans-serif',

    fontParameters: [
        'fontWeight',
        'fontStyle',
        'fontSize',
        'lineHeight',
        'fontFamily'
    ],

    fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available
        '<span id="{id}-display"></span>',
        '<input id="{id}" type="{type}" {inputAttrTpl}',
            ' size="1"', // allows inputs to fully respect CSS widths across all browsers
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls} {typeCls} {editableCls}" autocomplete="off"/>',
        {
            disableFormats: true
        }
    ],

    initComponent: function () {
        this.font = {};

        this.subTplData = {
            fontFamily: this.font.fontFamily,
            fontSize: this.fontSize
        };
        
        //todo:  make only one per page.  See if it exists or is being created before creating another one.

        this.iframe = Ext.create('Ext.ux.IFrame', {
            hidden: true,
            renderTo: Ext.getBody(),
            src: '/',
            listeners: {
                load: function () {
                    console.log('onload', this.getValue(), this.originalValue);
                    this.suspendEvents();
                    this.setValue(this.originalValue);
                    this.resumeEvents();
                    this.updateDisplay();
                },
                scope: this
            }
        });

        this.originalValue = this.value;

        this.callParent(arguments);

        this.on({
            afterrender: this.updateDisplay,
            change: this.updateDisplay,
            scope: this
        });
    },

    setValue: function (value) {
        this.font = typeof value === 'string'
                        ? this.parseFont(value)
                        : value || {};

        value = this.buildFontShorthand(this.font);

        return this.callParent([value]);
    },

    updateDisplay: function () {
        if (!this.displayEl) {
            return;
        }

        this.displayEl
            .update(this.font.fontFamily.split(',')[0].trim().replace(/'|"/g,'') + ', ' + this.font.fontSize)
            .setStyle({
                font: this.value,
                fontSize: '12px'
            });
    },

    launchPicker: function () {
        this.picker = Ext.create('Taco.core.ux.form.FontPicker', {
            value: this.font,
            listeners: {
                fontchange: function () {
                    this.setValue(this.picker.getValues());
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

    parseFont: function (value) {
        console.log('parseFont');
        var elm = Ext.DomHelper.append(this.iframe.getBody(), '<span />', true),
            font = {};

        elm.setStyle({
            font: value
        });

        Ext.each(this.fontParameters, function (parameter) {
            font[parameter] = elm.getStyle(parameter);
        }, this);

        elm.remove();

        return font;
    },

    applyRenderSelectors: function () {
        this.callParent(arguments);

        this.displayEl = this.el.getById(this.getInputId() + '-display');

        this.displayEl.on({
            click: this.launchPicker,
            scope: this
        });
    }
});