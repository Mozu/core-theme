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
                name: 'orderNumber',
                fieldLabel: 'Order Number',
                width: 160
            }, {
                name: 'billingContactFirstName',
                fieldLabel: 'First Name',
                width: 160
            }, {
                name: 'billingContactLastName',
                fieldLabel: 'Last Name',
                width: 160
            }, {
                name: 'billingContactAddress',
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
            dataIndex: 'id',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'locationTypeName',
            text: 'Type'
            
        }, {
            dataIndex: 'name',
            text: 'Name'
           
        }, {
            dataIndex: 'addressString',
            text: 'Address',
            flex:1

        }]
    }

   
});