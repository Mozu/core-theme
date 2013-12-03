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
        'Taco.store.NavigationTreeNodes'
    ],

    title: 'Image',

    autoShow: false,
    width: 580,
    height: 640,

    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;

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
                        type: 'hbox'
                    },
                    items: [{
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Select Existing',
                        enableToggle: true,
                        scope: this,
                        toggleHandler: function (button, state) {
                            this.toggleAssociator(state, button, 'imageUrls');
                        }
                    }, {
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Upload',
                        margin: '0 0 0 10'
                    }, {
                        xtype: 'textfield',
                        name: 'imageUrls',
                        hideMode: 'offsets',
                        margin: '0 0 0 10',
                        flex: 1,
                        hidden: true
                    }]
                }, {
                    xtype: 'component',
                    cls: 'taco-image-dropzone',
                    html: 'Drag and drop images here',
                    margin: '20 0 0',
                    height: 160
                }, {
                    xtype: 'textarea',
                    fieldLabel: 'Image Caption'
                }, {
                    xtype: 'textarea',
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
                        xtype: 'textfield',
                        name: 'borderColor',
                        fieldLabel: 'Border Color',
                        value: 'Black',
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
                                    field.nextSibling('[name=imageWidth]').setVisible(newValue === 'Specific Size');
                                    field.nextSibling('[name=imageHeight]').setVisible(newValue === 'Specific Size');
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
                                fieldgroup.nextSibling('#urlFields').setVisible(newValue.imageClickAction === 'url');
                            }
                        }
                    }
                }, {
                    xtype: 'container',
                    itemId: 'urlFields',
                    hidden: true,
                    items: [{
                        xtype: 'combobox',
                        name: 'urlType',
                        margin: '0 0 10',
                        width: 260,
                        editable: false,
                        forceSelection: true,
                        value: 'External URL',
                        store: ['External URL', 'Internal URL', 'File'],
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, newValue, oldValue) {
                                    var associatorButton = field.nextSibling().down('#associatorButton'),
                                        cardIndex = (newValue === 'Internal URL') ? 1 : 0;

                                    if (newValue === 'File') {
                                        cardIndex = 2;
                                        associatorButton.show();
                                    } else {
                                        associatorButton.hide();
                                    }

                                    field.nextSibling('#urlSelectors').getLayout().setActiveItem(cardIndex);
                                }
                            }
                        }
                    }, {
                        xtype: 'container',
                        layout: {
                            type: 'hbox'
                        },
                        items: [{
                            xtype: 'textfield',
                            name: 'clickThroughUrl',
                            emptyText: 'http://',
                            margin: '0 0 10',
                            flex: 1
                        }, {
                            xtype: 'button',
                            itemId: 'associatorButton',
                            ui: 'action',
                            scale: 'medium',
                            glyph: 'XE010@mozicons',
                            margin: '0 0 0 10',
                            width: 57,
                            hidden: true,
                            enableToggle: true,
                            scope: this,
                            toggleHandler: function (button, state) {
                                this.toggleAssociator(state, button, 'clickThroughUrl');
                            }
                        }]
                    }, {
                        xtype: 'container',
                        itemId: 'urlSelectors',
                        height: 160,
                        layout: {
                            type: 'card'
                        },
                        items: [{
                            // Card 0: External URL
                            layout: {
                                type: 'fit'
                            },
                            items: [{
                                xtype: 'component'
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
                                            var textfield = selModel.view.up('form').getForm().findField('clickThroughUrl'),
                                                urls;

                                            urls = Ext.Array.map(records, function (record) {
                                                return record.get('url');
                                            }, this).join(', ');
                                            
                                            textfield.setValue(urls);
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
                                html: 'Drag and drop files here'
                            }]
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

                        urls = Ext.Array.map(records, function (record) {
                            return record.get('url');
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
