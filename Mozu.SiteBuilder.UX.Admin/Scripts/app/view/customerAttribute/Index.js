/**
 * @class Taco.view.customerAttribute.Index
 */

Ext.define('Taco.view.customerAttribute.Index', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: ['Taco.model.CustomerAttribute', 'Taco.store.CustomerAttributes', 'Taco.view.customerAttribute.Edit'],

    

    modelName: 'Taco.model.CustomerAttribute',
    store: {
        type: 'Taco.store.CustomerAttributes'
    },
    editorName: 'Taco.view.customerAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Customer Attributes',
    title: 'Customer Attributes',
    stateful: true,
    stateId: 'statefulCustomerAttributesGrid',
    enableSearch: false,
    enableNavHeader: true,
    enableSearchBarInHeader: false,
    addContentViewPadding: true,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    createButtonText: 'Create New Custom Attribute',

    initComponent: function() {

        this.columns = [ 
            {
                dataIndex: 'adminName',
                stateId: 'adminName',
                text: 'Name',
                flex: 1,
                minWidth: 120
            }, 
            {
                dataIndex: 'displayGroup',
                stateId: 'displayGroup',
                text: 'Display Group',
                flex: 1,
                minWidth: 120
            }, 
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [
                    {
                        text: 'Edit',
                        menuColumnHandler: 'editMenuColumnHandler'
                    }, 
                    {
                        text: 'Delete',
                        menuColumnHandler: 'destroyMenuColumnHandler'
                    }
                ]
            }
        ];
        
        this.callParent(arguments);
    },

    doCreate : function (){
        var controller = 'customerAttribute';
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },

    onCreate: Ext.emptyFn
   
})