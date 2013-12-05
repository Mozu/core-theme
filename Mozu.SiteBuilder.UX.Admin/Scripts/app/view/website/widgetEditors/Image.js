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
                        value: 'File',
                        width: 170,
                        editable: false,
                        forceSelection: true,
                        store: ['File', 'External URL'],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    var isFile = newValue === 'File',
                                        cardIndex = isFile ? 0 : 1;

                                    field.nextSibling('#imageAssociatorButton').setVisible(isFile);
                                    field.nextSibling('#imageUploadButton').setVisible(isFile);
                                    field.nextSibling('[name=imageExternalUrl]').setVisible(newValue === 'External URL');
                                    this.down('#imageSelectors').getLayout().setActiveItem(cardIndex);
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
                            this.toggleAssociator(state, button, 'imageFileId');
                        }
                    }, {
                        xtype: 'tacofilefield',
                        itemId: 'imageUploadButton',
                        text: 'Upload',
                        margin: '0 0 0 15',
                        buttonConfig: {
                            ui: 'action',
                            scale: 'medium'
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
                            xtype: 'dataview',
                            cls: 'taco-image-dropzone',
                            height: 160,
                            deferEmptyText: false,
                            emptyText: 'Drag and drop an image here',
                            itemSelector: 'div.thumb',
                            store: this.imageStore,
                            tpl: [
                                '<tpl for=".">',
                                    '<div class="thumb" style="background-image: url({url});">',
                                        '<div class="controls"><span class="remove"></span></div>',
                                    '</div>',
                                '</tpl>'
                            ],
                            listeners: {
                                itemclick: {
                                    scope: this,
                                    fn: function (view, record, item, index, e) {
                                        if (e.getTarget('span.remove', 10)) {
                                            this.imageStore.removeAll();
                                        }
                                    }
                                }
                            }
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
                    xtype: 'textarea',
                    name: 'imageCaption',
                    fieldLabel: 'Image Caption'
                }, {
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
                        value: 'Stretch',
                        store: ['Stretch', 'Fill', 'Maintain Aspect Ratio', 'Specific Size'],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    this.down('[name=imageWidth]').setVisible(newValue === 'Specific Size');
                                    this.down('[name=imageHeight]').setVisible(newValue === 'Specific Size');
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
                    }]
                }, {
                    xtype: 'radiogroup',
                    fieldLabel: 'Choose one of the following:',
                    columns: 1,
                    vertical: true,
                    items: [{
                        name: 'imageClickAction',
                        inputValue: 'lightbox',
                        boxLabel: 'Open larger image in a lightbox'
                    }, {
                        name: 'imageClickAction',
                        inputValue: 'url',
                        boxLabel: 'Click-through URL'
                    }],
                    listeners: {
                        change: {
                            scope: this,
                            fn: function (fieldgroup, newValue, oldValue) {
                                var isUrl = newValue.imageClickAction === 'url';

                                this.down('#linkFields').setVisible(isUrl);
                                this.down('#linkSelectors').setVisible(isUrl);
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
                        value: 'External URL',
                        store: ['External URL', 'Internal URL', 'File'],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    var isFile = newValue === 'File';
                                    var cardIndex = isFile ? 2 : 0;

                                    if (newValue === 'Internal URL') cardIndex = 1;

                                    field.nextSibling('#linkAssociatorButton').setVisible(isFile);
                                    field.nextSibling('#linkUploadButton').setVisible(isFile);
                                    field.nextSibling('[name=linkInternalUrl]').setVisible(newValue === 'Internal URL');
                                    field.nextSibling('[name=linkExternalUrl]').setVisible(newValue === 'External URL');
                                    this.down('#linkSelectors').getLayout().setActiveItem(cardIndex);
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
                            this.toggleAssociator(state, button, 'linkFileId');
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
                            xtype: 'component',
                            cls: 'taco-image-dropzone',
                            html: 'Drag and drop files here',
                            height: 160
                        }]
                    }]
                }]
            }]
        });

        this.callParent(arguments);
    },

    toggleAssociator: function (state, button, fieldName) {
        var field = this.getForm().getForm().findField(fieldName);

        if (state) {
            if (!this.associator) {
                this.associator = Ext.create('Taco.view.fileManager.Associator', {});
            } else {
                this.associator.show();
            }

            this.associatorListeners = this.mon(this.associator, {
                destroyable: true,
                save: {
                    scope: this,
                    fn: function (dialog, records) {
                        var urls;

                        urls = Ext.Array.map(records, function (record, index) {
                            if (index === 0) {
                                this.imageStore.removeAll();
                                this.imageStore.add(record);
                            }
                            return record.getId();
                        }, this).join(', ');
                        
                        field.setValue(urls);
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

    /**
     * Cleanup.
     * 
     * @private
     */
    beforeDestroy: function () {
        Ext.destroy(this.associator);
    }
});
