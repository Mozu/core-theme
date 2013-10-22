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
                name: 'code',
                fieldLabel: 'Code',
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
        property: 'code',
        text: 'Code'
    }, {
        property: 'address',
        text: 'Address'
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
            dataIndex: 'id',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'locationTypes',
            text: 'Type'
            
        }, {
            dataIndex: 'name',
            text: 'Name'
           
        }, {
            dataIndex: 'addressToString',
            text: 'Address',
            flex:1

        }]
    }

   
});