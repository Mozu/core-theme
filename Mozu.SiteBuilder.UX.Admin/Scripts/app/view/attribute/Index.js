/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: "widget.taco-attribute-index",
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes', 'Taco.view.attribute.Edit'],

  
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },
    

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
                itemId:'createbutton',
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
            dataIndex: 'adminName',
            text: 'Administration Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120

        }, {
            dataIndex: 'id',
            hidden: true,
            text: 'ID',
            minWidth: 200
        }, {
            dataIndex: 'code',
            hidden: true,
            
            text: 'Code',
            minWidth: 200
        }, {
            dataIndex: 'inputType',
            sortable: false,
            text: 'Input Type',
            width: 130
        }, {
            text: 'Type',
            width: 200,
            sortable: false,
            renderer :function (value, metaData, record) {
                ret = [];
                if (record.get('isOption')) {
                    ret.push('Option')
                }
                if (record.get('isExtra')) {
                    ret.push('Extra')
                }
                if (record.get('isProperty')) {
                    ret.push('Property')
                }
                return ret.join(', ');
            }




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
            Taco.core.StateManager.attemptNavigate('attributes/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
})