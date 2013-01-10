/**
 * @class Taco.view.generalsettings.Index
 */
Ext.define('Taco.view.generalsettings.Index', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.generalsettingseditor',
    requires: ['Ext.form.field.Hidden','Taco.core.ux.form.SelectField', 'Taco.store.TimeZones', 'Taco.store.IpRanges'],
    settings: null,
    sections: null,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

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

        me.ipRangeStore = Ext.create('Taco.store.IpRanges', {
            autoLoad: true,
            listeners: {
                add: me.onStoreStateChange,
                remove: me.onStoreStateChange,
                load: function (store, records, successful) {
                    var form = me.ipAddresses.getForm();
                    if (successful && records.length) {
                        form.setValues({ ipaddress: 'block' });
                    } else {
                        form.setValues({ ipaddress: 'allow' });
                    }
                },
                scope: me
            }
        });

        me.timeFormatSelect = {
            xtype: 'selectfield',
            name: 'timeFormat',
            fieldLabel: 'Time format',
            valueField: 'value',
            displayField: 'display',
            width: 185,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: [{
                    name: 'value',
                    type: 'string'
                }, {
                    name: 'display',
                    type: 'string'
                }],
                data: [
                    ['h:mm:ss tt', '12 hour time format'],
                    ['H:mm:ss tt', '24 hour time format'],
                    ['hh:mm:ss tt', '12 hour w/ leading zeros'],
                    ['HH:mm:ss tt', '24 hour w/ leading zeros']
                ]
            }),
            value: me.settings.timeFormat
        };

        me.timeZoneSelect = {
            xtype: 'selectfield',
            name: 'timeZone',
            fieldLabel: 'Time zone',
            valueField: 'name',
            displayField: 'name',
            queryMode: 'local',
            width: 350,
            store: Ext.create('Taco.store.TimeZones', { autoLoad: true }),
            value: me.settings.timeZone
        };

        me.timeSettings = Ext.widget('panel', {
            layout: 'hbox',
            width: 960,
            defaults: {
                labelAlign: 'top',
                margin: '0 20 0 0'
            },
            items: [me.timeZoneSelect, me.timeFormatSelect]
        });

        me.analytics = Ext.create('Ext.form.Panel', {
            title: 'Google Analytics',
            titleCollapse: true,
            collapsible: true,
            collapsed: true,
            collapseMode: 'header',
            header: {
                border: '0 0 0 0'
            },
            defaults: {
                labelAlign: 'top',
                width: 450,
                margin: '0 0 15 15'
            },
            items: [
                {
                    xtype: 'textfield',
                    itemId: 'googleAnalyticsId',
                    name: 'googleAnalyticsId',
                    fieldLabel: "User Account (UA#)",
                    value: me.settings.googleAnalyticsId,
                    disabled: !me.settings.googleAnalyticsEnabled
                },
                {
                    xtype: 'checkbox',
                    name: 'googleAnalyticsEnabled',
                    itemId: 'googleAnalyticsEnabled',
                    boxLabel: 'Enable Google Analytics on your storefront',
                    boxLabelAlign: 'after',
                    checked: me.settings.googleAnalyticsEnabled,
                    listeners: {
                        change: function (cmp, isChecked) {
                            me.analytics.getComponent('googleAnalyticsId').setDisabled(!isChecked);
                        }
                    }
                },
                {
                    xtype: 'checkbox',
                    name: 'googleAnalyticsEcomEnabled',
                    boxLabel: 'Enable <a target="_blank" href="https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce">Google Analytics eCommerce transaction tracking</a>',
                    boxLabelAlign: 'after',
                    checked: me.settings.googleAnalyticsEcomEnabled
                }
            ],
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });

        me.robots = Ext.create('Ext.form.Panel', {
            title: 'BEEP BOOP RO BOTS',
            titleCollapse: true,
            collapsible: true,
            collapsed: true,
            collapseMode: 'header',
            header: {
                border: '0 0 0 0'
            },
            defaults: {
                labelAlign: 'top',
                width: 450,
                margin: '0 0 15 15'
            },
            items: [
                {
                    xtype: 'textarea',
                    name: 'robotsOverride',
                    itemId: 'robotsOverride',
                    fieldLabel: "ROBOTS.TXT Contents",
                    value: me.settings.robotsOverrideEnabled ? me.settings.robotsOverride : 'User-agent: *',
                    disabled: !me.settings.robotsOverrideEnabled
                },
                {
                    xtype: 'checkbox',
                    name: 'robotsOverrideEnabled',
                    itemId: 'robotsOverrideEnabled',
                    boxLabel: 'Override the site default ROBOTS.TXT',
                    boxLabelAlign: 'after',
                    checked: me.settings.robotsOverrideEnabled,
                    listeners: {
                        change: function (cmp, isChecked) {
                            me.robots.getComponent('robotsOverride').setDisabled(!isChecked);
                        }
                    }
                }
            ],
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });
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

        me.addform = Ext.create('Ext.form.Panel', {
            layout: { type: 'hbox', align: 'middle' },
            defaults: {
                xtype: 'container',
                width: 180,
                layout: { type: 'vbox', align: 'left' },
                cls: Taco.baseCSSPrefix + 'toolbar-form-cell'
            },
            items: [{
                items: [{
                    xtype: 'hiddenfield',
                    name: 'id',
                    value: 0
                }, {
                    xtype: 'textfield',
                    name: 'ipStart'
                }]
            }, {
                items: [{
                    xtype: 'textfield',
                    name: 'ipEnd'
                }]
            }, {
                width: 48,
                layout: { type: 'vbox', align: 'center' },
                items: [{
                    xtype: 'component',
                    autoEl: { tag: 'a', html: 'Add' },
                    listeners: {
                        click: {
                            element: 'el',
                            fn: function () {
                                var form = me.addform.getForm();
                                me.fireEvent('addiprange', form.getFieldValues());
                                form.reset();
                            },
                            scope: this
                        }
                    }
                }]
            }]
        });

        me.ipAddressGrid = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.ipRangeStore,
            width: 440,
            selType: 'cellmodel',

            columns: [{
                dataIndex: 'id',
                hidden: true
            }, {
                dataIndex: 'start',
                text: 'IP address start',
                flex: 1
            }, {
                dataIndex: 'end',
                text: 'IP address end',
                width: 215
            }],

            actions: [{
                tooltip: 'Remove',
                iconCls: Taco.baseCSSPrefix + 'action-remove',
                eventName: 'removeip'
            }],

            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                weight: 101,
                layout: { type: 'vbox', align: 'stretch' },
                cls: Taco.baseCSSPrefix + 'toolbar-form',
                items: [me.addform]
            }],

            listeners: {
                removeip: {
                    fn: me.removeIpRange,
                    scope: me
                }
            }
        });

        me.ipAddresses = Ext.create('Ext.form.Panel', {
            title: 'IP Address Security Rules',
            titleCollapse: true,
            collapsible: true,
            collapsed: true,
            collapseMode: 'header',
            hasIpBlockList: true,
            header: {
                border: 'none'
            },
            defaults: {
                labelAlign: 'top',
                margin: '15 0 15 15'
            },
            items: [{
                xtype: 'radiogroup',
                layout: 'vbox',
                defaults: {
                    xtype: 'radio',
                    name: 'ipaddress'
                },
                items: [{
                    boxLabel: 'Allow all IP addresses',
                    inputValue: 'allow'
                }, {
                    boxLabel: 'Block 1 or a range of IP addresses',
                    inputValue: 'block'
                }],
                listeners: {
                    change: function (field, newValue, oldValue) {
                        (hasIpBlockList = newValue.ipaddress === 'block') ? me.ipAddressGrid.show() : me.ipAddressGrid.hide();
                        if (oldValue.ipaddress) { // not changing this for the first time
                            me.onFormStateChange();
                        }
                    },
                    scope: me
                }
            }, me.ipAddressGrid],
            allowAllIps: function () {
                return !hasIpBlockList;
            }
        });

        me.notifications = Ext.create('Ext.form.Panel', {
            title: 'Notifications',
            titleCollapse: true,
            collapsible: true,
            collapsed: true,
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
                fieldLabel: 'Sender e-mail',
                name: 'senderEmail',
                value: me.settings.senderEmail
            }, {
                xtype: 'textfield',
                fieldLabel: 'Reply-to e-mail',
                name: 'replyToEmail',
                value: me.settings.replyToEmail
            }],
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });

        me.sections = [me.about, me.notifications, me.analytics, me.robots];

        me.body = {
            items: [me.about, me.ipAddresses, me.notifications, me.analytics, me.robots]
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
            if (section.form && !isDirty) {
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