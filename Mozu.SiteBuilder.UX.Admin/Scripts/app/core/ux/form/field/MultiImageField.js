Ext.define('Taco.core.ux.form.field.MultiImageField', {
    extend: 'Ext.form.field.File',
    initComponent: function() {
        var me = this;

        me.on('render', function() {
            me.fileInputEl.set({
                multiple: true
            });
        });
    }
});