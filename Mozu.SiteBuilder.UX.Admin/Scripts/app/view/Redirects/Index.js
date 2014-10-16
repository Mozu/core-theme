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
    requiresContextOfType: 's',
    
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    
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
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                width: 100,
                menuItems: [{
                    text: 'Delete',
                    requiredBehaviors: {
                        model: 'Taco.model.RedirectEntry',
                        behavior: 'destroy'
                    },
                    menuColumnHandler: function (item, eventData) {
                        eventData.record.destroy();
                    }
                }]
            }
        ]
    },
    initComponent: function () {
        this.header = this.header || {};

        this.uploadButton = Ext.create('Ext.form.field.File', {
            buttonOnly: true,
            hideLabel: true,
            hidden: true,
            name: 'file',
            listeners: {
                afterrender: function (cmp) {
                    //cmp.fileInputEl.set({accept: '.csv'});
                },
                change: function (cmp, v) {
                    this.onImport();
                   // cmp.fileInputEl.set({ accept: '.csv' });
                },
                scope: this
               
            }
        });

        this.importForm = Ext.create('Ext.form.Panel',
            {
                hidden: true,
                url: '/admin/app/redirects/import?siteId='+ Taco.app.context.getSiteId(),
                items: [this.uploadButton]
            });
        this.header = Ext.apply({}, this.header);
        this.header.actions = [
            {
                xtype: 'button',
                text: 'Import',
                scale: 'medium',
                ui: 'action',
                hidden: !this.allowCreate(),
                margin: '0 0 0 15',
                handler: function () {
                    this.uploadButton.fileInputEl.set({ accept: '.csv' });
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
                margin: '0 0 0 15',
                scope: this
            }, {
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Add Redirect',
                itemId: 'createActionButton',
                hidden: !this.allowCreate(),
                margin: '0 0 0 15',
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
               // Ext.Msg.alert('Success', action.result.message);
                Taco.app.fireEvent('setmessage', 'imported', 'status');
                this.store.reload();

            },
            failure: function (form, action) {
               // Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                Taco.app.fireEvent('setmessage', 'Failed:' + action.result ? action.result.message : 'No response', 'error');
            },
            scope:this
        });
    },
    onExport: function () {
        window.location.href = '/admin/app/redirects/export?siteid=' + Taco.app.context.getSiteId();

    }
    
});