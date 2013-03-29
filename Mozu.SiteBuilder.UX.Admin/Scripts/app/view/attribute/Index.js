/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes', 'Taco.view.attribute.Edit'],

    modelName: 'Taco.model.Attribute',
    store: {
        type: 'Taco.store.Attributes'
    },
    editorName: 'Taco.view.attribute.Edit',
    filterProperty: 'name',
    typeName: 'Attribute',

    gridPanelConf: {
        columns: [{
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        },
            {
                dataIndex: 'id',
                text: 'att id',
                minWidth: 200
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
    }
})