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
        'Taco.shared.store.Files',
        'Taco.core.ux.form.TextField',
        'Taco.core.ux.form.FileInputButton',
        'Taco.view.fileManager.AdvancedSearchForm'
    ],

    mixins: {
        uploadable: 'Taco.shared.util.Uploadable'
    },
    enableRowEditing: true,
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 's', 'c']
    },

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.fileManager.AdvancedSearchForm'
    },

    typeName: 'File Manager',
    gridHeaderLabel: 'File',
    plural: false,
    modelName: 'Taco.shared.model.File',
    store: {
        type: 'Taco.shared.store.Files'
    },
    useTilePanel: true,

    allowNavigation: false,

    gridPanelConf: {
        columns: [{
                xtype: 'templatecolumn',
                header: 'Image',
                tpl: [
                    '<div class="taco-basegrid-thumbnail">',
                    '<tpl if="localthumbnail">',
                    '<img height="60" src="{localthumbnail}">',
                    '<tpl elseif="thumbnail && fileSize">',
                    '<img height="60" src="{thumbnail}?size=60" />',
                    '</tpl>',
                    '</div>'
                ]
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
                width: 260,
            },
            {
                text: 'Tags',
                dataIndex: 'tags',
                renderer: function (value, metaData, record) {
                    return (Ext.isEmpty(value) ? ['...'] : value).join(', ');
                },
                flex: 1,

                editor: {
                    xtype: 'boxselect',
                    // width: 22,
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: false,
                    createNewOnEnter: true,
                    createNewOnBlur: true,
                    queryMode: 'local',
                    store: ['a','aa'],  //tbd get tag store data driven
               
                }            
            },
            {
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
            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [{
                        text: 'Delete',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'destroy'
                        },
                        menuColumnHandler: 'destroyMenuColumnHandler'
                    }
                ]
            }],
        
        // selType: 'cellmodel',
       //plugins: [
        //    Ext.create('Ext.grid.plugin.RowEditing', {
        //        clicksToEdit: 2,
        //        listeners: {
        //            edit: function (editor, e) {
        //                console.log('edit', arguments);
        //                this.grid.store.sync();
        //            },
        //            canceledit:function () {
        //                console.log('canceledit', arguments);
        //            },
        //            validateedit:function () {
        //                console.log('validateedit', arguments);
        //            }
        //        }
        //    })
        //]
    },

    initComponent: function () {
        var editor;
        this.header = {
            actions: [
                //{
                //xtype: 'secondarybutton',
                //text: 'Manage Tags',
                //click: this.manageTags,
                //scope: this
                //},
                {
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

        editor = this.down('grid').plugins[0];

        //hack to properlty align the stoopid save cancel buttons next under the editors.
        editor.on('beforeedit', function (editor) {
            if (!editor.getEditor().rendered) {
                editor.getEditor().layout.align = 'top';
            }
        });


        editor.on('validateedit', function (ed, context) {

            //hack to get around the editor reading the enter keydown event before the boxselect can
            if (context.field == 'tags' && context.newValues["tags"] != ed.approvedValue) {

                Ext.defer(function () {
                    if (ed.getEditor().down('[name=\'tags\']').getValue() == context.newValues["tags"]) {
                        ed.approvedValue = context.newValues["tags"];
                        ed.completeEdit();
                    }
                }, 500);
                return false;
            }
            ed.approvedValue = null;

            return true;

        });

    },
   
    //removes create operations and returns false if 
    onBeforeSyncStore: function (operations) {
        delete operations.create;
        return operations.update || operations.destroy;

    }
});