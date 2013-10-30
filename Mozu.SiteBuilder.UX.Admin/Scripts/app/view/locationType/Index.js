/**
 * @class Taco.view.locationType.Index
 */
Ext.define('Taco.view.locationType.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [
        'Taco.store.LocationTypes',
        'Taco.model.LocationType'
    ],

    typeName: 'Location Types',
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
                // optional enhancement to rowEditor. Makes the field only editable during a create;
                editableOnCreateOnly: true,
                selectOnFocus: true,
                allowBlank: false
            },
            
            width: 200
        }, {
            dataIndex: 'name',
            editor: {
                emptyText: "Name",
                selectOnFocus: true,
                allowBlank: false
            },
            text: 'Name',
            flex:1
            
        }]
    }

   
});