/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.orderAttribute.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
   
    requires: ['Taco.model.OrderAttribute', 'Taco.store.OrderAttributes'/*, 'Taco.view.attribute.Edit'*/],

    addContentViewPadding: true,

    modelName: 'Taco.model.OrderAttribute',
    store: {
        type: 'Taco.store.OrderAttributes'
    },
    editorName: 'Taco.view.orderAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Order Attributes',
    enableSearch: false,
    enableSearchBarInHeader: false,
    enableNavHeader: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    createButtonEnabled: true,
    createButtonText: 'Create New Order Attributes',

    title: 'Order Attributes',

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
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }]
    },

    doCreate: function() {
        var controller = 'orderattributes';
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    }
    
 
})