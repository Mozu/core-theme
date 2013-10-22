/**
 * @class Taco.view.location.Index
 */
Ext.define('Taco.view.location.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [
        'Taco.store.Locations',
        'Taco.model.Location'
    ],

    typeName: 'Locations',
    gridHeaderLabel: 'Locations',
    
    editorName: 'Taco.view.location.Edit',
    
    //plural: false,
    modelName: 'Taco.model.Location',
    
    store: { type: 'Taco.store.Locations' },

   
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
            items: [{
                name: 'name',
                fieldLabel: 'Name',
                width: 160
            }, {
                name: 'description',
                fieldLabel: 'Description',
                width: 160
            }, {
                name: 'address',
                fieldLabel: 'Address',
                width: 160
            }]
        }]
    },

    filterProperties: [{
        property: 'all',
        text: 'All',
        isDefault: true
    }, {
        property: 'name',
        text: 'Name'
    }, {
        property: 'description',
        text: 'Description'
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
            dataIndex: 'name',
            width:200,
            text: 'Name'
           
        }, {
            dataIndex: 'locationTypes',
            width: 200,
            text: 'Type'

        }, {
            dataIndex: 'addressToString',
            text: 'Address',
            flex:1

        }]
    }

   
});