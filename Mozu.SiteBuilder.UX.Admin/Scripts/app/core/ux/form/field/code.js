
/**
 * @class Taco.core.ux.form.field.Category
 */

Ext.define('Taco.core.ux.form.field.Code', {
    extend: 'Ext.form.field.Base',
    alias: ['widget.taco-codefield', 'widget.taco-code'],
    requires: [
        'Ext.util.KeyNav'
    ],
    componentLayout: 'taco-codefieldlayout',
    // white code editor theme
    theme: "ace/theme/textmate",
    // black code editor theme
    //theme: 'ace/theme/monokai',
    // height: 300,
    //  width: 800,
    minHeight: 300,
    inputType: 'hidden',
    mode: 'mozufilter',
    showGutter: true,
    useWrapMode: true,
    showPrintMargin: true,
    fontSize: '16px',
    selectOnRender: true,
    
    setReadOnly: function (value) {
        this.readOnly = value;
        if (this.editor) {
            this.editor.setReadOnly(this.readOnly);
        } 
    },
    initComponent: function () {
        var me = this;
        me.on('resize', function () {
            if (me.editor) {
                me.editor.resize();
            }
        });

        

        me.on('render', function (cmp) {
            //if (!me.width) {
            //    var width = me.findParentBy(function (c) { return c.getWidth(); }).getWidth();
            //    if (width) {
            //       me.setWidth(width * .95);
            //    }
            //}
            var editEl = me.getEditorEl();
            editEl.setHTML(me.getValue() || null);
            if (!window.ace) {
                return;
            }

            me.editor = ace.edit(editEl.dom);
            me.editor.setValue(me.getValue() || null);
            //   window.code = me;
            //    window.editor = me.editor;
            if (me.readOnly) {
                me.editor.setReadOnly(true);
            }
            me.editor.setTheme(me.theme);

            me.editor.getSession().setMode("ace/mode/" + me.mode);


            me.editor.setHighlightActiveLine(false);

            me.editor.getSession().setUseWrapMode(me.useWrapMode);

            //me.editor.getSession().setWrapLimitRange(85, 85);
            //  me.editor.setPrintMarginColumn(85);
            // me.editor.setShowPrintMargin(false);
            me.editor.renderer.setShowGutter(me.showGutter);
            //  

            me.editor.renderer.setShowPrintMargin(me.showPrintMargin);

            me.editor.setFontSize(me.fontSize);

            me.editor.setOptions({
                enableBasicAutocompletion: true, 
                enableSnippets: true,
                enableLiveAutocompletion: false, 
            });

            if (!me.selectOnRender) {
                me.editor.clearSelection();
            }
            
            //listen for the esc key to set focus on the components el;
            this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
                // target: this.getEl(),
                scope: this,
                esc: function (e) {
                    this.fireEvent('escKey');
                    return false;
                }
            });


            me.fireEvent('editorready',this,this.editor);

            me.editor.on('change', function (e) {
                var actualValue = me.editor.getValue();
                me.setValueInternal(actualValue);
            });

            // need to replace any curly quotes that are pasted into the editor. typically from outlook or ms based product.
            me.editor.on('paste', function (e) {
                e.text = e.text.replace(/“/g, "\"");
                e.text = e.text.replace(/”/g, "\"");
            });

            
        });
        this.callParent(arguments);
    },
    getEditorId: function () {
        return this.getInputId() ;
    },

    getEditorEl: function () {
        var me = this;
        me.editorEl = me.editorEl || me.el.getById(me.getEditorId());
        return me.editorEl;
    },
    getValue: function () {
        return this.value;
    },
    //  fieldSubTpl:[],
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
    },

    fieldSubTpl: ['<div style="border: 1px solid #cccccc" id="{id}">{value}</div>'],

    
});


Ext.define('Taco.core.ux.form.field.CodeLayout', {
    extend: 'Ext.layout.component.field.Text',
    alias: 'layout.taco-codefieldlayout',

    //type: 'textareafield',

    canGrowWidth: false,


    measureContentHeight: function (ownerContext) {
        return ownerContext.el.getHeight();
    },
});



