/**
 * @class Taco.view.settings.paymentGateways.Index
 */

Ext.define('Taco.view.settings.paymentGateways.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
   
    requires: [
        'Taco.model.PaymentGateway',
        'Taco.store.PaymentGateways'
    ],
    
    modelName: 'Taco.model.PaymentGateway',

    store: {
        type: 'Taco.store.PaymentGateways'
    },

    title: 'Payment Gateways',
    createButtonText: 'Add New Gateway',
    createRoute: 'settings/paymentgatewayscreate',
    editorRoute: 'settings/paymentgatewaysedit',

    addContentViewPadding: true,

    enableNavHeader: true,
    
    createButtonEnabled: true,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    launchEditorOnClick: true,

    hideSearchToolbar: true,

    enableSearchBarInHeader: false,

    advancedSearchConfig: {
        emptySearch: 'Search'
    },

    onCreate: function () {
        return Taco.core.StateManager.attemptNavigate(this.createRoute);
    },

    initComponent: function () {
        var me = this;

        this.columns = me.getColumnConfig();

        me.callParent(arguments);

    },

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };
        
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(this.editorRoute + '/' + record.getId(), complexMetaData);
        }, 1, this);
    },

    deleteItemMsg: 'Are you sure you want to delete this payment gateway? Please update Payment Types settings for any sites that are currently using this gateway.',

    getColumnConfig : function() {
        var me = this;
        
        return [{
            dataIndex: 'name',
            stateId: 'name',
            text: 'Nickname',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'gatewayDefinitionName',
            stateId: 'gatewayDefinitionName',
            text: 'Gateway',
            flex: 1,
            minWidth: 120
        }, {
            xtype: 'taco.menucolumn',
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: function (item, eventData) {
                    me.launchLoadedEditor(eventData.record);
                }
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }];
    }
    
 
})