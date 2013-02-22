/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.producttype',
    requires: ['Taco.model.ProductType'],

    typeName: 'ProductType',
    modelName: 'Taco.model.ProductType',
    storeName: 'Taco.store.ProductTypes',
    editorName: 'Taco.view.productType.Edit',
    filterProperty: 'name',

    gridPanelConf: {
        columns: [{
            dataIndex: 'id',
            text: 'ID',
            width: 100
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120,
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
             }
        }]
    }
});