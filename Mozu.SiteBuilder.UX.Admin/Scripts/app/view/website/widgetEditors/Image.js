/**
 * @class Taco.view.website.widgetEditors.Image
 * @author Jimmy Sanford
 *
 * An image widget.
 */

Ext.define('Taco.view.website.widgetEditors.Image', {
    extend: 'Taco.view.website.WidgetEditor',
    alias: 'widget.taco-image-widgeteditor',
    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.form.field.SingleImageField',
        'Taco.store.NavigationTreeNodes',
        'Taco.view.fileManager.Associator'
    ],

    title: 'Image',

    autoShow: false,
    width: 580,
    height: 600,

    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;

        this.imageStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'url'],
            data: []
        });

        this.linkStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'url'],
            data: []
        });

        this.tools = [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Content',
            toggleGroup: 'imageWidgetTabs',
            allowDepress: false,
            enableToggle: true,
            pressed: true,
            scope: this,
            style: {
                borderRadius: '2px 0px 0px 2px'
            },
            handler: function () {
                this.getForm().getLayout().setActiveItem(0);
            }
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Style',
            toggleGroup: 'imageWidgetTabs',
            allowDepress: false,
            enableToggle: true,
            scope: this,
            style: {
                borderRadius: '0px 2px 2px 0px'
            },
            handler: function () {
                this.getForm().getLayout().setActiveItem(1);
            }
        }];

        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'card'
            },
            items: [{
                xtype: 'formform',
                title: 'Content',
                header: false,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'bottom'
                    },
                    items: [{
                        xtype: 'combobox',
                        name: 'imageSource',
                        value: 'file',
                        width: 170,
                        editable: false,
                        forceSelection: true,
                        store: [
                            ['file', 'File'],
                            ['externalUrl', 'External URL']
                        ],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    this.handleImageSourceChange(newValue);
                                }
                            }
                        }
                    }, {
                        xtype: 'button',
                        itemId: 'imageAssociatorButton',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Select Existing',
                        margin: '0 0 0 15',
                        enableToggle: true,
                        scope: this,
                        toggleHandler: function (button, state) {
                            this.toggleAssociator(state, button, this.imageStore);
                        }
                    }, {
                        xtype: 'tacofilefield',
                        itemId: 'imageUploadButton',
                        text: 'Upload',
                        margin: '0 0 0 15',
                        buttonConfig: {
                            ui: 'action',
                            scale: 'medium'
                        },
                        listeners: {
                            filechange: this.handleUploadFile,
                            scope: this
                        }
                    }, {
                        xtype: 'textfield',
                        name: 'imageFileId',
                        hideMode: 'offsets',
                        margin: '0 0 0 15',
                        flex: 1,
                        hidden: true
                    }, {
                        xtype: 'textfield',
                        name: 'imageExternalUrl',
                        hideMode: 'offsets',
                        emptyText: 'http://',
                        margin: '0 0 0 15',
                        flex: 1,
                        hidden: true
                    }]
                }, {
                    xtype: 'container',
                    itemId: 'imageSelectors',
                    padding: '10 0 0',
                    height: 170,
                    layout: {
                        type: 'card'
                    },
                    items: [{
                        // Card 0: File
                        layout: {
                            type: 'fit'
                        },
                        items: [{
                            xtype: 'taco-singleimagefield',
                            height: 160,
                            itemId: 'imageField',
                            store: this.imageStore
                        }]
                    }, {
                        // Card 1: External URL
                        layout: {
                            type: 'fit'
                        },
                        items: [{
                            xtype: 'component',
                            height: 160
                        }]
                    }]
                }, {
                //     xtype: 'textarea',
                //     name: 'imageCaption',
                //     fieldLabel: 'Image Caption'
                // }, {
                    xtype: 'textarea',
                    name: 'imageAltText',
                    fieldLabel: 'Alt Text'
                }]
            }, {
                xtype: 'formform',
                title: 'Style',
                header: false,
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'combobox',
                        name: 'borderWidth',
                        fieldLabel: 'Border Width',
                        editable: false,
                        forceSelection: true,
                        width: 170,
                        value: '1px',
                        store: ['1px', '2px', '3px']
                    }, {
                        xtype: 'combobox',
                        name: 'borderStyle',
                        fieldLabel: 'Border Style',
                        margin: '0 0 0 15',
                        editable: false,
                        forceSelection: true,
                        width: 170,
                        value: 'Solid',
                        store: ['Solid', 'Dashed', 'Dotted', 'None']
                    }, {
                        xtype: 'colorfield',
                        name: 'borderColor',
                        fieldLabel: 'Border Color',
                        margin: '0 0 0 15',
                        width: 170
                    }]
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'combobox',
                        name: 'imageSize',
                        fieldLabel: 'Image Size',
                        width: 260,
                        editable: false,
                        forceSelection: true,
                        value: 'stretch',
                        store: [
                            ['stretch', 'Fill Area'],
                            ['maintain', 'Maintain Aspect']
                        ],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    this.handleImageSizeChange(newValue);
                                }
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        name: 'imageWidth',
                        fieldLabel: 'Width',
                        margin: '0 0 0 15',
                        width: 125,
                        hidden: true
                    }, {
                        xtype: 'textfield',
                        name: 'imageHeight',
                        fieldLabel: 'Height',
                        margin: '0 0 0 15',
                        width: 125,
                        hidden: true
                    }, {
                        xtype: 'hidden',
                        name: 'height',
                        value: 400
                    }]
                }, {
                    xtype: 'radiogroup',
                    fieldLabel: 'Choose one of the following:',
                    columns: 2,
                    vertical: true,
                    items: [{
                        name: 'imageClickAction',
                        inputValue: 'lightbox',
                        boxLabel: 'Open larger image in a lightbox'
                    }, {
                        name: 'imageClickAction',
                        inputValue: 'url',
                        boxLabel: 'Navigate to a click-through URL'
                    }, {
                        name: 'imageClickAction',
                        inputValue: '',
                        boxLabel: 'Do nothing'
                    }],
                    listeners: {
                        change: {
                            scope: this,
                            fn: function (fieldgroup, newValue, oldValue) {
                                this.handleImageClickActionChange(newValue);
                            }
                        }
                    }
                }, {
                    xtype: 'container',
                    itemId: 'linkFields',
                    padding: '2 0 0',
                    hidden: true,
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'combobox',
                        name: 'linkSource',
                        width: 170,
                        editable: false,
                        forceSelection: true,
                        value: 'externalUrl',
                        store: [
                            ['externalUrl', 'External URL'],
                            ['internalUrl', 'Internal URL'],
                            ['file', 'File']
                        ],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    this.handleLinkSourceChange(newValue);
                                }
                            }
                        }
                    }, {
                        xtype: 'button',
                        itemId: 'linkAssociatorButton',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Select Existing',
                        margin: '0 0 0 15',
                        hidden: true,
                        enableToggle: true,
                        scope: this,
                        toggleHandler: function (button, state) {
                            this.toggleAssociator(state, button, this.linkStore);
                        }
                    }, {
                        xtype: 'tacofilefield',
                        itemId: 'linkUploadButton',
                        text: 'Upload',
                        margin: '0 0 0 15',
                        hidden: true,
                        buttonConfig: {
                            ui: 'action',
                            scale: 'medium'
                        }
                    }, {
                        xtype: 'textfield',
                        name: 'linkExternalUrl',
                        emptyText: 'http://',
                        margin: '0 0 0 15',
                        flex: 1,
                        hidden: false
                    }, {
                        xtype: 'textfield',
                        name: 'linkInternalUrl',
                        margin: '0 0 0 15',
                        flex: 1,
                        hidden: true
                    }, {
                        xtype: 'textfield',
                        name: 'linkFileId',
                        margin: '0 0 0 15',
                        flex: 1,
                        hidden: true
                    }]
                }, {
                    xtype: 'container',
                    itemId: 'linkSelectors',
                    padding: '10 0 0',
                    height: 170,
                    layout: {
                        type: 'card'
                    },
                    items: [{
                        // Card 0: External URL
                        layout: {
                            type: 'fit'
                        },
                        items: [{
                            xtype: 'component',
                            height: 160
                        }]
                    }, {
                        // Card 1: Internal URL
                        layout: {
                            type: 'fit'
                        },
                        items: [{
                            xtype: 'treepanel',
                            componentCls: 'taco-website-tree',
                            hideHeaders: true,
                            rootVisible: false,
                            useArrows: true,
                            store: Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes'),
                            columns: [{
                                xtype: 'treecolumn',
                                flex: 1,
                                dataIndex: 'name',
                                renderer: function (value, metaData, record) {
                                    return '<span class="taco-website-tree-icon"></span><span>' + value + '</span>';
                                }
                            }],
                            listeners: {
                                selectionchange: {
                                    scope: this,
                                    fn: function (selModel, records) {
                                        var field = this.getForm().getForm().findField('linkInternalUrl'),
                                            urls;

                                        urls = Ext.Array.map(records, function (record) {
                                            return record.get('url');
                                        }, this).join(', ');
                                        
                                        field.setValue(urls);
                                    }
                                }
                            }
                        }]
                    }, {
                        // Card 2: File
                        layout: {
                            type: 'fit'
                        },
                        items: [{
                            xtype: 'taco-singleimagefield',
                            height: 160,
                            store: this.linkStore
                        }]
                    }]
                }]
            }]
        });

        this.callParent(arguments);

        this.mon(this.imageStore, {
            datachanged: {
                scope: this,
                fn: function (store) {
                    var record = store.first(),
                        value = record ? record.getId() : null;

                    this.getForm().getForm().findField('imageFileId').setValue(value);
                }
            }
        });

        this.mon(this.linkStore, {
            datachanged: {
                scope: this,
                fn: function (store) {
                    var record = store.first(),
                        value = record ? record.getId() : null;

                    this.getForm().getForm().findField('linkFileId').setValue(value);
                }
            }
        });
    },

    handleImageClickActionChange: function (newValue) {
        var isUrl = newValue.imageClickAction === 'url';

        console.log(isUrl ? 'url' : 'not url');
        this.down('#linkFields').setVisible(isUrl);
        this.down('#linkSelectors').setVisible(isUrl);
    },

    handleImageSizeChange: function (newValue) {
        this.down('[name=imageWidth]').setVisible(newValue === 'specificSize');
        this.down('[name=imageHeight]').setVisible(newValue === 'specificSize');

        if (newValue === 'fill') {
            this.widgetData.heightResizable = true;
        }

        this.widgetData.heightResizable = newValue === 'fill';
        this.widgetData.height = newValue === 'fill' ? 400 : 'auto';
    },

    handleImageSourceChange: function (newValue) {
        var isFile = newValue === 'file',
            cardIndex = isFile ? 0 : 1;

        this.down('#imageAssociatorButton').setVisible(isFile);
        this.down('#imageUploadButton').setVisible(isFile);
        this.down('[name=imageExternalUrl]').setVisible(newValue === 'externalUrl');
        this.down('#imageSelectors').getLayout().setActiveItem(cardIndex);
    },

    handleLinkSourceChange: function (newValue) {
        var isFile = newValue === 'file',
            cardIndex = isFile ? 2 : 0;

        if (newValue === 'internalUrl') cardIndex = 1;

        this.down('#linkAssociatorButton').setVisible(isFile);
        this.down('#linkUploadButton').setVisible(isFile);
        this.down('[name=linkInternalUrl]').setVisible(newValue === 'internalUrl');
        this.down('[name=linkExternalUrl]').setVisible(newValue === 'externalUrl');
        this.down('#linkSelectors').getLayout().setActiveItem(cardIndex);
    },

    handleUploadFile: function (files) {
        this.down('#imageField').onUploadFile(files)
    },

    toggleAssociator: function (state, button, store) {
        if (state) {
            if (!this.associator) {
                this.associator = Ext.create('Taco.view.fileManager.Associator', {});
            } else {
                this.associator.show();
            }

            this.associatorListeners = this.mon(this.associator, {
                destroyable: true,
                savesuccess: {
                    scope: this,
                    fn: function (dialog, records) {
                        var urls;

                        urls = Ext.Array.each(records, function (record, index) {
                            if (index === 0) {
                                store.removeAll();
                                store.add(record);
                            }
                        }, this);
                    }
                },
                close: {
                    scope: this,
                    fn: function (dialog) {
                        button.toggle(false);

                        Ext.destroy(this.associatorListeners);
                    }
                }
            });
        } else if (this.associator) {
            this.associator.hide();
        }
    },

    setValues: function () {
        var data;

        this.callParent(arguments);

        data = this.widgetData;

        if (data.imageSource === 'file' && data.imageFileId) {
            this.imageStore.add({
                id: data.imageFileId,
                url: ['/cms/', Taco.app.context.currentCtx.id, '/files/', data.imageFileId].join('')
            });
        }

        this.handleImageClickActionChange(data);
        this.handleImageSizeChange(data.imageSize);
        this.handleImageSourceChange(data.imageSource);
        this.handleLinkSourceChange(data.linkSource);
    },

    /**
     * Cleanup.
     * 
     * @private
     */
    beforeDestroy: function () {
        Ext.destroy(this.associator, this.imageStore, this.linkStore);
    }
});
