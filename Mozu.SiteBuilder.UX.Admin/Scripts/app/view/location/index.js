/**
 * @class Taco.view.inventory.Index
 */
Ext.define('Taco.view.location.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [],

    typeName: 'Locations',
    gridHeaderLabel: 'Locations',
    plural: false,
    modelName: 'Taco.model.InventoryProduct',
    store: { type: 'Taco.store.Locations' },

   
    useTilePanel: false,
    launchEditorOnClick: false,
    filterFormConf: null,
    header: {
        actions:[]
    },
    gridPanelConf: {
      
        selModel: {},
        columns: [{
            dataIndex: 'code',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'type',
            text: 'Type',
            
        }, {
            dataIndex: 'name',
            text: 'Name',
           
        }, {
            dataIndex: 'address',
            text: 'Address',
            flex:1

        }]
    },

   
});