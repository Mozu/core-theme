/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.pageTemplate.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.pageTemplateIndex',
    requires: ['Taco.model.PageTypeDefinition'],

    typeName: 'Page Template',
    modelName: 'Taco.model.PageTypeDefinition',
    // storeName: 'Taco.store.Products',
    // editorName: 'Taco.view.product.Edit',
    filterProperty: 'displayName',
    store: { model: 'Taco.model.PageTypeDefinition' },
    gridPanelConf: {
        columns: [{
            dataIndex: 'displayName',
            text: 'Name',
            flex: 1,
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            }
        }, {
            dataIndex: 'pageType',
            text: 'Page Type',
            minWidth: 120,
            width: 120
        }, {
            dataIndex: 'entityType',
            text: 'entity Type',
            minWidth: 120,
            width: 120
        },
             {
                 dataIndex: 'isDefault',
                 text: 'Is Default',
                 minWidth: 120,
                 width: 120,
                 xtype: 'booleancolumn',
                 trueText: 'Yes',
                 falseText: 'No'
                 
             }]
    },
    onItemClick: function (view, record, elm, index, e) {
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            Taco.core.StateManager.attemptNavigate('site/templates/' + record.get('id'));
        }
    }
});
