/**
 * @class Taco.view.locationType.Index
 */
Ext.define('Taco.view.redirects.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.RedirectEntry',
        'Taco.store.RedirectEntries'
    ],
    typeName: 'Redirects',
    gridHeaderLabel: 'Redirects',

    //editorName: 'Taco.view.locationType.Edit',

    //plural: false,
    modelName: 'Taco.model.RedirectEntry',

    store: { type: 'Taco.store.RedirectEntries' },

    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,

    // default data to use when creating new entity
    defaultRowEditingData: {        
        
    },

    useTilePanel: false,
   
    // hide the serach field
    filterProperties: null,

    gridPanelConf: {
        selModel: {},

        columns: [{
                dataIndex: 's',
                text: 'Source',
                editor: {
                    emptyText: "Source",
                    msgTarget: "qtip",
                    // optional enhancement to rowEditor. Makes the field only editable during a create;
                    editableOnCreateOnly: true,
                    selectOnFocus: true,
                    allowBlank: false
                },

                width: 200
            }, {
                dataIndex: 'd',
                editor: {
                    emptyText: "Destination",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: false
                },
                text: 'Destination',
                flex: 1
            },
            {
                dataIndex: 'rw',
                editor: {
                    xtype: 'checkboxfield'
                },
                text: 'Rewrite',
                width: 100
            }]
    },
    initComponent: function () {
        this.header = this.header || {};

        this.uploadButton = Ext.create('Ext.form.field.File', {
            buttonOnly: true,
            hideLabel: true,
            hidden: true,
            name: 'file',
            listeners: {
                'change': function (fb, v) {
                    this.scope.onUploadFile(fb.fileInputEl.dom.files);
                }
            },
            scope: this
        });

        this.importForm = Ext.create('Ext.form.Panel',
            {
                hidden: true,
                url: '/admin/app/redirects/import',
                items: [this.uploadButton]
            });

        this.header.actions = [           
            {
                xtype: 'button',
                text: 'Import',
                scale: 'medium',
                ui: 'action',
                hidden: !this.allowCreate(),
                handler: function () {
                    this.uploadButton.fileInputEl.dom.click();
                },
                scope: this
            }, {
                xtype: 'button',
                text: 'Export',
                scale: 'medium',
                ui: 'action',
                hidden: !this.allowCreate(),
                handler: this.onExport,
                scope: this
            }, {
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Add Redirect',
                itemId: 'newbutton',
                hidden: !this.allowCreate(),
                handler: this.onRowEditorCreate,
                scope: this
            }
        ];
        this.callParent(arguments);

        this.add(this.importForm);
    },
    onImport: function () {
        this.importForm.submit({
            success: function (form, action) {
                Ext.Msg.alert('Success', action.result.message);
            },
            failure: function (form, action) {
                Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
            }
        });
    },
    onExport: function () {
        window.location.href = '/admin/app/redirects/export';

    }
});