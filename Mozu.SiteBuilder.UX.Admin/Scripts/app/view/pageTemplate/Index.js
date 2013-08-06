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
    requiresContextOfType: 's',
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
    initComponent: function () {
        var me = this;
        me.header = {
            title: 'Customers',
            actions: [
                //no buttons
                //add the create btn when that UI is created
            ]
        };
        this.callParent(arguments);
    },
    launchLoadedEditor: function (record, options) {

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('site/templates/' + record.get('id') );
        }, 1, this);
        return;


    }
    
});
