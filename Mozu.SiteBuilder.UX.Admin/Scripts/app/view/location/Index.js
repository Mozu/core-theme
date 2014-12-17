/**
 * @class Taco.view.location.Index
 */
Ext.define('Taco.view.location.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [
        'Taco.store.Locations',
        'Taco.model.Location'
    ],

    // used by create button
    typeName: 'Location',
    
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
            items: [
            {
                name: 'name',
                fieldLabel: 'Name',
                width: 160
            },
            {
                name: 'code',
                fieldLabel: 'Code',
                width: 160
            },
            {
                name: 'state',
                fieldLabel: 'State',
                width: 80
            },
            {
                name: 'postalorzipcode',
                fieldLabel: 'Zip Code',
                width: 80
            },
            {
                name: 'locationtypecode',
                fieldLabel: 'Location Type Code',
                width: 160
            }]
        }]
    },

    /*
    supported  service search fields
    code, type.code, name, state, zip, country, supportsinventory
    */

    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        },
        {
            name: 'name',
            text: 'Name'
        },
        {
            name: 'code',
            text: 'Code'
        },
        {
            name: 'state',
            text: 'State'
        },
        {
            name: 'postalorzipcode',
            text: 'Zip Code'
        },
        {
            name: 'locationtypecode',
            text: 'Location Type Code'
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
        stateId: 'statefulLocationsGrid',
        columns: [{
            dataIndex: 'code',
            stateId: 'code',
            width: 150,
            text: 'Code'

        }, {
            dataIndex: 'name',
            stateId: 'name',
            width:200,
            text: 'Name'
           
        }, {
            width: 200,
            text: "Location Types",
            dataIndex: 'locationTypes',
            stateId: 'locationTypes',
            xtype: "templatecolumn",
            tpl: [
                '<tpl for="locationTypes">',
                    '<tpl if="xindex &gt; 1">, </tpl>{name}',
                '</tpl>'
            ]
        }, {
            dataIndex: 'addressToString',
            stateId: 'address',
            text: 'Address',
            flex:1

        }]
    }

   
});