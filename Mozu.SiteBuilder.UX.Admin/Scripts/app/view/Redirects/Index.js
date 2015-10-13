/**
 * @class Taco.view.locationType.Index
 */
Ext.define('Taco.view.redirects.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.RedirectEntry',
        'Taco.store.RedirectEntries'
    ],
    typeName: 'Redirect',
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

    initComponent: function () {

        var me = this;

        this.gridPanelConf = {
            selModel: {},
            stateful: true,
            stateId: 'statefulRedirectsGrid',
            columns: [
                {
                    dataIndex: 's',
                    text: 'Source',
                    stateId: 'source',
                    editor: {
                        emptyText: 'Source',
                        msgTarget: 'qtip',
                        // optional enhancement to rowEditor. Makes the field only editable during a create;
                        editableOnCreateOnly: true,
                        selectOnFocus: true,
                        allowBlank: false
                    },
                    width: 200,
                    align: 'left'
                }, 
                {
                    dataIndex: 'd',
                    stateId: 'destination',
                    editor: {
                        emptyText: 'Destination',
                        msgTarget: 'qtip',
                        selectOnFocus: true,
                        allowBlank: false
                    },
                    text: 'Destination',
                    flex: 1,
                    align: 'left'
                },
                {
                     dataIndex: 'e',
                     stateId: 'enabled',
                     editor: {
                         xtype: 'checkboxfield'
                     },
                     renderer: this.checkboxRenderer,
                     text: 'Active',
                     width: 100,
                     align: 'center'
                },
                {
                    dataIndex: 'rw',
                    stateId: 'rewrite',
                    editor: {
                        xtype: 'checkboxfield'
                    },
                    renderer: this.checkboxRenderer,
                    text: 'Rewrite',
                    width: 100,
                    align: 'center'
                }, 
                {
                    dataIndex: 'q',
                    stateId: 'qs',
                    editor: {
                        xtype: 'checkboxfield'
                },
                    renderer: this.checkboxRenderer,
                    text: 'Copy Query String',
                    width: 100,
                    align: 'center'
                },
                {
                    dataIndex: 't',
                    stateId: 'temp',
                    editor: {
                        xtype: 'checkboxfield'
                    },
                    renderer: this.checkboxRenderer,
                    text: 'Temporary',
                    width: 100,
                    align: 'center'
                },
                {
                     dataIndex: 'p',
                     stateId: 'prior',
                     editor: {
                         xtype: 'numberfield'
                     },
                     text: 'Priority',
                     width: 100,
                     align: 'left'
                 },
                 {
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
        };

        this.header = this.header || {};

        this.uploadButton = Ext.create('Ext.form.field.File', {
            buttonOnly: true,
            hideLabel: true,
            hidden: true,
            name: 'file',
            listeners: {
                afterrender: function (cmp) {
                    // cmp.triggerWrap.on('click', me.showWarningModal, me);
                },
                change: function (cmp, v) {
                    if (this.store && this.store.getCount() > 0)  {
                        this.getModal();
                    }
                    else {
                        this.onImport();
                    }
                },
                scope: this
               
            }
        });

        this.importForm = Ext.create('Ext.form.Panel', {
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

        this.rowEditor.on('edit', function(cmp, row, e) { 
            if (row.record.phantom) {
                row.record.save({
                    success: function() {
                        me.store.reload();
                    }
                });
            }
        }, this);

        this.add(this.importForm);
    },

    checkboxRenderer: function(val) {
            var checked = val ? 'checked' : '';

            return '<input type="button" role="checkbox" class="x-form-checkbox-glyph ' + checked + ' x-form-field x-form-checkbox x-form-cb x-grid-cell-inner x-tree-checkbox">';
    },

    getModal: function() {
        var me = this;

        var modal = Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: 'Replace Redirects?',
            modal: true,
            closeAction: 'destroy',
            height: 250,
            primaryText: 'Yes, Continue',
            items: [{
                xtype: 'container',
                layout: { 
                    type: 'hbox' 
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: 'You are about to upload a new redirects file — all previous redirects and settings will be replaced with the newly uploaded file.<br><br> Do you want to continue?'
                    })
                ]
            }],
            listeners: {
                aftersaveclose: function() {
                    me.onImport();
                },
                aftercancelclose: function() {
                    me.uploadButton.reset();
                }
            }
        });

        modal.show();
    },
    onImport: function () {
        this.importForm.submit({
            success: function (form, action) {
               // Ext.Msg.alert('Success', action.result.message);
                Taco.app.fireEvent('setmessage', 'imported', 'info');
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