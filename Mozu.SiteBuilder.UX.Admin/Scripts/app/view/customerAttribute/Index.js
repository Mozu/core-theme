/**
 * @class Taco.view.customerAttribute.Index
 */

Ext.define('Taco.view.customerAttribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',

    requires: ['Taco.model.CustomerAttribute', 'Taco.store.CustomerAttributes', 'Taco.view.customerAttribute.Edit'],

    

    modelName: 'Taco.model.CustomerAttribute',
    store: {
        type: 'Taco.store.CustomerAttributes'
    },
    editorName: 'Taco.view.customerAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Customer Attributes',


    gridPanelConf: {
        columns: [ {
            dataIndex: 'adminName',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'isRequired',
            text: 'Required',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'displayGroup',
            text: 'Display Group',
            flex: 1,
            minWidth: 120
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }]
    }
    
   
})