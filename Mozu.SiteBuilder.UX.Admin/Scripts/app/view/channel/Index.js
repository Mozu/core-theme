/**
 * @class Taco.view.channel.Index
 */
Ext.define('Taco.view.channel.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [
        'Taco.store.Channels',
        'Taco.model.Channel'
    ],

    typeName: 'Channels',
    gridHeaderLabel: 'Channels',
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    
    // default data to use when createing new entity
    defaultRowEditingData: {
        //name: "name here",
        //code: "code here",
        //region:"region here"
    },

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
                    name: 'name',
                    fieldLabel: 'Name',
                    width: 160
                }, {
                    name: 'code',
                    fieldLabel: 'code',
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
        }, {
            property: 'name',
            text: 'Name'
        }, {
            property: 'code',
            text: 'Code'
        }, {
            property: 'region',
            text: 'region'
        }
    ],

    /*
    header: {
        actions:[]
    },
    */    

    gridPanelConf: {
      
        selModel: {},
        columns: [{
            dataIndex: 'code',
            text: 'Code',
            editor: {
                // defaults to textfield if no xtype is supplied
                allowBlank: true
            },
            width: 200
        }, {
            dataIndex: 'name',
            editor: {
                // defaults to textfield if no xtype is supplied
                allowBlank: true
            },
            text: 'Name',
            width: 200
            
        }, {
            dataIndex: 'region',
            editor: {
                // defaults to textfield if no xtype is supplied
                allowBlank: true
            },
            text: 'Region',
            width: 200
        }]
    }

   
});