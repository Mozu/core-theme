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
                    fieldLabel: 'code',
                    width: 160
                }
            ]
        }]
    },

    filterProperties: [{
        property: 'all',
        text: 'All',
        isDefault: true
    }, {
        property: 'orderNumber',
        text: 'Order Number'
    }, {
        property: 'billingContactFirstName',
        text: 'First Name'
    }, {
        property: 'billingContactLastName',
        text: 'Last Name'
    }, {
        property: 'billingContactAddress',
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
            width:200
            
        }]
    }

   
});