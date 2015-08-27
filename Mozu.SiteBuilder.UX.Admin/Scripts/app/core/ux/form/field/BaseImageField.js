/*

imageSource
imageFileId
imageExternalUrl
imageAltText
borderWidth
borderStyle
borderColor
imageSize
imageWidth
imageHeight
imageClickAction
linkSource
linkExternalUrl
linkInternalUrl
linkFileId


converting to 

imageUrl
imageFileId
imageListId
altText
height
width
linkUrl



*/

Ext.define('Taco.core.ux.form.field.BaseImageField', {
    extend: 'Ext.form.field.Base',
    // alias: ['widget.taco-imagefield'],
    requires: [
        'Taco.core.ux.form.ColorField'
    ],
    // height: 300,
    //  width: 800,
    minHeight: 300,
    inputType: 'hidden',
    mode: 'mozufilter',
    showGutter: true,
    allowStyles: true,
    dataFormat: 'imageObject', //or urlOnly
    allowAltText: true,
    initComponent: function() {
        var me = this;
        me.on('render', function() {
            me.getImageContainerEl().on('click', me.showImageEditor, me);
            me.getImageLabelEl().on('click', me.showImageEditor, me);
        });

        //me.on('click', function (cmp) {
        //    console.log('click');

        //});
        this.callParent(arguments);
    },
    showImageEditor: function() {
        var me = this,
            data = {},
            mdl;
        data = me.convertForEditor(me.getValue());
        mdl = Ext.create('Taco.core.ux.form.field.BaseImageField.ImageModal', {
            autoShow: true,
            closeAction: 'destroy',
            widgetData: data,
            allowStyles: this.allowStyles,
            title: 'Edit Image',
            allowAltText: this.allowAltText,
            listeners: {
                savesuccess: function(modal, imageData) {
                    me.setValue(me.convertForStorage(imageData));
                }
            }
        });
    },

    convertForEditor: function(value) {
        value = value || {};
        var ret;
        if (Ext.isString(value)) {
            value = {
                imageUrl: value
            };
        }

        ret = {
            imageFileId: value.imageId,
            imageAltText: value.altText,
            imageWidth: value.width,
            imageHeight: value.height,
            linkExternalUrl: value.linkUrl
        };

        if (value.imageId) {
            ret.imageSource = 'file';
        } else {
            ret.imageSource = 'externalUrl';
            ret.imageExternalUrl = value.imageUrl;
        }
        if (value.width) {
            ret.imageSize = 'specificSize';
        }


        return ret;
    },

    convertForStorage: function(value) {
        var ret,
            siteId = Taco.app.context.getContextAtLevel('s').id,
            tenantId = Taco.app.context.getTenantId();
        value = value || {};
        ret = {
            imageId: value.imageFileId,
            imageListId: value.imageFileId ? 'files@mozu' : undefined,
            altText: value.imageAltText,
            width: value.imageWidth,
            height: value.imageHeight,
            linkUrl: value.linkExternalUrl
        };
        if (value.imageSource === 'externalUrl') {
            if (!value.imageExternalUrl) {
                return null;
            }
            ret.imageUrl = value.imageExternalUrl;
        }
        if (value.imageSource === 'file') {
            if (!value.imageFileId) {
                return null;
            }
            ret.imageUrl = '//' + Taco.cdnPrefix + '/' + tenantId + '-' + siteId + '/cms/files/' + value.imageFileId;
            //2083-2116/cms/7332/files/b1bf3cab-1d7c-42f8-901a-bff60b56d778?size=60
        }

        if (this.dataFormat === 'urlOnly') {
            return ret.imageUrl;
        }
        return ret;
    },


    getEditorId: function() {
        return this.getInputId() + '-editor';
    },

    getEditorEl: function() {
        var me = this;
        me.editorEl = me.editorEl || me.el.getById(me.getEditorId());
        return me.editorEl;
    },
    getValue: function() {
        return this.value;
    },
    //  fieldSubTpl:[],
    setValue: function(value) {
        var me = this,
            data,
            ret = me.mixins.field.setValue.call(me, value);

        if (me.getImageEl()) {
            data = me.getSubTplData();
            me.getImageEl().setVisible(!!data.imageUrl)
            me.getImageEl().dom.setAttribute('src', data.imageUrl);
        }

        return ret;

    },
    setValueInternal: function(value) {
        var me = this,
            data,
            ret;

        ret = me.mixins.field.setValue.call(me, value);
        if (me.getImageEl()) {
            data = me.getSubTplData();
            me.getImageEl().setVisible(!!data.imageUrl)
            me.getImageEl().dom.setAttribute('src', data.imageUrl);
        }
        return ret;
    },
    getInputEl: function() {
        if (!this.getEl()) {c
            return null;
        }
        this.inputEl = this.inputEl || this.getEl().getById(this.getInputId());
        return this.inputEl;
    },
    getImageEl: function() {
        if (!this.getEl()) {
            return null;
        }
        this.imageEl = this.imageEl || this.getEl().getById(this.getInputId() + '-img');
        return this.imageEl;
    },
    getImageContainerEl: function() {
        if (!this.getEl()) {
            return null;
        }
        this.imageCntEl = this.imageCntEl || this.getEl().getById(this.getInputId() + '-cnt');
        return this.imageCntEl;
    },
    getImageLabelEl: function() {
        if (!this.getEl()) {
            return null;
        }
        this.imageLblEl = this.imageLblEl || this.getEl().getById(this.getInputId() + '-label');
        return this.imageLblEl;
    },


    fieldSubTpl: ['<div style="cursor:pointer;border:2px solid #dddfdf;height:200px;width:200px;background-image: url(\'/admin/scripts/resources/images/image.png\');background-repeat: no-repeat;background-position: center;" id="{id}-cnt"> <img id="{id}-img" src="{imageUrl}" alt="click to edit"  style="max-height:195px;max-width:195px;{[values.imageUrl ? "":"display:none"]}" ></div><div id="{id}-label" style="cursor:pointer;margin-left: 60px;">click to edit</div>'],
    getSubTplData: function() {
        var templateData = this.callParent(arguments),
            value = this.getValue();

        if (Ext.isString(value) && value) {
            templateData.imageUrl = value || null;
        } else {
            templateData.imageUrl = value && value.imageUrl ? value.imageUrl : null;
        }

        return templateData;
    },


});


