/**
 * @class Taco.view.generalSettings.subform.About
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.About', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.SelectField',
        'Ext.form.field.ComboBox',
        'Ext.form.RadioGroup',
        'Ext.form.field.Radio',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Text',
        'Taco.store.TimeZones',
        'Taco.model.ThemeListing',
        'Taco.store.ThemeListing',
        'Taco.store.Channels'
    ],
    title: 'General',
    margin: "0 0 20 0",
    ui: "subform",
    width:"100%",
    //bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    //cls: Taco.baseCSSPrefix + 'form-section',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };
        
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
            })
        };

        me.timeZoneSelect = {
            xtype: 'selectfield',
            name: 'timeZone',
            fieldLabel: 'Time zone',
            valueField: 'name',
            displayField: 'name',
            queryMode: 'local',
            width: 350,
            store: Ext.create('Taco.store.TimeZones', {
                autoLoad: true
            })
        };
        
        me.timeSettings = Ext.widget('fieldcontainer', {
            layout: 'hbox',
            width: "100%",
            items: [
                me.timeZoneSelect,
                {xtype:"splitter"},
                me.timeFormatSelect
            ]
        });


        
        //var channelStore = 

        me.channelCombo = Ext.create('Ext.form.field.ComboBox', {
            name: 'channelId',
            flex:1,
            fieldLabel: 'Channel',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            allowBlank: false,
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Channels',
                autoLoad: true,
                remoteFilter:false,
                listeners: {
                    load: {
                        fn: function () {
                            //me.channelCombo.setValue(me.record.get("channelId"));
                            me.channelCombo.clearInvalid();
                        },
                        single: true,
                        scope: me
                    }
                }
            })
        });
        



        me.customerExperienceTemplate = Ext.create('Ext.form.field.ComboBox', {
            name: "theme",
            flex: 1,
            columnWidth: .5,
            fieldLabel: 'Customer Experience Template',
            queryMode: 'local',
            editable: false,
            forceSelection: true,
            displayField: 'name',
            valueField: 'id',
            //check if needed before setting allowBlank
            allowBlank: true,
            hidden:this.record.get("isMozuWebSite"),
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.ThemeListing',
                autoLoad: true,
                listeners: {
                    load: {
                        fn: function (data) {
                            var value = me.record.get("theme");
                            if (!value) {
                                // default to the first selection;
                                me.customerExperienceTemplate.select(me.customerExperienceTemplate.store.data.items[1]);
                            }
                            me.customerExperienceTemplate.clearInvalid();
                        },
                        single: true,
                        scope: me
                    }
                }
            })
        });
        
        this.items = [
            {
                xtype: 'textfield',
                name: 'websiteName',
                fieldLabel: 'Web Site Name',
                width:"100%"
            },
            me.timeSettings,
            {
                xtype: 'checkbox',
                name: 'daylightSaving',
                checked: this.record.get('daylightSaving'),
                uncheckedValue: false,
                inputValue:true,
                boxLabel: 'Automatically adjust clock for daylight savings'
            },
            {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [
                    me.channelCombo,
                    {
                        xtype: "splitter"
                    },
                    {
                        xtype: "editabledisplayfield",
                        name: "catalogName",
                        fieldLabel: "Catalog",
                        value: Taco.app.context.findCatalog(Taco.app.context.getCurrentSite().catalogId).name,
                        flex: 1
                    }
                ]
            },
            {
                xtype: 'fieldcontainer',
                // note this layout is required for radiogroups to have the proper height;
                layout:"column",
                items: [
                    {
                        xtype: "radiogroup",
                        //name:"isWebSite",
                        fieldLabel: "Mozu Hosted Store Front",
                        //flex: 1,
                        columnWidth: .5,
                        name: "isMozuWebSiteGroup",
                        layout: {
                            layout : "hbox",
                        },
                        columns:1,
                        defaults: {
                            name: "isMozuWebSite"
                        },
                        items: [
                            { xtype:"radiofield", boxLabel: "Yes", inputValue: true, id:"radio1" },
                            { xtype: "radiofield", boxLabel: "No", inputValue: false, id: "radio2" }
                        ],
                        listeners: {
                            change: {
                                fn: function (cmp, newValue, oldValue, eOpts) {
                                    //toggle the visibility and set the toggle field to be required when visible and not required when hidden;
                                    me.customerExperienceTemplate.allowBlank = newValue.isMozuWebSite;
                                    me.customerExperienceTemplate.setVisible(!newValue.isMozuWebSite);
                                },
                                scope:me
                            }
                        }
                    },
                    me.customerExperienceTemplate
                ]
            }
        ];

        this.callParent(arguments);
    },
    loadForm: function (record, noCascade) {
        var me = this;
        var form = me.getForm()
        var value = me.record.get("isMozuWebSite");
        var fieldGroup = form.findField("isMozuWebSiteGroup");
        // need to manualy set radio buttons. Auto setvalues in form.Form doesn't work.
        // radioButton.setValue() only works for a set of radio buttons when the value is a string instead of boolean. boolean values only set the first field with that field name.6 years later and extjs still screws radio buttons up.
        fieldGroup.setValue({
            "isMozuWebSite": value
        });
        
        this.callParent(arguments);
    }
});
