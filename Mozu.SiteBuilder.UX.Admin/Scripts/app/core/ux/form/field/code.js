/**
 * @class Taco.core.ux.form.field.Code
 */

Ext.define('Taco.core.ux.form.field.Code', {
    extend: 'Ext.form.field.Base',

    alias: ['widget.taco-codefield', 'widget.taco-code'],

    inputHeight: 240,
    inputWidth: 720,
    inputType: 'hidden',
    mode: 'mozufilter',
    showGutter: true,

    initComponent: function () {
        var me = this,
            inputHeight = (Ext.isNumeric(this.inputHeight) ? this.inputHeight : 240) + 'px',
            inputWidth = (Ext.isNumeric(this.inputWidth) ? this.inputWidth : 720) + 'px';

        this.fieldSubTpl = [
            '<div style="height: ',
                inputHeight,
            '; width: ',
                inputWidth,
            '; border: 1px solid #cccccc;" id="{id}-editor">{value}</div>'
        ];

        this.callParent(arguments);

        me.on('resize', function () {
            if (me.editor) {
                me.editor.resize();
            }
        });
    
        me.on('render', function (cmp) {
            var editEl = me.getEditorEl();

            editEl.setHTML(me.getValue()||null);

            if (!window.ace) {
                return;
            }

            me.editor = ace.edit(editEl.dom);
            me.editor.setValue(me.getValue() || null);

            if (me.readOnly) {
                me.editor.setReadOnly(true);
            }

            me.editor.setTheme("ace/theme/textmate");
            me.editor.getSession().setMode("ace/mode/" + me.mode);
            me.editor.setHighlightActiveLine(false);
            me.editor.getSession().setUseWrapMode(true);
            me.editor.renderer.setShowGutter(me.showGutter);
            me.editor.setFontSize('16px');

            me.editor.on('change', function (e) {
                var actualValue = me.editor.getValue();
                me.setValueInternal(actualValue);
            });
        });
    },

    getEditorId:function () {
        return this.getInputId() + '-editor';
    },

    getEditorEl:function () {
        var me = this;

        me.editorEl = me.editorEl || me.el.getById(me.getEditorId());

        return me.editorEl;
    },

    getValue: function () {
        return this.value;
    },

    setValue: function (value) {
        var me = this;
        var ret = me.mixins.field.setValue.call(me, value);

        me.suspendEvents(false);

        if (me.editor) {
            me.editor.setValue(me.getValue());
        }

        me.resumeEvents();

        return ret;
    },

    setValueInternal: function (value) {
        var me = this;
       
        return me.mixins.field.setValue.call(me, value);
    }
});
