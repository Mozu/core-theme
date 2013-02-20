/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes'],

    typeName: 'Attribute',
    modelName: 'Taco.model.Attribute',
    storeName: 'Taco.store.Attributes',
    editorName: 'Taco.view.attribute.Edit',
    filterProperty: 'name',

    gridPanelConf: {
        columns: [{
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120,
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
             }
        }, {
            dataIndex: 'inputType',
            text: 'Input Type',
            width: 130
        }]
    }
})