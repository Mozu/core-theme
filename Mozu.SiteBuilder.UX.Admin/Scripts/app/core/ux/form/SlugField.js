/**
 * @class Taco.core.ux.form.SlugField
 */

Ext.define('Taco.core.ux.form.SlugField', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.slugfield', 'widget.taco-slugfield'],
    slugCls: 'taco-slug-prefix',
   // slugPrefix: '/',

    //fieldSubTpl2: [ // note: {id} here is really {inputId}, but {cmpId} is available
    //'<div class="{slugCls}"><span>{slugPrefix}</span></div>', '<input id="{id}" type="{type}" {inputAttrTpl}', ' size="1"', // allows inputs to fully respect CSS widths across all browsers
    //'<tpl if="name"> name="{name}"</tpl>', '<tpl if="value"> value="{value}"</tpl>', '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>', '<tpl if="maxLength !== undefined"> maxlength="{maxLength}"</tpl>', '<tpl if="readOnly"> readonly="readonly"</tpl>', '<tpl if="disabled"> disabled="disabled"</tpl>', '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>', '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>', ' class="{fieldCls} {typeCls} {editableCls}" autocomplete="off"/>',
    //{
    //    disableFormats: true
    //}],
    requires: [
        'Taco.core.util.Validation'
    ],

    onRender: function() {
        var me = this,
            paddingLeft, height;

        me.callParent(arguments);

        me.prefixEl = me.el.down('.' + me.slugCls);

        //paddingLeft = parseInt(me.inputEl.getStyle('padding-left'));

        //me.inputEl.setStyle({
        //    'padding-left': me.prefixEl.getComputedWidth() + paddingLeft + 'px'
        //});
        //me.prefixEl.setStyle({
        //    'height': me.inputEl.getComputedHeight() + 'px'
        //});

        me.inputEl.on({
            keyup: function() {
                me.formatValue(true);
            },
            blur: function() {
                me.formatValue();
            }
        });
    },

    getSubTplData: function() {
        var me = this,
            data = me.callParent(arguments);

        Ext.apply(data, {
            slugPrefix: me.slugPrefix,
            slugCls: me.slugCls
        });

        return data;
    },

    formatValue: function(maintainCaret) {
        var me = this,
            index;

        if (maintainCaret) {
            index = me.getCaretIndex();
        }

        if (me.setValue(me.getValue()) !== false && maintainCaret) {
            me.setCaretIndex(index);
        }


    },

    setValue: function(value) {
        var me = this,
            newValue,
            currentValue;

        if (typeof value === 'string') {
            currentValue = me.getValue();
            newValue = Taco.core.util.Validation.toValidSeoSlug(currentValue);

            if (currentValue === newValue) {
                return false;
            }
            return me.callParent([newValue]);
        }
        return me.callParent(value);
    },

    getCaretIndex: function() {
        var me = this,
            index, selection;
        input = me.inputEl.dom;

        if (input.selectionStart !== 'undefined') {
            return input.selectionStart;
        } else if (document.selection !== 'undefined') {
            input.focus();
            selection = document.selection.createRange();
            selection.moveStart('character', -input.value.length);
            return selection.text.length - document.selection.createRange().text.length;
        }

        return undefined;
    },

    setCaretIndex: function(index) {
        var me = this,
            range, input = me.inputEl.dom;

        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(index, index);
        } else if (input.createTextRange) {
            range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', index);
            range.moveStart('character', index);
            range.select();
        }
    }
});

