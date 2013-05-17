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

        var items = me.buildFormConfig();

        var panel = Ext.create('Ext.form.Panel', {
            trackResetOnLoad: true,
            //width: 500,
            padding: "0 0 0 0",
            items: items,
            cls: 'taco-theme-settings',
            defaults: {
                labelAlign: 'top',
                labelSeparator: ''
                //width: 800
            },
            layout: {
                type: 'auto'
              //,  align: 'stretch'
            }
        });

        me.body = {
            items: [panel]
        };

        me.form = panel.getForm();
        me.form.setValues(me.loadData());

        me.form.on({
            dirtychange: {
                fn: me.onFormStateChange,
                scope: me
            },
            validitychange: {
                fn: me.onFormStateChange,
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
    },

    buildFormConfig: function () {
        var me = this;
        var items = [];

        Ext.each(me.settingsConfig, function (item) {
            items.push(me.parseItem(item));
        });

        return items;
    },

    parseItem: function (item) {
        var me = this,
            cfg = null,
            method = "create" + Ext.String.capitalize(item.itemType),
            isGroupContainer= item.itemType=='section';

        if (me[method]) {
            cfg = me[method].call(me, item);
        } else {
            cfg = me.createErrorLabel("Item type '" + item.itemType + "' is not valid.", item);
        }


        // If this is not a leaf node, continue walking the tree
        if (cfg && item.itemType != "field" && item.itemType != "preset") {

            if (!cfg.items) {
                cfg.items = [];
            }

            Ext.each(item.items, function (i) {
                isGroupContainer= isGroupContainer && i.itemType=='group';
                cfg.items.push(me.parseItem(i));
            });
            if ( isGroupContainer){
                 // cfg.layout={
                 //        type: 'hbox'
                 //      //,  align: 'stretch'
                 //    };
            }
        }

        return cfg;
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
    },

    isDirty: function () {
        return (this.form.isValid() && this.form.isDirty());
    },

    resetOriginalValues: function () {
        var me = this;

        Ext.each(me.form.getFields().items, function (field) {
            field.resetOriginalValue();
        });
    },

    onFormStateChange: function () {
        var me = this;

        if (!me.dirtyButton) {
            return;
        }

        me.dirtyButton.setDirty(me.isDirty());
    },

    save: function () {
        var me = this;

        me.resetOriginalValues();

        var values = me.form.getValues();

        // Convert this back to array of key/value pairs
        var data = [];

        for (var k in values) {
            var val = values[k];
            if (Ext.isArray(val)) {
                val = val.length > 0 ? val[0] : null;
            }
            data.push({
                id: k,
                value: val
            });
        }

        Ext.Ajax.request({
            url: '/admin/app/themesetting/instance/save/'+ this.themeId,
            method: "POST",
            jsonData: data,
            success: function (response) {
                Taco.app.signalCacheFlush({ model: 'Taco.model.ThemeSettings' });
                var r = Ext.JSON.decode(response.responseText);
                if (r.success) {
                    Taco.app.fireEvent('setmessage', 'Theme settings saved.', 'status');
                } else {
                    Taco.app.fireEvent('setmessage', 'Theme settings save failed.', 'error', r.message);
                }
            },
            failure: function (response) {
                var r = Ext.JSON.decode(response.responseText);
                Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
            }
        });
    },

    loadData: function () {
        var me = this;
        var instanceData = {};

        Ext.each(me.settingsValues, function (item) {
            instanceData[item.id] = item.value;
        });

        return instanceData;
    },

    createSection: function (sectionCfg) {
        return {
            xtype: 'themesettingssection',
            title: sectionCfg.text
        };
    },

    createGroup: function (groupCfg) {

        return {
            xtype: 'themesettingsgroup',
            id: groupCfg.id,
            title: groupCfg.text
        };
    },

    createField: function (fieldCfg) {
        var me = this;
        var cfg = {};

        var method = "create" + Ext.String.capitalize(fieldCfg.mode);

        if (me[method]) {
            cfg = me[method].call(me, fieldCfg);
        } else {
            cfg = me.createErrorLabel("Field type '" + fieldCfg.itemType + "' is not valid.", fieldCfg);
        }

        return cfg;
    },

    createPreset: function (presetCfg) {
        var me = this;
        var outerContainer = {
            xtype: "container"
        };

        var fieldContainer = {
            xtype: 'container',
            defaults: {
                labelAlign: 'left',
                labelWidth: 225,
                labelSeparator: ''
            },
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        };

        var fld = Ext.create('Taco.core.ux.form.SelectField', {
            xtype: 'selectfield',
            name: presetCfg.id,
            width: 500,
            labelWidth: 225,
            fieldLabel: presetCfg.text,
            store: Ext.create('Ext.data.Store', {
                data: presetCfg.presetValues,
                fields: ['id', 'display']
            }),
            displayField: 'display',
            valueField: 'id',
            value: presetCfg.defaultValue
        });

        fld.on('change', function () {
            me.onPresetChange(presetCfg);
        });

        var toggle = Ext.create('Taco.core.ux.action.Action', {
            text: presetCfg.presetTriggerText,
            presetTriggerGroup: presetCfg.presetTriggerGroup,
            padding: '7 0 0 10',
            style: {
                "font-size": "16px"
            },
            click: function () {
                me.onPresetTriggerClick(this.presetTriggerGroup);
            }
        });

        fieldContainer.items = [fld, toggle];

        // TODO: Loop thru the preset groups and add them to the container

        outerContainer.items = [fieldContainer];

        // TODO: render the field based on the preset mode: color, font, etc.

        return outerContainer;
    },

    onPresetTriggerClick: function (groupId) {

        var group = this.queryById(groupId);

        if (group.getCollapsed()) {
            group.expand();
        } else {
            group.collapse();
        }
    },

    onPresetChange: function (presetCfg) {
        // Get the value of the field
        var fieldVal = this.form.getFieldValues()[presetCfg.id];

        if (fieldVal) {
            var fields = this.form.getFields();

            // Add all of the presets for this selection
            Ext.each(presetCfg.presetValues, function (item) {
                if (item.id == fieldVal) {
                    Ext.each(item.values, function (v) {
                        fields.each(function (fld) {
                            if (fld.name == v.id) {
                                fld.setValue(v.value);
                            }
                        });
                    });
                }
            });
        }
    },

    createSelect: function (fieldCfg) {
        return {
            xtype: 'selectfield',
            width: 500,
            name: fieldCfg.id,
            fieldLabel: fieldCfg.text,
            store: Ext.create('Ext.data.Store', {
                data: fieldCfg.values,
                fields: ['value', 'display']
            }),
            displayField: 'display',
            valueField: 'value',
            value: fieldCfg.defaultValue
        };
    },

    createTextbox: function (fieldCfg) {
        return {
            xtype: 'textfield',
            name: fieldCfg.id,
            fieldLabel: fieldCfg.text,
            value: fieldCfg.defaultValue,
            width: 500
        };
    },

    createCheckbox: function (fieldCfg) {
        return {
            xtype: 'checkbox',
            name: fieldCfg.id,
            boxLabel: fieldCfg.text,
            boxLabelAlign: 'after',
            value: fieldCfg.defaultValue
        };
    },

    createRadio: function (fieldCfg) {
        var items = [];

        Ext.each(fieldCfg.values, function (item, index, list) {
            items.push({
                boxLabel: item.display,
                name: fieldCfg.id,
                inputValue: item.value,
                checked: (fieldCfg.defaultValue == item.value)
            });
        });

        return {
            xtype: 'radiogroup',
            layout: 'vbox',
            labelAlign: 'top',
            fieldLabel: fieldCfg.text,
            defaults: {
                name: "myradios"
            },
            items: items
        };
    },

    createColor: function (fieldCfg) {
        return {
            xtype: 'colorfield',
            name: fieldCfg.id,
            pickerSize: 25,
            fieldLabel: fieldCfg.text,
            value: fieldCfg.defaultValue,
            labelAlign: 'left'
        };
    },

    createBackgroundImage: function (fieldCfg) {
        return {
            xtype: 'backgroundimagefield',
            name: fieldCfg.id,
            pickerSize: 25,
            fieldLabel: fieldCfg.text,
            value: fieldCfg.defaultValue,
            labelAlign: 'left'
        };
    },

    createFont: function (fieldCfg) {
        return {
            xtype: 'fontfield',
            name: fieldCfg.id,
            fieldLabel: fieldCfg.text,
            value: fieldCfg.defaultValue,
            labelAlign: 'left'
        };
    },

    createErrorLabel: function (msg, fieldCfg) {

        console.log(msg, fieldCfg);

        return {
            html: '<h2 style="color: red;">' + msg + '</h2>',
            padding: "10 0 0 0"
        };
    }
});
