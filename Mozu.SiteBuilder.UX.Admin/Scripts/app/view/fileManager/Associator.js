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
        'Taco.shared.store.Files'
    ],

    autoShow: true,
    primaryText: 'Select',
    title: 'File Manager',

    mixins: {
        savable: 'Taco.shared.util.Uploadable'
    },

    initComponent: function () {
        var selModel = new Ext.selection.CheckboxModel;

        this.selected = selModel.selected;

        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.shared.store.Files', {
            autoSync: true
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            selModel: selModel,
            store: this.store,
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

    primaryHandler: function () {
        if (this.fireEvent('beforesave', this) !== false) {
            this.fireEvent('save', this, this.selected.getRange());
            this.close();
        }
    }
});
