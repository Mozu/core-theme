/**
 * @class Taco.view.locationType.Index
 */
Ext.define('Taco.view.locationType.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.LocationType',
        'Taco.store.LocationTypes'
    ],
    typeName: 'Location Type',
    gridHeaderLabel: 'Location Types',
    
    //editorName: 'Taco.view.locationType.Edit',
    
    //plural: false,
    modelName: 'Taco.model.LocationType',
    
    store: { type: 'Taco.store.LocationTypes' },
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,

    // default data to use when creating new entity
    defaultRowEditingData: {
    
    },
    
    useTilePanel: false,
    //launchEditorOnClick: false,
    
    /*
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
                    fieldLabel: 'Code',
                    width: 160
                }
            ]
        }]
    },
    */
    // hide the serach field
    filterProperties: null,

    /*
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
        }
    ],
    */

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
                emptyText: "Code",
                msgTarget: "qtip",
                // optional enhancement to rowEditor. Makes the field only editable during a create;
                editableOnCreateOnly: true,
                selectOnFocus: true,
                allowOnlyWhitespace: false
            },
            
            width: 200
        }, {
            dataIndex: 'name',
            editor: {
                emptyText: "Name",
                msgTarget: "qtip",
                selectOnFocus: true,
                allowOnlyWhitespace: false
            },
            text: 'Name',
            flex:1
            
        }]
    }

   
});