/**
 * @class Taco.view.fileManager.Index
 * @author Travis Johnson
 * The File Manager Browser Page
 */

Ext.define('Taco.view.fileManager.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
    cls: 'filemanager-header',
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
        advancedFormCls: 'Taco.view.fileManager.AdvancedSearchForm',
        emptySearchText: 'Search'
    },

    title: 'File Manager',
    gridHeaderLabel: 'File',
    enableNavHeader: true,
    plural: false,
    modelName: 'Taco.shared.model.File',
    store: {
        type: 'Taco.shared.store.Files'
    },
    useTilePanel: true,

    addContentViewPadding: true,

    enableSearch: false,

    allowNavigation: false,

    createButtonEnabled: true,
    createButtonText: 'Upload',
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    stateful: true,
    stateId: 'statefulFileManagerGrid',

    initComponent: function() {
        var editor;

        this.createButtonCfg = {
            xtype: 'tacofilefield',
            listeners: {
                filechange: this.onUploadFile,
                scope: this        
            }
        };

        this.columns = [
            {
                sortable: false,
                xtype: 'templatecolumn',
                header: 'Image',
                stateId: 'ImageColumn',
                tpl: [
                    '<div class="taco-basegrid-thumbnail">',
                    '<tpl if="localthumbnail">',
                    '<img height="60" src="{localthumbnail}">',
                    '<tpl elseif="thumbnail && fileSize && this.isImage(fileType)">',
                    '<img height="60" src="{thumbnail}?size=60" />',
                    '</tpl>',
                    '</div>',
                    {
                        isImage: function(fileType) {
                            var imageTypes = ['gif', 'jpeg', 'pjpeg', 'png', 'tiff', 'jpg'];
                            return imageTypes.indexOf(fileType) !== -1;
                        }
                    }
                ]
            }, 
            {
                text: 'Name',
                stateId: "name",
                editor: {
                    xtype: 'taco.textfield',
                    listeners: {
                        aftersetvalue: function(field, val) {
                            var index = val.lastIndexOf('.');

                            if (index < 1) {
                                return;
                            }

                            field.suspendEvents(false);
                            field.selectText(0, index);

                            Ext.defer(function() {
                                field.resumeEvents();
                            }, 100);

                        }
                    }
                },
                dataIndex: 'name',
                width: 260
            }, 
            {
                text: 'Tags',
                sortable: false,
                dataIndex: 'tags',
                stateId: "tags",
                renderer: function(value) {
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
                    store: ['a', 'aa'], //tbd get tag store data driven

                }
            }, 
            {
                text: 'Date Modified',
                dataIndex: 'dateModified',
                stateId: "dateModified",
                width: 150,
                renderer: function(val) {
                    return Ext.Date.format(val, 'M j, Y g:i a');
                }
            }, 
            {
            text: 'Type',
                sortable: false,
                dataIndex: 'fileType',
                stateId: "fileType",
                align: 'right',
                renderer: function(val) {
                    return val.toUpperCase();
                }
            }, 
            {
                text: 'Size',
                sortable: false,
                stateId: "fileSize",
                dataIndex: 'fileSize',
                align: 'right'
            }, 
            {
                xtype: 'taco.menucolumn',
                sortable: false,
                menuItems: [
                    {
                        text: 'Delete',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'destroy'
                        },
                        menuColumnHandler: 'deleteMenuColumnHandler'
                    }, 
                    {
                        text: 'Get Url',
                        menuColumnHandler: function(item, eventData) {
                            window.prompt('Copy to clipboard: Ctrl+C, Enter', 'http://' + window.Taco.cdnPrefix + '/' + Taco.app.context.getTenantId() + '-m' + Taco.app.context.getMasterCatalogId() + '/cms/files/' + eventData.record.getId());
                        }
                    }
                ]
        }];

        this.callParent(arguments);

        this.mon(this.store, 'beforesync', this.onBeforeSyncStore, this);

        this.on({
            boxready: {
                scope: this,
                fn: 'initFileDrop'
            },
            filedrop: {
                scope: this,
                fn: 'onUploadFile'
            }
        });

        editor = this.plugins[0];

        //hack to properlty align the stoopid save cancel buttons next under the editors.
        editor.on('beforeedit', function(editor) {
            if (!editor.getEditor().rendered) {
                editor.getEditor().layout.align = 'top';
            }
        });

        editor.on('validateedit', function(ed, context) {
            //hack to get around the editor reading the enter keydown event before the boxselect can
            if (context.field === 'tags' && context.newValues.tags !== ed.approvedValue) {

                Ext.defer(function() {
                    if (ed.getEditor().down('[name=\'tags\']').getValue() === context.newValues.tags) {
                        ed.editing = true;
                        ed.approvedValue = context.newValues.tags;
                        ed.completeEdit();
                    }
                }, 500);
                return false;
            }
            ed.approvedValue = null;

            return true;

        });

    },

    initFileDrop: function(cmp) {
        var bodyEl = cmp.body.el;

        bodyEl.on({
            scope: this,
            dragenter: function() {
                Taco.app.DragDropZone.allowDrop();
            },
            dragleave: function() {
                Taco.app.DragDropZone.disallowDrop();
            },
            drop: function(e) {
                var files = e.browserEvent.dataTransfer.files;

                e.stopPropagation();
                e.preventDefault();

                this.fireEvent('filedrop', files, e);
                Taco.app.DragDropZone.disallowDrop();
            }
        });
    },

    onItemClick: function () {
        // This is ugly but it fixes bug #68890
        this.rowEditor.editor.componentLayout.owner.body.el.dom.nextSibling.style.top = this.rowEditor.editor.body.dom.style.height;
    },

    //removes create operations and returns false if 
    onBeforeSyncStore: function(operations) {
        delete operations.create;
        return operations.update || operations.destroy;

    },

    validateFiles: function(fileList) {
        return true;
    }
});