/**
 * @class Taco.view.website.widgetEditors.Image
 * @author Jimmy Sanford
 *
 * An image widget.
 */

Ext.define('Taco.core.ux.form.field.BaseImageField.ImageModal', {
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
    allowStyles: true,
    //allowBlankAltText: false,
    initComponent: function() {

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
            hidden: !this.allowStyles,
            text: 'Content',
            toggleGroup: 'imageWidgetTabs',
            allowDepress: false,
            enableToggle: true,
            pressed: true,
            scope: this,
            style: {
                borderRadius: '2px 0px 0px 2px'
            },
            handler: function() {
                this.getForm().getLayout().setActiveItem(0);
            }
        }, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            hidden: !this.allowStyles,
            text: 'Style',
            toggleGroup: 'imageWidgetTabs',
            allowDepress: false,
            enableToggle: true,
            scope: this,
            style: {
                borderRadius: '0px 2px 2px 0px'
            },
            handler: function() {
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
                                fn: function(field, newValue) {
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
                        toggleHandler: function(button, state) {
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
                    hidden: !this.allowAltText,
                    fieldLabel: 'Alt Text',
                    //validator :function (value) {
                    //    me.getForm().findField('imageFileId').setValue(value);

                    //}
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
                                ['stretch', 'Stretch'],
                                ['specificSize', 'Specify']
                            ],
                            listeners: {
                                change: {
                                    scope: this,
                                    fn: function(field, newValue) {
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
                        }]
                    },



                    {
                        xtype: 'radiogroup',
                        fieldLabel: 'Choose one of the following:',
                        columns: 2,
                        hidden: true,
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
                                fn: function(fieldgroup, newValue) {
                                    this.handleImageClickActionChange(newValue);
                                }
                            }
                        }
                    }



                ]
            }]
        });

        this.callParent(arguments);

        this.mon(this.imageStore, {
            datachanged: {
                scope: this,
                fn: function(store) {
                    var record = store.first(),
                        value = record ? record.getId() : null;

                    this.getForm().getForm().findField('imageFileId').setValue(value);
                }
            }
        });

        this.mon(this.linkStore, {
            datachanged: {
                scope: this,
                fn: function(store) {
                    var record = store.first(),
                        value = record ? record.getId() : null;

                    this.getForm().getForm().findField('linkFileId').setValue(value);
                }
            }
        });
        this.setValues();
        // this.handleImageSourceChange(this.getForm().findField('imageSource').getValue());
        //  this.handleImageSizeChange(this.getForm().findField('imageSize').getValue());
    },

    handleImageClickActionChange: function(newValue) {
       
    },

    handleImageSizeChange: function(newValue) {
        this.down('[name=imageWidth]').setVisible(newValue === 'specificSize');
        this.down('[name=imageHeight]').setVisible(newValue === 'specificSize');
    },

    handleImageSourceChange: function(newValue) {
        var isFile = newValue === 'file',
            cardIndex = isFile ? 0 : 1;

        this.down('#imageAssociatorButton').setVisible(isFile);
        this.down('#imageUploadButton').setVisible(isFile);
        this.down('[name=imageExternalUrl]').setVisible(newValue === 'externalUrl');

        this.down('#imageSelectors').getLayout().setActiveItem(cardIndex);
    },

    handleLinkSourceChange: function(newValue) {
        var isFile = newValue === 'file',
            cardIndex = isFile ? 2 : 0;

        if (newValue === 'internalUrl') {
            cardIndex = 1;
        }

   
    },

    handleUploadFile: function(files) {
        this.down('#imageField').onUploadFile(files);
    },

    toggleAssociator: function(state, button, store) {
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
                    fn: function(dialog, records) {
                        var urls;

                        urls = Ext.Array.each(records, function(record, index) {
                            if (index === 0) {
                                store.removeAll();
                                store.add(record);
                            }
                        }, this);
                    }
                },
                close: {
                    scope: this,
                    fn: function() {
                        button.toggle(false);

                        Ext.destroy(this.associatorListeners);
                    }
                }
            });
        } else if (this.associator) {
            this.associator.hide();
        }
    },

    setValues: function() {
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

    },

    /**
     * Cleanup.
     *
     * @private
     */
    beforeDestroy: function() {
        Ext.destroy(this.associator, this.imageStore);
    }
});