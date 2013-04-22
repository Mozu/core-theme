/**
 * @class Taco.view.fileManager.Index
 * @author Travis Johnson
 * The File Manager Browser Page
 */

Ext.define('Taco.view.fileManager.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.filemanager',
    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.DragDropZone',
        'Taco.store.Files',
        'Taco.core.ux.form.TextField',
        'Taco.core.ux.form.FileInputButton'
    ],

    mixins: {
        savable: 'Taco.view.fileManager.util.Uploadable'
    },

    typeName: 'File',
    modelName: 'Taco.model.File',
    store: {
        type: 'Taco.store.Files',
        autoSync: true
    },
    useTilePanel: true,

    allowNavigation: false,

    gridPanelConf: {
        columns: [{
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
    }
});