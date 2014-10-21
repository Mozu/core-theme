/**
 * @class Taco.core.ux.form.FileInputButton
 */
 
Ext.define('Taco.core.ux.form.FileInputButton', {
    extend: 'Ext.form.field.File',
    alias: 'widget.tacofilefield',
    triggerWrapCls: Ext.baseCSSPrefix + 'form-file-trigger-wrap',
    buttonOnly: true,
  
    buttonConfig: {
        ui: 'action-primary',
        scale: 'medium'
    },

    getSubTplMarkup: function (values) {
        var me = this,
            childElCls = values.childElCls, // either '' or ' x-foo'
            field = this.getTpl('fieldSubTpl').apply(this.getSubTplData());
        
        return [
            '<table id="', me.id, '-triggerWrap" class="', Ext.baseCSSPrefix,
                'form-file-trigger-wrap', childElCls,
                '" cellpadding="0" cellspacing="0" role="presentation">',
                '<tbody role="presentation">',
                    '<tr role="presentation">',
                        '<td id="', me.id, '-inputCell" class="', Ext.baseCSSPrefix,
                            'form-trigger-input-cell', childElCls, '" role="presentation">',
                            field,
                        '</td>',
                            me.getTriggerMarkup(),
                    '</tr>',
                '</tbody>',
            '</table>'
        ].join('');
    },

   
    initComponent: function () {
        var me = this;

        me.buttonText = me.text;

        this.callParent(arguments);

        me.on({
            change: {
                fn: function (e, el) {
                    me.fireEvent('filechange', el.files);
                },
                element: 'el'
            },
            boxready: {
                fn: function (cmp) {
                    cmp.fileInputEl.set({ multiple: 'multiple' });
                }
            }
        });
    }
});
