/**
 * @class Taco.core.ux.form.FileInputButton
 */
 
Ext.define('Taco.core.ux.form.FileInputButton', {
    extend: 'Ext.form.field.File',
    alias: 'widget.tacofilefield',
    buttonOnly: true,

    buttonConfig: {
        renderTpl: [
            '<em id="{id}-btnWrap"<tpl if="splitCls"> class="{splitCls}"</tpl>>',
                '<button id="{id}-btnEl" type="{type}" class="{btnCls}" hidefocus="true"',
                    // the autocomplete="off" is required to prevent Firefox from remembering
                    // the button's disabled state between page reloads.
                    '<tpl if="tabIndex"> tabIndex="{tabIndex}"</tpl>',
                    '<tpl if="disabled"> disabled="disabled"</tpl>',
                    ' role="button" autocomplete="off">',
                    '<span id="{id}-btnInnerEl" class="{baseCls}-inner" style="{innerSpanStyle}">',
                        '{text}',
                    '</span>',
                    '<span id="{id}-btnIconEl" class="{baseCls}-icon {iconCls}"<tpl if="iconUrl"> style="background-image:url({iconUrl})"</tpl>></span>',
                '</button>',
            '</em>',
            '<input id="{id}-fileInputEl" class="{inputCls}" type="file"  multiple="multiple" size="1" name="{inputName}">'
        ]
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
            }
        });
    }




});



           