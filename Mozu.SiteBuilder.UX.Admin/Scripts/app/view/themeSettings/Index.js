/**
 * @class Taco.view.themesettings.Index
 */
Ext.define('Taco.view.themesettings.Index', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.core.ux.form.SelectField',
        'Taco.core.ux.form.ColorField',
        'Taco.core.ux.form.BackgroundImageField',
        'Taco.core.ux.form.FontField'
    ],

    initComponent: function () {
        var me = this,
            panel;

        me.sections = [];
        me.header = {
            title: 'Theme Settings ' + (me.theme ? ':  ' + me.theme.get('name') : ''),
            actions: [{
                xtype: 'primaryaction',
                intentCls: 'save',
                text: 'blerk',
                handler: me.save,
                scope: me
            }]
        };

        me.form = Ext.create('Ext.form.Panel', {
            trackResetOnLoad: true,
            layout: {
                type:'vbox',
                align:'stretch'
            },
            items: [
                me.formConfig
            ]
        });

        Ext.apply(me.body, {
            items: [me.form]
        });

        me.form.getForm().setValues(me.settingsValues);

        me.callParent(arguments);
    },

    save: function () {
        var me = this,
            values = me.form.getForm().getValues(false, false, false, true);

        Ext.Ajax.request({
            url: '/admin/app/themesetting/instance/save/' + this.themeId,
            method: "POST",
            jsonData: values,
            success: Ext.emptyFn,
            failure: function (response) {
                var r = Ext.JSON.decode(response.responseText);

                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
            }
        });
    }
});
