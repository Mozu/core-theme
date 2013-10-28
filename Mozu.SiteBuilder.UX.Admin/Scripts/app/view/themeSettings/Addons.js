/**
 * @class Taco.view.themesettings.Index
 */
Ext.define('Taco.view.themesettings.Addons', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Ext.ux.ItemSelector',
        'Ext.ux.form.field.BoxSelect'
    ],

    settingsConfig: null,
    settingsValues: null,
    //layout: {
    //    type: 'vbox',
    //    align: 'stretch'
    //},

    initComponent: function () {

        var me = this,
            selectedValues = [];

        me.header = {
            title: 'Theme Addons ' + (me.theme ? ':  ' + me.theme.get('name') : ''),
            actions: [{
                xtype: 'dirtybutton',
                intentCls: 'save',
                text: 'Save',
                eventName: 'save'
            }]
        };
        me.store = Ext.create('Taco.store.ThemeListing', {
            data: me.addons
        });

        me.store.each(function (record) {
            if (record.data.isSelectedDesktop) {
                selectedValues.push(record.getId());
            }
        });
        //me.itemSelect = Ext.create('Ext.ux.ItemSelector', {
        //    width:600,
        //    store: me.store,
        //    displayField: 'name',
        //    value: ['Orange'],
        //    imagePath: '../ux/images/',
        //    valueField:'id'
        //});


        me.itemSelect = Ext.create('Ext.ux.form.field.BoxSelect', {
            width: 600,
            store: me.store,
            queryMode: 'local',
            displayField: 'name',
            value: selectedValues,
            imagePath: '../ux/images/',
            valueField: 'id',
            listeners: {
                dirtyChange: function (field, isDirty) {
                    if (me.dirtyButton) {
                        me.dirtyButton.setDirty(isDirty);
                    }
                }
            }            
        });
        var panel = Ext.create('Ext.form.Panel', {
            trackResetOnLoad: true,
            items: [
                me.itemSelect
            ],
            layout: {
                type: 'vbox',
                align: 'stretch'
            }            
        });

        me.body = {
            items: [panel]
        };       
      

        me.callParent(arguments);

        me.dirtyButton = me.down('dirtybutton');
        me.dirtyButton.on({
            click: {
                fn: me.save,
                scope: me
            }
        });
        me.dirtyButton.setDirty(me.itemSelect.isDirty());
    },

    save: function () {
        var me = this;

        // me.resetOriginalValues();

        Ext.Ajax.request({
            url: '/admin/app/themes/addons/update/' + this.themeId,
            method: "POST",
            jsonData: me.itemSelect.getValue(),
            success: function (response) {
                me.dirtyButton.setDirty(true);
                me.itemSelect.resetOriginalValue();
            },
            failure: function (response) {
                var r = Ext.JSON.decode(response.responseText);
                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
            }
        });
    },
});