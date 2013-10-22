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
        'Taco.view.themesettings.Group'],
    settingsConfig: null,
    settingsValues: null,
    //layout: {
    //    type: 'vbox',
    //    align: 'stretch'
    //},

    initComponent: function () {

        var me = this;
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

        

        var panel = Ext.create('Ext.form.Panel', {
            trackResetOnLoad: true,
            items: [
                me.formConfig
            ],
            layout: {
                type:'vbox',
                align:'stretch'
            }
            // cls: 'taco-theme-settings',
            //defaults: {
            //    labelAlign: 'top',
            //    labelSeparator: ''
            //    //width: 800
            //},
            //layout: {
            //    type: 'auto'
            //    //,  align: 'stretch'
            //}
        });

        me.body = {
            items: [panel]
        };


        me.form = panel.getForm();
        me.form.setValues(me.settingsValues);

        me.form.on({
           
            validitychange: {
                fn: function (form,valid) {
                    me.dirtyButton.setDirty(valid);
                },
                scope: me
            }
        });

        me.callParent(arguments);

        me.dirtyButton = me.down('dirtybutton');
        me.dirtyButton.on({
            click: {
                fn: me.save,
                scope: me
            }
        });
        me.dirtyButton.setDirty(me.form.isValid());
    },

    save: function () {
        var me = this;

       // me.resetOriginalValues();

        var values = me.form.getValues();

        Ext.Ajax.request({
            url: '/admin/app/themesetting/instance/save/' + this.themeId,
            method: "POST",
            jsonData: values,
            success: function (response) {
                me.dirtyButton.setDirty(me.form.isValid());
            },
            failure: function (response) {
                var r = Ext.JSON.decode(response.responseText);
                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
            }
        });
    },
});