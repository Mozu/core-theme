/**
 * @class Taco.view.channel.Index
 */
Ext.define('Taco.view.channel.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    
    requires: [
        'Taco.store.Countries',
        'Taco.store.Channels',
        'Taco.model.Channel'
    ],

    typeName: 'Channel',
    gridHeaderLabel: 'Channels',
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    
    // default data to use when createing new entity
    defaultRowEditingData: {},

    //editorName: 'Taco.view.locationType.Edit',
    
    //plural: false,
    modelName: 'Taco.model.Channel',
    
    store: { type: 'Taco.store.Channels' },

    useTilePanel: false,
    //launchEditorOnClick: false,
    
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [
                {
                    name: 'code',
                    fieldLabel: 'Code',
                    width: 160
                },
                {
                    name: 'name',
                    fieldLabel: 'Name',
                    width: 160
                }
            ]
        }]
    },

    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        },
        {
            property: 'code',
            text: 'Code'
        },
        {
            property: 'groupCode',
            text: 'Group Code'
        },
        {
            property: 'name',
            text: 'Name'
        }
    ],
    
        
    /*
    header: {
        actions:[]
    },
    */    
    

    gridPanelConf: {
      
        selModel: {},
        stateful: true,
        stateId: "statefulChannelsGrid",
        columns: [{
            dataIndex: 'code',
            text: 'Code',
            stateId: "code",
            editor: {
                // defaults to textfield if no xtype is supplied
                emptyText: "Code",
                msgTarget: "qtip",
                // optional enhancement to rowEditor. Makes the field only editable during a create;
                editableOnCreateOnly: true,
                selectOnFocus: true,
                allowBlank: false
            },
            width: 200
        }, {
            dataIndex: 'name',
            stateId: "name",
            editor: {
                // defaults to textfield if no xtype is supplied
                emptyText: "Name",
                msgTarget: "qtip",
                selectOnFocus: true,
                allowBlank: false
            },
            text: 'Name',
            flex:1
            
        }, {
            dataIndex: 'countryCode',
            stateId: "countryCode",
            editor: {
                xtype: 'combobox',
                fieldLabel: null,
                name: 'countryCode',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'code',
                //store: 'Taco.store.Countries' ,
                store : { type: 'Taco.store.Countries' },
                emptyText: "Country",
                msgTarget: "qtip",
                selectOnFocus: true,
                allowBlank: false
            },
            text: 'Country',
            width: 200
        }]
    }

   
});