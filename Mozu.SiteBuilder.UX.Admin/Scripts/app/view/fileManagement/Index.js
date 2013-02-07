/**
 * @class Taco.view.fileManagement.Index
 */
Ext.define('Taco.view.fileManagement.Index', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.filemanagementditor',
    requires: ['Taco.core.ux.form.FileInputButton', 'Taco.model.FileManagementFolder', 'Taco.model.FileManagementFile', 'Taco.core.ux.DragDropZone', 'Taco.core.ux.action.PrimaryButton', 'Taco.store.FileManagementFiles', 'Taco.store.FileManagementFolders', 'Taco.core.ux.action.SecondaryButton', 'Taco.core.FormPanel', 'Taco.core.ux.Hint', 'Taco.view.fileManagement.GridPanel', 'Taco.view.fileManagement.FolderTree'],
    mixins: {
        savable: 'Taco.view.fileManagement.Savable'
    },
    tabs: [],
    title: 'Title',
    data: undefined,
    flex: 1,

    model: '',
    type: '',
    recordId: undefined,

    displayAssociations: [],
    initComponent: function () {
        var me = this;
        me.header = {
            title: 'My Files',
            actions: [{
                xtype: 'tacofilefield',
                text: 'Upload',
                listeners: {
                    filechange: me.onSaveFiles,
                    scope: me
                }
            }]
        };

        me.foldersStore = Ext.create('Taco.store.FileManagementFolders', {
            autoSync: true
        });
        me.filesStore = Ext.create('Taco.store.FileManagementFiles', {
            autoSync: false,
            autoLoad: true
        });
        
        me.gridpanel = Ext.create('Taco.view.fileManagement.GridPanel', {
            store: me.filesStore,
            itemId: 'filelist',
            listeners: {
                deletefile: function (v, index, idx, action, e, record) {
                    var panel = this;
                    me.itembrowser.fireEvent('deletefile', panel, record);
                },
                downloadfile: function (v, index, idx, action, e, record) {
                    var panel = this;
                    me.itembrowser.fireEvent('downloadfile', panel, record);
                },
                filedrop: {
                    fn: me.onSaveFiles,
                    scope: me
                }
            }
        });

        me.tilepanel = Ext.create('Taco.core.ux.TilePanel', {
            store: me.filesStore,
            actions: [{
                iconCls: 'delete',
                tooltip: 'Delete File',
                eventName: 'deletefile'
            }, {
                iconCls: 'download',
                tooltip: 'Download File',
                eventName: 'downloadfile'
            }],
            listeners: {
                deletefile: function (view, record) {
                    var panel = this;
                    me.itembrowser.fireEvent('deletefile', panel, record);
                },
                downloadfile: function (view, record) {
                    var panel = this;
                    me.itembrowser.fireEvent('downloadfile', panel, record);
                },
                filedrop: {
                    fn: me.onSaveFiles,
                    scope: me
                }
            }
        });

        me.foldertree = Ext.create('Taco.view.fileManagement.FolderTree', {
            store: me.foldersStore,
            region: 'west',
            split: true,
            flex: 0.3,
            itemId: 'foldertree',
            listeners: {
                filedrop: {
                    fn: me.onSaveFiles,
                    scope: me
                },
                selectionchange: function (view, models, eOpts) {
                    if (models && models.length > 0) {
                        me.down('#filelist').setFolder(models[0]);
                    }
                }
            }
        });

        me.itembrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
            uniquePanels: [me.gridpanel, me.tilepanel],
            commonPanels: [me.foldertree],
            itemStore: me.filesStore,
            itemType: 'files',
            filterProperty: 'name',
            flex: 1,
            listeners: {
                deletefile: function (panel, record) {
                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        text: 'Are you sure you want to delete this File?',

                        listeners: {
                            confirm: function () {
                                me.filesStore.remove(record);
                                record.destroy();
                            },
                            scope: this
                        }
                    });
                },
                downloadfile: function (panel, record) {
                    window.open('/admin/download/files/' + record.getId());
                }
            }
        });

        me.body = {
            items: [me.itembrowser]
        };
        this.callParent(arguments);
        me.addFolderBtn = me.down('#addFolderBtn');
    }
});
