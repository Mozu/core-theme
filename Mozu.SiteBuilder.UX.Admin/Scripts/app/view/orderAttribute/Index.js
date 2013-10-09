/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.orderAttribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.OrderAttribute', 'Taco.store.OrderAttributes'/*, 'Taco.view.attribute.Edit'*/],

    requiresContextOfType: ['c', 's'],

    modelName: 'Taco.model.OrderAttribute',
    store: {
        type: 'Taco.store.OrderAttributes'
    },
    editorName: 'Taco.view.orderAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Order Attributes',
    initComponent: function () {
        var me = this;
        me.header = {
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Attribute',
                click: function () {
                    Taco.core.StateManager.attemptNavigate('orderattribute/create');
                }
            }]
        };
        this.callParent(arguments);
    },

    gridPanelConf: {
        columns: [{
            dataIndex: 'code',
            text: 'Code',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'required',
            text: 'required',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'displaygroup',
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
                text: 'Hide in website',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }]
    },
    
    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('orderattribute/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
})