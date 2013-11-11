/**
 * @class Taco.view.website.Tree
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Tree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.taco-website-tree',
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes'
    ],

    border: false,
    componentCls: 'taco-website-tree',
    hideHeaders: true,
    rootVisible: false,
    useArrows: true,

    initComponent: function () {
        this.addEvents('urlclick', 'additemclick');

        this.columns = [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'name',
            renderer: function (value, metaData, record) {
                var id = record.getId(),
                    isRoot = record.parentNode && record.parentNode.isRoot(),
                    output = '<span class="taco-website-tree-icon"></span><span>' + value + '</span>';
                // output = '<a href="#" class="taco-action-navigate">' + value + '</a>';

                if (isRoot) {
                    output += ('<span class="taco-website-tree-sublink" data-page-creator="true" data-parent-id="' + id + '" >+ Add Page</span>');
                }

                return output;
            }
        }];

        this.callParent(arguments);

        this.on({
            itemclick: {
                scope: this,
                fn: function (tree, record, item, index, e, eOpts) {
                    var url = record.get('url');

                    if (e.target.dataset.pageCreator) {
                        if (record.getId() == '_navigation') {
                            this.fireEvent('additemclick', this, true, record, item, index, e, eOpts);
                        }
                        if (record.getId() == '_unlinked') {
                            this.fireEvent('additemclick', this, false, record, item, index, e, eOpts);
                        }
                    } else if (url) {
                        this.fireEvent('urlclick', this, url, record, item, index, e, eOpts);
                    }
                }
            },
            additemclick: {
                scope: this,
                fn: 'showCreator'
            }
        });
    },

    showCreator: function (tree, linked, record) {
        var me = this,
            pageTypeDefinitionStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions'),
            data = [],
            storeCopy,
            dialog;

        pageTypeDefinitionStore.filter([{ property: "userCreatable", value: true }]);

        // hack to get around filtered store not working... todo spend 5 mins and figure it out
        // storeCopy = Ext.create('Taco.store.PageTypeDefinitions', { data: data });

        dialog = Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            closeAction: 'destroy',
            scale: 'medium',
            title: 'Add a Page',
            items: [{
                xtype: 'form',
                items: [{
                    xtype: 'textfield',
                    allowBlank: false,
                    allowOnlyWhitespace: false,
                    name: 'title',
                    fieldLabel: 'Page Name'
                }, {
                    name: 'docInfo',
                    xtype: 'selectfield',
                    fieldLabel: 'Choose type',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'title',
                    width: 200,
                    emptyText: 'Select',
                    store: pageTypeDefinitionStore
                }]
            }],
            listeners: {
                beforesave: {
                    scope: this,
                    fn: function (dialog) {
                        var values = dialog.getForm().getValues(),
                            cmsDoc;

                        cmsDoc = Ext.create('Taco.model.CmsDocument', {
                            documentType: values.docInfo.documentType,
                            collectionName: values.docInfo.collectionName,
                            name: values.title,
                            items: [{
                                key: "title",
                                value: values.title
                            }, {
                                key: "meta_title",
                                value: values.title
                            }, {
                                key: "page_type_definition",
                                value: values.docInfo
                            }]
                        });

                        cmsDoc.save({
                            success: function () {
                                me.fireEvent('pagecreate', dialog, cmsDoc, linked, record);
                                dialog.close();
                            },
                            failure: function () {
                                Taco.app.fireEvent('setmessage', "Error creating page", 'error');
                            }
                        });

                        return false;
                    }
                }
            }
        });

    }
});