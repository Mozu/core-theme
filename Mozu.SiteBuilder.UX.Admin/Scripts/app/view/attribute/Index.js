/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes', 'Taco.view.attribute.Edit'],

    requiresContextOfType: ['c', 's'],

    modelName: 'Taco.model.Attribute',
    store: {
        type: 'Taco.store.Attributes'
    },
    editorName: 'Taco.view.attribute.Edit',
    filterProperty: 'name',
    typeName: 'Attribute',
    initComponent: function () {
        var me = this;
        me.header = {
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Attribute',
                click: function () {
                    Taco.core.StateManager.attemptNavigate('attributes/create');
                }
            }]
        };
        this.callParent(arguments);
    },

    gridPanelConf: {
        columns: [{
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'id',
            text: 'Attribute ID',
            minWidth: 200,
            hidden: true
        }, {
            dataIndex: 'inputType',
            text: 'Input Type',
            width: 130
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
    },
    
    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('attribute/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
})