/**
 * @class Taco.view.fileManager.Associator
 * @author Travis Johnson
 * The File Manager Browser Modal
 */

Ext.define('Taco.view.fileManager.Associator', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.DragDropZone',
        'Taco.shared.store.Files',
        'Taco.core.ux.form.TextField',
        'Taco.core.ux.form.FileInputButton',
        'Taco.shared.store.Files',
        'Taco.view.fileManager.AdvancedSearchForm'
    ],

    autoShow: true,
    primaryText: Localizer.langResources.SHARED.FileManager.select,
    title: Localizer.langResources.SHARED.FileManager.title,

    mixins: {
        savable: 'Taco.shared.util.Uploadable'
    },
    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.fileManager.AdvancedSearchForm',
        emptySearchText: Localizer.langResources.SHARED.FileManager.empty_search_text
    },
    initComponent: function () {
        var selModel = this.selModel || new Ext.selection.CheckboxModel;
        selModel.pruneRemoved = false;
        selModel.checkOnly = true;

        this.selected = selModel.selected;
        
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.shared.store.Files', {
            autoSync: true
        });

        this.gridPager = Ext.create('Taco.core.ux.grid.LinkPaging', {
            componentCls: 'x-link-paging-toolbar',
            store: this.store,
            displayInfo: true,
            dock: 'bottom'
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            selModel: selModel,
            store: this.store,
            viewConfig: {
                stripeRows: false
            },
            dockedItems: [
                Ext.widget({
                    xtype: 'taco-filtercontainer',
                    width: '100%',
                    flex: 1,
                    advancedForm: this.advancedSearchConfig.form,
                    advancedFormCls: this.advancedSearchConfig.advancedFormCls,
                    store: this.store,
                    style: 'margin-bottom:10px;',
                    filterStores: this.advancedSearchConfig.stores
                }),
                this.gridPager
                
                
            ],
            columns: [{
                xtype: 'templatecolumn',
                header: Localizer.langResources.SHARED.FileManager.image,
                tpl: '<tpl if="localthumbnail"><div class="taco-basegrid-thumbnail"><img height="60" src="{localthumbnail}" /></div><tpl else><div class="taco-basegrid-thumbnail"><img height="60" width="60" src="{thumbnail}?size=60" /></div></tpl>'
            }, {
                    text: Localizer.langResources.SHARED.FileManager.name,
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
                    text: Localizer.langResources.SHARED.FileManager.date_modified,
                
                dataIndex: 'dateModified',
                width: 150,
                renderer: function (val) {
                    return Ext.Date.format(val, 'M j, Y g:i a');
                }
            }, {
                    text: Localizer.langResources.SHARED.FileManager.type,
                sortable: false,
                dataIndex: 'fileType',
                align: 'right',
                renderer: function (val) {
                    return val.toUpperCase();
                }
            }, {
                    text: Localizer.langResources.SHARED.FileManager.size,
                sortable: false,
                dataIndex: 'fileSize',
                align: 'right'
            }],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ]
        });

        this.items = [this.grid];

        this.callParent(arguments);

        this.mon(this.store, {
            beforesync: {
                scope: this,
                fn: 'onBeforeSyncStore'
            }
        });

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
    },

    initFileDrop: function (cmp) {
        var bodyEl = cmp.body.el;

        bodyEl.on({
            scope: this,
            dragenter: function (e) { Taco.app.DragDropZone.allowDrop(); },
            dragleave: function (e) { Taco.app.DragDropZone.disallowDrop(); },
            drop: function (e) {
                var files = e.browserEvent.dataTransfer.files;

                e.stopPropagation();
                e.preventDefault();

                this.fireEvent('filedrop', files, e);
                Taco.app.DragDropZone.disallowDrop();
            }
        });
    },

    /**
     * Removes create operations.
     * @param  {Ext.data.Operation[]} operations Ordered array of operations that will be executed by this batch.
     * @return True if there are any remaining update or destroy operations.
     */
    onBeforeSyncStore: function (operations) {
        delete operations.create;
        return operations.update || operations.destroy;
    },

    validateFiles: function (fileList) {
       
        return true;
    },

    doSave: function () {
        var data = this.grid.getSelectionModel().getSelection();
        this.saveSuccess(data);
    }
});
