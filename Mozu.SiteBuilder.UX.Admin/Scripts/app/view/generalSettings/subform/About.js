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
            name: 'siteTimeFormat',
            fieldLabel: 'Time format',
            valueField: 'value',            
            displayField: 'display',
            columnWidth: .5,
            //margin: "0 4 0 0",
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
            name: 'siteTimeZone',
            fieldLabel: 'Time zone',
            valueField: 'name',
            displayField: 'name',
            queryMode: 'local',
            columnWidth: .5,
            margin: "0 4 0 0",
            width: 350,
            store: Ext.create('Taco.store.TimeZones', {
                autoLoad: true
            })
        };
        
        me.timeSettings = Ext.widget('fieldcontainer', {
            layout: 'column',
            width: "100%",
            items: [
                me.timeZoneSelect,
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
            margin: "0 4 0 0",
            triggerAction: 'all',
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Channels',
                autoLoad: true
                
            })
        });
        


        var siteStore = Taco.app.context.getStore(true);
        siteStore.filter([{
            filterFn: function (item) { return item.get('contextType') === 's' && item.get('isMozuRendered') }
        }]);
        siteStore.addListener('load', function (data) {
            var value = me.record.get("templateSiteId");
            if (!value) {
                // default to the first selection;
                me.customerExperienceTemplate.select(me.customerExperienceTemplate.store.data.items[1]);
            }
            me.customerExperienceTemplate.clearInvalid();
        }, me, { single: true });
        me.customerExperienceTemplate = Ext.create('Ext.form.field.ComboBox', {
            name: "templateSiteId",
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
            store: siteStore
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
                name: 'adjustForDaylightSavingTime',
                checked: this.record.get('adjustForDaylightSavingTime'),
                uncheckedValue: false,
                inputValue:true,
                hidden: true,
                boxLabel: 'Automatically adjust clock for daylight savings'
            },
            {
                xtype: 'fieldcontainer',
                layout: "hbox",
                items: [
                    me.channelCombo,
                    {
                        xtype: "editabledisplayfield",
                        name: "catalogName",
                        fieldLabel: "Catalog",
                        value: Taco.app.context.findCatalog(Taco.app.context.getSite().catalogId).name,
                        flex: 1
                    }
                ]
            },
            {

                xtype: 'fieldcontainer',
                // note this layout is required for radiogroups to have the proper height;
                layout: 'hbox',
                items: [
                    {
                        xtype: "editabledisplayfield",
                        //name:"isWebSite",
                        fieldLabel: "Mozu Hosted Store Front",
                        margin: "0 4 0 0",
                      
                        value: me.record.get('isMozuWebSite') ? 'Yes' : 'No',
                        flex: 1
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        items:[
                            {
                                xtype: 'textfield',
                                name: 'customCdnHostName',
                                fieldLabel: 'CDN Domain',
                                emptyText:Taco.cdnPrefix,
                                flex: 1
                            },
                            {
                       
                                xtype: 'button',
                                margin: '41 0 0 10',
                                text: 'Bust Cache',
                                ui: 'action',
                                scale: 'medium',
                             
                                handler: function () {
                                    me.down('#cdnCacheBustKey').setValue( '_'+new Date().getTime());
                                }
                        
                            }
                        ],
                        flex: 1
                    
                        
                    },
                   
                
                   {
                       xtype: 'hiddenfield',
                       name: 'cdnCacheBustKey',
                       itemId:'cdnCacheBustKey'
                   }
                ]
            }
        ];

        this.callParent(arguments);
    }
    
  
});
