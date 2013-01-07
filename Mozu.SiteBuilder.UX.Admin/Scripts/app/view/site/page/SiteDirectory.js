/**
 * @class Taco.view.site.page.SiteDirectory
 */

    Ext.define('Taco.view.site.page.SiteDirectory', {
        extend: 'Ext.Window',
        requires: ['Taco.store.SiteDirectoryNodes', 'Taco.model.SiteDirectoryNode', 'Taco.core.ux.IndentedTreeColumn'],

        closeAction: 'hide',
        shrinkWrap: 3,
        layout: 'fit',
        frame: false,
        border: false,
        bodyBorder: false,
        style: {
            backgroundColor: 'rgb(255, 255, 255)'
        },
        bodyStyle: {
            backgroundColor: 'rgb(255, 255, 255)'
        },

        initComponent: function () {
            var me = this;

            me.store = Ext.create('Taco.store.SiteDirectoryNodes');

            me.tree = Ext.create('Ext.tree.Panel', {
                width: 300,
                height: 300,
                border: false,
                bodyBorder: false,
                overflowY: 'scroll',
                store: me.store,
                displayField: 'name',
                rootVisible: false,
                hideHeaders: true,
                viewConfig: { animate: false },
                columns: [{
                    xtype: 'indentedtreecolumn',
                    text: 'Text',
                    flex: 1,
                    dataIndex: 'name'
                }],
                listeners: {
                    select: function (selector, record) {
                        me.fireEvent('select', record);
                    }
                }

            });
            me.callParent(arguments);
            me.add(me.tree);

            Taco.app.eventbus.on(
                'Taco.model.CmsDocument.savesuccess',
                function () {
                    me.store.load();
                },
                me);


        }


    });
