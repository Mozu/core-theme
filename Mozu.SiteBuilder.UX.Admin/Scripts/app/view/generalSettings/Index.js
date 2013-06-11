/**
 * @class Taco.view.generalsettings.Index
 */
Ext.define('Taco.view.generalsettings.Index', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.generalsettingseditor',
    requires: [
        'Taco.view.generalSettings.subform.About',
        'Taco.view.generalSettings.subform.Rules',
        'Taco.view.generalSettings.subform.Notifications',
        'Taco.view.generalSettings.subform.Analytics',
        'Taco.view.generalSettings.subform.Robots',
        'Taco.view.generalSettings.subform.Tools'],
    settings: null,
    sections: null,

    requiresContextOfType: 's',

    initComponent: function () {
        





        var me = this;
        me.sections = [];
        me.header = {
            title: 'General Settings',
            actions: [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                intentCls: 'save',
                text: 'Save',
                eventName: 'save'
            }]
        };
        
        /*
        me.about = Ext.create('Ext.form.Panel', {
            title: 'About My Website',
            titleCollapse: true,
            collapsible: true,
            collapsed: false,
            collapseMode: 'header',
            header: {
                border: '0 0 0 0'
            },
            defaults: {
                labelAlign: 'top',
                width: 350,
                margin: '0 0 15 15'
            },
            items: [{
                xtype: 'textfield',
                name: 'websiteName',
                fieldLabel: 'Website Name',
                value: me.settings.websiteName
            }, me.timeSettings, {
                xtype: 'checkbox',
                name: 'daylightSaving',
                checked: me.settings.daylightSaving,
                boxLabel: 'Automatically adjust clock for daylight savings',
                boxLabelAlign: 'after'
            }],
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });
*/
       
        me.body = {
            items: [
                Ext.create('Taco.view.generalSettings.subform.About'),
                Ext.create('Taco.view.generalSettings.subform.Rules'),
                Ext.create('Taco.view.generalSettings.subform.Maintenance')/*,
                Ext.create('Taco.view.generalSettings.subform.Notifications'), 
                Ext.create('Taco.view.generalSettings.subform.Analytics'),  
                Ext.create('Taco.view.generalSettings.subform.Robots'), 
                Ext.create('Taco.view.generalSettings.subform.Tools')*/
            ]
        };

        me.callParent(arguments);

        me.on({
            'addiprange': {
                fn: me.addIpRange,
                scope: me
            }
        });

        me.dirtyButton = me.down('dirtybutton');
        me.dirtyButton.on({
            click: {
                fn: me.save,
                scope: me
            }
        });

        me.cancelButton = me.down('secondarybutton');
        me.cancelButton.on({
            click: {
                fn: me.cancel,
                scope: me
            }
        });
    },

    onBeforeNavigate: function (newState, continueNavigate) {
        var me = this, confirm;

        if (me.isDirty()) {
            confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
                text: 'You have unsaved changes.<br><br>Would you like to continue and discard these changes?',
                confirm: function () {
                    confirm.hide();
                    me.resetOriginalValues();
                    continueNavigate();
                },
                autoShow: true
            });
            return false;
        }
        return true;
    },

    isDirty: function () {
        var me = this,
            store = this.ipRangeStore,
            isDirty = false;

        if (store.getNewRecords().length || store.getRemovedRecords().length) {
            return true;
        }

        Ext.each(me.sections, function (section) {
            if (!section.noDirtyState && section.form && !isDirty) {
                var form = section.getForm();
                isDirty = form.isDirty();
            }
        });

        return isDirty;
    },

    resetOriginalValues: function () {
        var me = this;

        me.ipRangeStore.load();

        Ext.each(me.sections, function (section) {
            if (section.form) {
                var form = section.getForm();

                Ext.each(form.getFields().items, function (field) {
                    field.resetOriginalValue();
                });
            }
        });

        Ext.each(me.ipRangeStore.getNewRecords(), function (record) {
            me.ipRangeStore.remove(record);
        });
        Ext.each(me.ipRangeStore.getRemovedRecords(), function (record) {
            me.ipRangeStore.add(record);
        });
    },

    onFormStateChange: function () {
        var me = this;

        if (!this.dirtyButton) {
            return;
        }

        me.dirtyButton.setDirty(me.isDirty());
    },

    
    
    cancel: function () {
        var me = this;

        me.resetOriginalValues();
    },

    save: function () {
        var me = this, settingsModel = { ipRanges: [], allowAllIps: me.ipAddresses.allowAllIps() };

        Ext.each(me.sections, function (section) {
            Ext.apply(settingsModel, section.form.getValues());
        });

        settingsModel.daylightSaving = settingsModel.daylightSaving === "on";

        Ext.each(me.ipRangeStore.data.items, function (item) {
            settingsModel.ipRanges.push({
                id: item.raw.id,
                start: item.raw.start,
                end: item.raw.end
            });
        });

        me.saveSettings(settingsModel);
    },

    saveSettings: function (settingsModel) {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/generalsetting/save',
            method: "POST",
            jsonData: settingsModel,
            success: function (response) {
                Taco.app.signalCacheFlush({ model: 'Taco.model.GeneralSettings'});
                var r = Ext.JSON.decode(response.responseText);
                if (r.success) {
                    me.resetOriginalValues();
                } else {
                    Taco.app.fireEvent('setmessage', 'General settings save failed.', 'error', r.message);
                }
                
            },
            failure: function (response) {
                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', response.message);
            }
        });
        
    },

    onStoreStateChange: function (form) {
        var me = this,
            isDirty = me.isDirty(),
            dirtyButton = me.down('dirtybutton');

        dirtyButton.setDirty(isDirty);
    },

    addIpRange: function (values) {
        var me = this,
            store = me.ipRangeStore;

        if (!(values.ipStart) || !(values.ipEnd)) {
            return false;
        }

        if (values.ipStart === values.ipEnd) {
            Taco.app.fireEvent('setmessage', 'Ip address start and end cannot be the same.', 'error');
            return false;
        }

        store.add({
            id: values.id,
            start: values.ipStart,
            end: values.ipEnd
        });

        return true;
    },

    removeIpRange: function (view, index, idx, action, e, record) {
        var me = this;

        me.ipRangeStore.remove(record);
    }
});