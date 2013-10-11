/**
 * @class Taco.view.customerAttribute.Index
 */

Ext.define('Taco.view.customerAttribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.CustomerAttribute', 'Taco.store.CustomerAttributes', 'Taco.view.customerAttribute.Edit'],

    requiresContextOfType: ['c', 's'],

    modelName: 'Taco.model.CustomerAttribute',
    store: {
        type: 'Taco.store.CustomerAttributes'
    },
    editorName: 'Taco.view.customerAttribute.Edit',
    filterProperty: 'name',
    typeName: 'Customer Attributes',
    initComponent: function () {
        var me = this;
        me.header = {
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Attribute',
                click: function () {
                    Taco.core.StateManager.attemptNavigate('customerattribute/create');
                }
            }]
        };
        this.callParent(arguments);
    },

    gridPanelConf: {
        columns: [{
            dataIndex: 'attributecode',
            text: 'Code',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'isrequired',
            text: 'Required',
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
            Taco.core.StateManager.attemptNavigate('customerattribute/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
})