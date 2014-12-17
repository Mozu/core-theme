/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.orderAttribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
   
    requires: ['Taco.model.OrderAttribute', 'Taco.store.OrderAttributes'/*, 'Taco.view.attribute.Edit'*/],

   

    modelName: 'Taco.model.OrderAttribute',
    store: {
        type: 'Taco.store.OrderAttributes'
    },
    editorName: 'Taco.view.orderAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Order Attributes',


    gridPanelConf: {
        stateful: true,
        stateId: 'statefulOrderAttributesGrid',
        columns: [{
            dataIndex: 'adminName',
            stateId: 'adminName',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'isRequired',
            stateId: 'isRequired',
            text: 'Required',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'displayGroup',
            stateId: 'displayGroup',
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