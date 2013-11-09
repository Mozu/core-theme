/**
 * @class Taco.view.themesettings.Index
 */
Ext.define('Taco.view.themesettings.Index', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.themesettingseditor',
    requires: [
        'Taco.core.ux.form.SelectField',
        'Taco.core.ux.form.ColorField',
        'Taco.core.ux.form.BackgroundImageField',
        'Taco.core.ux.form.FontField',
        'Taco.view.themesettings.Section',
        'Taco.view.themesettings.Group'
    ],

    settingsConfig: null,
    settingsValues: null,

    initComponent: function () {
        var me = this,
            panel;

        me.sections = [];
        me.header = {
            title: 'Theme Settings ' + (me.theme ? ':  ' + me.theme.get('name') : ''),
            actions: [{
                xtype: 'dirtybutton',
                intentCls: 'save',
                text: 'Save',
                eventName: 'save'
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
            values = me.form.getForm().getValues();

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
