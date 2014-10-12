/**
 * @class Taco.core.ux.form.FileInputButton
 */
 
Ext.define('Taco.core.ux.form.FileInputButton', {
    extend: 'Ext.form.field.File',
    alias: 'widget.tacofilefield',

    buttonOnly: true,

    buttonConfig: {
        ui: 'action-primary',
        scale: 'medium'
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
