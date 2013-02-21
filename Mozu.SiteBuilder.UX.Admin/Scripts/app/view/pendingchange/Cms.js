/**
 * @class Taco.view.pendingchange.Cms
 */
Ext.define('Taco.view.pendingchange.Cms', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: ['Taco.model.CmsDocumentDraft', 'Taco.store.CmsDocumentDrafts', 'Taco.core.ux.action.PrimarySplitButton'],

    typeName: 'Pending Changes',
    modelName: 'Taco.model.CmsDocumentDraft',
    storeName: 'Taco.store.CmsDocumentDrafts',
    filterProperty: 'productName',
    useTilePanel: false,

    publishAllText: "Publish All",
    
    publishAll: function (type) {
        var me = this;        me.store.publishAll(type, function () {
            var notice = type ? 'All ' + type + ' changes published!' : 'All changes published!'
            Taco.app.fireEvent('setmessage', notice, 'success');
            me.store.reload();
        });
    },

    header: {
        actions: [
        {
            xtype: 'secondarybutton',
            text: 'Discard All',
            listeners: {
                click: function () { console.log(this, arguments); }
            }
        }, {
            xtype: 'primarysplitbutton',
            itemId: 'publishAll',
            text: '',
            textTpl: new Ext.XTemplate('<span>{text} <em>({count} items)</em></span>'),
            handler: function() {
                this.getParentPage().publishAll();
            },
            updateCount: function (obj) {
                this.setText([this.textTpl.apply(obj)]);
            },
            initComponent: function () {
                var me;
                this.menu = new Ext.menu.Menu({
                    plain: true,
                    items: [
                    { plain: true, text: 'Publish all pages and templates', handler: function () { me.publishAll(); } },
                    { plain: true, text: 'Publish all pages', handler: function () { me.publishAll('page'); } },
                    { plain: true, text: 'Publish all templates', handler: function () { me.publishAll('template'); } }
                    ]
                });
                this.callParent(arguments);
                this.on('boxready', function () {
                    me = this.getParentPage();
                });
            }

        }]
    },

    updateChangeCount: function () {
        this.publishButton = this.publishButton || this.header.getActions().getComponent('publishAll');
        this.publishButton.updateCount({ text: this.publishAllText, count: this.store.count() });
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
