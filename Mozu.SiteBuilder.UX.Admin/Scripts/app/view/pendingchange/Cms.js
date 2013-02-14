/**
 * @class Taco.view.pendingchange.Cms
 */
Ext.define('Taco.view.pendingchange.Cms', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: ['Taco.model.CmsDocumentDirty', 'Taco.store.CmsDocumentsDirty'],

    typeName: 'Pending Changes',
    modelName: 'Taco.model.CmsDocumentDirty',
    storeName: 'Taco.store.CmsDocumentsDirty',
    filterProperty: 'productName',
    useTilePanel: false,

    publishAllText: "Publish All",

    header: {
        actions: [
        {
            xtype: 'secondarybutton',
            text: 'Discard All',
            listeners: {
                click: function () { console.log(this, arguments); }
            }
        },{
            xtype: 'primarybutton',
            itemId: 'publishAll',
            text: '',
            tpl: ['<span>{text} <em>({count} items)</em></span>'],
            listeners: {
                click: function () {
                    this.store.publishAll();
                }
            }
        }]
    },

    updateChangeCount: function () {
        this.publishButton = this.publishButton || this.header.getActions().getComponent('publishAll');
        this.publishButton.update({ text: this.publishAllText, count: this.store.count() });
    },

    initComponent: function() {
        this.callParent(arguments);
        this.mon(this.store, 'datachanged', this.updateChangeCount, this);
        this.store.load();
        this.updateChangeCount();
    },

    gridPanelConf: {
        columns: [{
            dataIndex: 'id',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'name',
            text: 'Name',
            minWidth: 120,
            flex: 1
        }, {
            dataIndex: 'publishState',
            text: 'Modification',
            width: 120
        }
        ]
    }
});
