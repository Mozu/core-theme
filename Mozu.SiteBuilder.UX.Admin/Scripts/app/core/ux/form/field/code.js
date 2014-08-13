
/**
 * @class Taco.core.ux.form.field.Category
 */

Ext.define('Taco.core.ux.form.field.Code', {
    extend: 'Ext.form.field.Base',
    alias: ['widget.taco-codefield', 'widget.taco-code'],
    requires: [
    ],
   // height: 300,
    //  width: 800,
      minHeight: 300,
    inputType: 'hidden',
    mode: 'mozufilter',
    showGutter: true,
    
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
            editEl.setHTML(me.getValue()||null);
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
            me.editor.setTheme("ace/theme/textmate");
            
            me.editor.getSession().setMode("ace/mode/" + me.mode);

            
            me.editor.setHighlightActiveLine(false);
            
            me.editor.getSession().setUseWrapMode(true);

            //me.editor.getSession().setWrapLimitRange(85, 85);
            //  me.editor.setPrintMarginColumn(85);
            // me.editor.setShowPrintMargin(false);
            me.editor.renderer.setShowGutter(me.showGutter);
            //  

            me.editor.setFontSize('16px');
          

        //    
          
            me.editor.on('change', function (e) {
                var actualValue = me.editor.getValue();
                me.setValueInternal(actualValue);
            });

        });
        this.callParent(arguments);
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
    
    fieldSubTpl: ['<div style="height:90%;width:width:100%;border: 1px solid #cccccc" id="{id}-editor">{value}</div>'],

   


});



    
