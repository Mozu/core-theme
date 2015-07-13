/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.view.attribute.Grid',
    alias: "widget.taco-attribute-index"
});

/*Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: "widget.taco-attribute-index",
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes', 'Taco.view.attribute.Edit'],

    modelName: 'Taco.model.Attribute',
    store: {
        type: 'Taco.store.Attributes'
    },
    editorName: 'Taco.view.attribute.Edit',
    filterProperty: 'name',
    typeName: 'Attribute',

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    gridPanelConf: {
        stateful: true,
        stateId: 'statefulProductAttributeGrid',
        columns: [{
            dataIndex: 'adminName',
            stateId: 'adminName',
            text: 'Administration Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'name',
            stateId: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120

        }, {
            dataIndex: 'id',
            stateId: 'id',
            hidden: true,
            text: 'ID',
            minWidth: 200
        }, {
            dataIndex: 'code',
            stateId: 'code',
            hidden: true,
            
            text: 'Code',
            minWidth: 200
        }, {
            dataIndex: 'inputType',
            stateId: 'inputType',
            sortable: false,
            text: 'Input Type',
            width: 130
        }, {
            text: 'Type',
            stateId: 'type',
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

    initComponent: function () {
        this.callParent(arguments);
    },
    
    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('attributes/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
})*/