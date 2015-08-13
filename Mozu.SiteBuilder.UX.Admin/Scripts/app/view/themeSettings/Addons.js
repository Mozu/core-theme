/**
 * @class Taco.view.themesettings.Index
 */

Ext.define('Taco.view.themesettings.Addons', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        
        'Ext.ux.form.field.BoxSelect'
    ],

    settingsConfig: null,
    settingsValues: null,

    initComponent: function () {
        var me = this,
            selectedValues = [],
            panel;

        this.header = {
            title: 'Theme Addons ' + (this.theme ? ':  ' + this.theme.get('name') : ''),
            actions: [{
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Save',
                scope: this,
                handler: this.save
            }]
        };

        this.store = Ext.create('Taco.store.ThemeListings', {
            data: me.addons
        });

        this.store.each(function (record) {
            if (record.data.isSelectedDesktop) {
                selectedValues.push(record.getId());
            }
        });


        this.itemSelect = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 600,
            store: this.store,
            queryMode: 'local',
            displayField: 'name',
            value: selectedValues,
            imagePath: '../ux/images/',
            valueField: 'id'
        });

        panel = Ext.create('Ext.form.Panel', {
            trackResetOnLoad: true,
            items: [me.itemSelect],
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });

        Ext.apply(me.body = {
            items: [panel]
        });

        this.callParent(arguments);
    },

    save: function () {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/themes/addons/update/' + this.themeId,
            method: "POST",
            jsonData: me.itemSelect.getValue(),
            success: function (response) {
                me.itemSelect.resetOriginalValue();
            },
            failure: function (response) {
                var r = Ext.JSON.decode(response.responseText);

                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
            }
        });
    }
});
