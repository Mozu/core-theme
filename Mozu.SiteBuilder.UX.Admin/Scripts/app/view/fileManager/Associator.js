/**
 * @class Taco.view.fileManager.Associator
 * @author Travis Johnson
 * The File Manager Browser Modal
 */

Ext.define('Taco.view.fileManager.Associator', {
    extend: 'Taco.core.ux.modal.BrowserModal',

    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.DragDropZone',
        'Taco.shared.store.Files',
        'Taco.core.ux.form.TextField',
        'Taco.core.ux.form.FileInputButton',
        'Taco.shared.store.Files'
    ],

    mixins: {
        savable: 'Taco.shared.util.Uploadable'
    },

    typeName: 'FileManagementFile',
    modelName: 'Taco.shared.model.File',
    store: {
        type: 'Taco.shared.store.Files',
        autoSync: true
    },
    useTilePanel: true,

    title: 'Associator',

    allowNavigation: false,

    gridPanelConf: {
        columns: [{
            xtype: 'templatecolumn',
            header: 'Image',
            tpl: '<tpl if="localthumbnail"><div class="taco-basegrid-thumbnail"><img width="60" src="{localthumbnail}" /></div><tpl else><div class="taco-basegrid-thumbnail"><img width="60" src="{thumbnail}?size=60" /></div></tpl>'
        }, {
            text: 'Name',
            editor: {
                xtype: 'taco.textfield',
                listeners: {
                    aftersetvalue: function (field, val) {
                        var index = val.lastIndexOf('.');

                        if (index < 1) {
                            return;
                        }

                        field.suspendEvents(false);
                        field.selectText(0, index);

                        Ext.defer(function () {
                            field.resumeEvents();    
                        }, 100);
                        
                    }
                }
            },
            dataIndex: 'name',
            flex: 1
        }, {
            text: 'Date Modified',
            dataIndex: 'dateModified',
            width: 150,
            renderer: function (val) {
                return Ext.Date.format(val, 'M j, Y g:i a');
            }
        }, {
            text: 'Type',
            dataIndex: 'fileType',
            align: 'right',
            renderer: function (val) {
                return val.toUpperCase();
            }
        }, {
            text: 'Size',
            dataIndex: 'fileSize',
            align: 'right'
        }],
        selType: 'cellmodel',
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            })
        ],
    },

    initComponent: function () {

        this.header = {
            actions: [{
                xtype: 'secondarybutton',
                text: 'Manage Tags',
                click: this.manageTags,
                scope: this
            }, {
                xtype: 'tacofilefield',
                text: 'Upload',
                listeners: {
                    filechange: this.onUploadFile,
                    scope: this
                }
            }]
        };

        this.callParent(arguments);

        this.mon(this.store, 'beforesync', this.onBeforeSyncStore, this);

    },
    //removes create operations and returns false if 
    onBeforeSyncStore: function (operations) {
        delete operations.create;
        return operations.update || operations.destroy;

    },

    show: function (selectedItems) {
        // TODO: Select items based on the array passed in.
        return this.callParent(arguments);
    }
});